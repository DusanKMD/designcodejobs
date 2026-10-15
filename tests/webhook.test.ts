import crypto from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { parseLemonOrder, verifyLemonSignature } from "@/lib/lemonsqueezy";

describe("Lemon Squeezy webhook", () => {
  afterEach(() => {
    delete process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    delete process.env.LEMONSQUEEZY_VARIANT_FEATURED;
  });

  it("accepts a valid HMAC signature and rejects a tampered body", () => {
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET = "test-secret";
    const body = JSON.stringify({ meta: { event_name: "order_created" } });
    const signature = crypto.createHmac("sha256", "test-secret").update(body).digest("hex");
    expect(verifyLemonSignature(body, signature)).toBe(true);
    expect(verifyLemonSignature(`${body} `, signature)).toBe(false);
    expect(verifyLemonSignature(body, null)).toBe(false);
  });

  it("reads the submission id and featured variant", () => {
    process.env.LEMONSQUEEZY_VARIANT_FEATURED = "999";
    const order = parseLemonOrder({
      meta: { event_name: "order_created", custom_data: { submission_id: "sub_1" } },
      data: { id: "42", attributes: { status: "paid", first_order_item: { variant_id: 999 } } },
    });
    expect(order).toMatchObject({ eventName: "order_created", submissionId: "sub_1", status: "paid", featured: true, orderId: "42" });
  });
});
