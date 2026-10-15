import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Webhook } from "standardwebhooks";
import { POST } from "@/app/api/webhooks/dodo/route";
import { listingCart, parseDodoEvent, verifyDodoWebhook } from "@/lib/dodo";
import { resetIndexNowMemory } from "@/lib/indexnow";
import { clearJobCache, createSubmission, getJobBySlug, getSubmission } from "@/lib/store";

const SECRET = `whsec_${Buffer.from("designcodejobs-webhook-test-key").toString("base64")}`;

function signedHeaders(body: string, secret = SECRET) {
  const webhook = new Webhook(secret);
  const id = "msg_test_1";
  const timestamp = new Date();
  return {
    "webhook-id": id,
    "webhook-timestamp": String(Math.floor(timestamp.getTime() / 1000)),
    "webhook-signature": webhook.sign(id, timestamp, body),
  };
}

function paymentBody(type: string, extra: Record<string, unknown> = {}) {
  return JSON.stringify({
    business_id: "bus_test",
    type,
    timestamp: new Date().toISOString(),
    data: {
      payment_id: "pay_123",
      metadata: { submission_id: "sub_1", featured: "false" },
      product_cart: [{ product_id: "pdt_standard", quantity: 1 }],
      ...extra,
    },
  });
}

describe("Dodo webhook verification", () => {
  afterEach(() => {
    delete process.env.DODO_PAYMENTS_WEBHOOK_KEY;
    delete process.env.DODO_PAYMENTS_PRODUCT_STANDARD;
    delete process.env.DODO_PAYMENTS_PRODUCT_FEATURED;
  });

  it("accepts a Standard Webhooks signature and rejects a tampered body", async () => {
    process.env.DODO_PAYMENTS_WEBHOOK_KEY = SECRET;
    const body = paymentBody("payment.succeeded");
    const headers = signedHeaders(body);
    await expect(verifyDodoWebhook(body, { get: (name) => headers[name as keyof typeof headers] || null })).resolves.toBeUndefined();
    await expect(
      verifyDodoWebhook(`${body} `, { get: (name) => headers[name as keyof typeof headers] || null }),
    ).rejects.toThrow(/signature/i);
    await expect(verifyDodoWebhook(body, { get: () => null })).rejects.toThrow(/header/i);
  });

  it("reads submission id, payment id, and the featured add-on", () => {
    process.env.DODO_PAYMENTS_PRODUCT_FEATURED = "pdt_featured";
    const featured = parseDodoEvent(
      JSON.parse(
        paymentBody("payment.succeeded", {
          metadata: { submission_id: "sub_1", featured: "true" },
          product_cart: [
            { product_id: "pdt_standard", quantity: 1 },
            { product_id: "pdt_featured", quantity: 1 },
          ],
        }),
      ),
    );
    expect(featured).toEqual({ action: "publish", submissionId: "sub_1", paymentId: "pay_123", featured: true });

    const failed = parseDodoEvent(JSON.parse(paymentBody("payment.failed")));
    expect(failed).toMatchObject({ action: "fail", type: "payment.failed", paymentId: "pay_123", submissionId: "sub_1" });

    const refund = parseDodoEvent({
      type: "refund.succeeded",
      data: { payment_id: "pay_123", refund_id: "ref_9", is_partial: false },
    });
    expect(refund).toEqual({ action: "refund", paymentId: "pay_123" });
  });

  it("builds a cart with the standard product and the featured add-on", () => {
    process.env.DODO_PAYMENTS_PRODUCT_STANDARD = "pdt_standard";
    process.env.DODO_PAYMENTS_PRODUCT_FEATURED = "pdt_featured";
    expect(listingCart(false)).toEqual([{ product_id: "pdt_standard", quantity: 1 }]);
    expect(listingCart(true)).toEqual([
      { product_id: "pdt_standard", quantity: 1 },
      { product_id: "pdt_featured", quantity: 1 },
    ]);
    delete process.env.DODO_PAYMENTS_PRODUCT_FEATURED;
    expect(listingCart(true)).toBeNull();
  });
});

describe("paid publish", () => {
  let storeFile = "";
  const indexNowBodies: string[] = [];

  beforeEach(() => {
    storeFile = path.join(os.tmpdir(), `dcj-store-${Date.now()}-${Math.random().toString(16).slice(2)}.json`);
    process.env.RUNTIME_STORE_PATH = storeFile;
    process.env.DODO_PAYMENTS_WEBHOOK_KEY = SECRET;
    process.env.DODO_PAYMENTS_PRODUCT_FEATURED = "pdt_featured";
    process.env.INDEXNOW_KEY = "10bf5cfa82ac960b7a1d23c83bbf60ab";
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.GOOGLE_INDEXING_CREDENTIALS;
    clearJobCache();
    resetIndexNowMemory();
    indexNowBodies.length = 0;
    vi.stubGlobal("fetch", async (_input: RequestInfo | URL, init?: RequestInit) => {
      indexNowBodies.push(String(init?.body || ""));
      return new Response("", { status: 202 });
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.RUNTIME_STORE_PATH;
    delete process.env.DODO_PAYMENTS_WEBHOOK_KEY;
    delete process.env.DODO_PAYMENTS_PRODUCT_FEATURED;
    delete process.env.INDEXNOW_KEY;
    clearJobCache();
    resetIndexNowMemory();
    fs.rmSync(storeFile, { force: true });
  });

  function deliver(body: string, headers = signedHeaders(body)) {
    return POST(
      new Request("https://designcodejobs.com/api/webhooks/dodo", {
        method: "POST",
        body,
        headers,
      }),
    );
  }

  async function settledIndexNow() {
    await new Promise((resolve) => setImmediate(resolve));
    return indexNowBodies.some((body) => body.includes("/jobs/"));
  }

  it("publishes once, ignores a failed payment, and expires on refund", async () => {
    const submission = await createSubmission({
      email: "ada@example.com",
      companyName: "Vercel",
      companyDomain: "vercel.com",
      title: "UX Engineer",
      location: "Remote - US",
      workplace: "remote",
      descriptionHtml: "<p>Build the design system in React, TypeScript, and Figma. Own component APIs and the documentation site.</p>",
      applyUrl: "https://vercel.com/jobs/ux-engineer",
      salaryMin: 160000,
      salaryMax: 220000,
      salaryCurrency: "USD",
      featured: true,
    });

    const failed = paymentBody("payment.failed", { metadata: { submission_id: submission.id, featured: "true" } });
    const failedResponse = await deliver(failed);
    expect(failedResponse.status).toBe(200);
    expect(await failedResponse.json()).toMatchObject({ published: false });
    expect((await getSubmission(submission.id))?.status).toBe("pending_payment");

    const paid = paymentBody("payment.succeeded", {
      payment_id: "pay_live_1",
      metadata: { submission_id: submission.id, featured: "true" },
      product_cart: [
        { product_id: "pdt_standard", quantity: 1 },
        { product_id: "pdt_featured", quantity: 1 },
      ],
    });
    const first = await deliver(paid);
    expect(first.status).toBe(200);
    const published = await first.json();
    expect(published).toMatchObject({ ok: true, duplicate: false });
    const saved = await getSubmission(submission.id);
    expect(saved?.status).toBe("published");
    expect(saved?.paymentId).toBe("pay_live_1");
    const job = await getJobBySlug(published.slug);
    expect(job?.status).toBe("active");
    expect(job?.featured).toBe(true);
    expect(job?.featuredUntil).toBe(job?.validThrough);
    expect(job?.validThrough).toBeTruthy();
    expect(await settledIndexNow()).toBe(true);
    expect(indexNowBodies.some((body) => body.includes(`/jobs/${published.slug}`))).toBe(true);

    const second = await deliver(paid);
    expect(await second.json()).toMatchObject({ ok: true, duplicate: true, jobId: published.jobId });

    const tampered = await deliver(`${paid} `, signedHeaders(paid));
    expect(tampered.status).toBe(401);

    const refund = JSON.stringify({
      business_id: "bus_test",
      type: "refund.succeeded",
      timestamp: new Date().toISOString(),
      data: { payment_id: "pay_live_1", refund_id: "ref_1", is_partial: false },
    });
    indexNowBodies.length = 0;
    resetIndexNowMemory();
    const refunded = await deliver(refund);
    expect(await refunded.json()).toMatchObject({ ok: true, expired: true });
    expect((await getSubmission(submission.id))?.status).toBe("refunded");
    expect((await getJobBySlug(published.slug))?.status).toBe("expired");
    expect(await settledIndexNow()).toBe(true);
    expect(indexNowBodies.some((body) => body.includes(`/jobs/${published.slug}`))).toBe(true);
  });

  it("keeps a hard-excluded title unpublished and does not publish it again", async () => {
    const submission = await createSubmission({
      email: "ada@example.com",
      companyName: "Hardware Co",
      companyDomain: "hardware.example",
      title: "Mechanical Design Engineer",
      location: "Austin, TX",
      workplace: "onsite",
      descriptionHtml: "<p>Own the mechanical design in SolidWorks and release drawings to manufacturing for the enclosure.</p>",
      applyUrl: "https://hardware.example/jobs/mech",
      salaryMin: null,
      salaryMax: null,
      salaryCurrency: null,
      featured: false,
    });
    const body = paymentBody("payment.succeeded", {
      payment_id: "pay_reject",
      metadata: { submission_id: submission.id, featured: "false" },
    });
    const response = await deliver(body);
    const first = await response.json();
    expect(first.ok).toBe(false);
    expect(first.reason).toMatch(/did not match/);
    const again = await deliver(body);
    expect(await again.json()).toMatchObject({ duplicate: true });
    expect((await getSubmission(submission.id))?.jobId).toBeNull();
  });
});
