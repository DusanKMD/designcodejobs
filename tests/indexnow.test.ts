import { afterEach, describe, expect, it } from "vitest";
import { INDEXNOW_BATCH, indexNowKey, normalizeIndexNowUrls, resetIndexNowMemory, submitIndexNow } from "@/lib/indexnow";
import { jobContentChanged } from "@/lib/store";
import type { Job } from "@/lib/types";

const KEY = "10bf5cfa82ac960b7a1d23c83bbf60ab";

function response(status: number, headers: Record<string, string> = {}) {
  return new Response("", { status, headers });
}

describe("IndexNow", () => {
  const previous = process.env.INDEXNOW_KEY;

  afterEach(() => {
    resetIndexNowMemory();
    if (previous == null) delete process.env.INDEXNOW_KEY;
    else process.env.INDEXNOW_KEY = previous;
  });

  it("accepts the documented key shape and rejects short keys", () => {
    process.env.INDEXNOW_KEY = KEY;
    expect(indexNowKey()).toBe(KEY);
    process.env.INDEXNOW_KEY = "short";
    expect(indexNowKey()).toBeNull();
  });

  it("keeps only canonical https URLs", () => {
    const urls = normalizeIndexNowUrls([
      "https://designcodejobs.com/salary/",
      "https://www.designcodejobs.com/salary",
      "https://designcodejobs.com/salary",
      "http://designcodejobs.com/remote",
      "https://example.com/salary",
      "https://foo.up.railway.app/remote/",
    ]);
    expect(urls).toEqual(["https://designcodejobs.com/salary", "https://designcodejobs.com/remote"]);
  });

  it("batches at 10,000 and posts the key location", async () => {
    process.env.INDEXNOW_KEY = KEY;
    const bodies: string[] = [];
    const urls = Array.from({ length: INDEXNOW_BATCH + 1 }, (_, index) => `https://designcodejobs.com/jobs/role-${index}`);
    const result = await submitIndexNow(urls, {
      force: true,
      maxWaitMs: 0,
      fetchImpl: async (_url, init) => {
        bodies.push(String(init?.body));
        return response(200);
      },
    });
    expect(result.submitted).toBe(INDEXNOW_BATCH + 1);
    expect(bodies).toHaveLength(2);
    const first = JSON.parse(bodies[0]) as { host: string; key: string; keyLocation: string; urlList: string[] };
    expect(first.host).toBe("designcodejobs.com");
    expect(first.key).toBe(KEY);
    expect(first.keyLocation).toBe(`https://designcodejobs.com/${KEY}.txt`);
    expect(first.urlList).toHaveLength(INDEXNOW_BATCH);
    expect(JSON.parse(bodies[1]).urlList).toHaveLength(1);
  });

  it("retries once when Retry-After fits, and does not resubmit the same URL inside 10 minutes", async () => {
    process.env.INDEXNOW_KEY = KEY;
    let calls = 0;
    const fetchImpl: typeof fetch = async () => {
      calls += 1;
      if (calls === 1) return response(429, { "retry-after": "0" });
      return response(202);
    };
    const first = await submitIndexNow(["https://designcodejobs.com/jobs/one"], {
      force: true,
      maxWaitMs: 5_000,
      sleep: async () => {},
      fetchImpl,
    });
    expect(first.batches[0]).toMatchObject({ status: 202, ok: true });
    expect(calls).toBe(2);

    const second = await submitIndexNow(["https://designcodejobs.com/jobs/one"], {
      fetchImpl,
      maxWaitMs: 5_000,
    });
    expect(second.submitted).toBe(0);
    expect(calls).toBe(2);
  });

  it("stops on a 429 it cannot wait out", async () => {
    process.env.INDEXNOW_KEY = KEY;
    const result = await submitIndexNow(["https://designcodejobs.com/jobs/two"], {
      force: true,
      maxWaitMs: 1_000,
      fetchImpl: async () => response(429, { "retry-after": "600" }),
    });
    expect(result.batches[0]).toMatchObject({ status: 429, ok: false, retryAfterMs: 600_000 });
  });

  it("no-ops without a key", async () => {
    delete process.env.INDEXNOW_KEY;
    const result = await submitIndexNow(["https://designcodejobs.com/jobs/three"], { force: true });
    expect(result.skipped).toBe(true);
  });

  it("treats timestamp-only ingest refreshes as unchanged", () => {
    const prev = { title: "Design Engineer", slug: "acme", descriptionHtml: "<p>Hi</p>", status: "active" } as Job;
    const next = { ...prev, updatedAt: "2026-10-15T00:00:00.000Z", lastSeenAt: "2026-10-15T00:00:00.000Z" } as Job;
    expect(jobContentChanged(prev, next)).toBe(false);
    expect(jobContentChanged(prev, { ...next, descriptionHtml: "<p>Updated</p>" })).toBe(true);
  });
});
