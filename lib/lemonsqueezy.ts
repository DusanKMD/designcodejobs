import crypto from "node:crypto";
import { FEATURED_PRICE_USD, STANDARD_PRICE_USD } from "@/lib/site";

export function checkoutUrl(featured: boolean, submissionId: string, email: string) {
  const base = featured
    ? process.env.LEMONSQUEEZY_CHECKOUT_FEATURED_URL
    : process.env.LEMONSQUEEZY_CHECKOUT_STANDARD_URL;
  if (!base) return null;
  const url = new URL(base);
  url.searchParams.set("checkout[custom][submission_id]", submissionId);
  url.searchParams.set("checkout[email]", email);
  return url.toString();
}

export function priceFor(featured: boolean) {
  return featured ? FEATURED_PRICE_USD : STANDARD_PRICE_USD;
}

export function verifyLemonSignature(rawBody: string, signature: string | null) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(digest);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export type LemonOrder = {
  eventName: string;
  orderId: string | null;
  status: string | null;
  submissionId: string | null;
  variantId: string | null;
  featured: boolean | null;
};

export function parseLemonOrder(payload: unknown): LemonOrder | null {
  if (!payload || typeof payload !== "object") return null;
  const body = payload as {
    meta?: { event_name?: string; custom_data?: { submission_id?: string } };
    data?: {
      id?: string;
      attributes?: {
        status?: string;
        first_order_item?: { variant_id?: number | string };
        variant_id?: number | string;
      };
    };
  };
  const eventName = body.meta?.event_name || "";
  const variantRaw =
    body.data?.attributes?.first_order_item?.variant_id ?? body.data?.attributes?.variant_id ?? null;
  const variantId = variantRaw == null ? null : String(variantRaw);
  const standard = process.env.LEMONSQUEEZY_VARIANT_STANDARD;
  const featured = process.env.LEMONSQUEEZY_VARIANT_FEATURED;
  let isFeatured: boolean | null = null;
  if (variantId && featured && variantId === featured) isFeatured = true;
  else if (variantId && standard && variantId === standard) isFeatured = false;
  return {
    eventName,
    orderId: body.data?.id ? String(body.data.id) : null,
    status: body.data?.attributes?.status || null,
    submissionId: body.meta?.custom_data?.submission_id || null,
    variantId,
    featured: isFeatured,
  };
}
