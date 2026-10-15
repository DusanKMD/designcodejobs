import DodoPayments from "dodopayments";
import { Webhook, WebhookVerificationError } from "standardwebhooks";

export class WebhookConfigError extends Error {
  constructor() {
    super("DODO_PAYMENTS_WEBHOOK_KEY is not set");
    this.name = "WebhookConfigError";
  }
}

export type DodoEnvironment = "test_mode" | "live_mode";

/** Live and test API hosts. The SDK selects one from `DODO_PAYMENTS_ENVIRONMENT`. */
export const DODO_API_BASE: Record<DodoEnvironment, string> = {
  test_mode: "https://test.dodopayments.com",
  live_mode: "https://live.dodopayments.com",
};

export function dodoEnvironment(): DodoEnvironment | null {
  const value = process.env.DODO_PAYMENTS_ENVIRONMENT;
  if (value === "test_mode" || value === "live_mode") return value;
  return null;
}

/** Standard product, plus the featured add-on when the buyer asked for it. */
export function listingCart(featured: boolean) {
  const standard = process.env.DODO_PAYMENTS_PRODUCT_STANDARD?.trim();
  const addon = process.env.DODO_PAYMENTS_PRODUCT_FEATURED?.trim();
  if (!standard) return null;
  if (!featured) return [{ product_id: standard, quantity: 1 }];
  if (!addon) return null;
  return [
    { product_id: standard, quantity: 1 },
    { product_id: addon, quantity: 1 },
  ];
}

export async function createCheckoutSession(input: {
  submissionId: string;
  email: string;
  name?: string;
  featured: boolean;
  returnUrl: string;
}) {
  const environment = dodoEnvironment();
  const apiKey = process.env.DODO_PAYMENTS_API_KEY?.trim();
  const productCart = listingCart(input.featured);
  if (!environment || !apiKey || !productCart) return null;
  try {
    const client = new DodoPayments({ bearerToken: apiKey, environment });
    const session = await client.checkoutSessions.create({
      product_cart: productCart,
      customer: { email: input.email, name: input.name || null },
      return_url: input.returnUrl,
      metadata: {
        submission_id: input.submissionId,
        featured: input.featured ? "true" : "false",
      },
    });
    return session.checkout_url || null;
  } catch (error) {
    console.error("[dodo] checkout session failed", error);
    return null;
  }
}

type HeaderSource = { get(name: string): string | null };

export async function verifyDodoWebhook(rawBody: string, headers: HeaderSource) {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_KEY?.trim();
  if (!secret) throw new WebhookConfigError();
  const webhook = new Webhook(secret);
  try {
    await webhook.verify(rawBody, {
      "webhook-id": headers.get("webhook-id") || "",
      "webhook-signature": headers.get("webhook-signature") || "",
      "webhook-timestamp": headers.get("webhook-timestamp") || "",
    });
  } catch (error) {
    if (error instanceof WebhookVerificationError) throw error;
    throw new WebhookVerificationError(error instanceof Error ? error.message : "invalid signature");
  }
}

export type DodoDecision =
  | { action: "publish"; submissionId: string; paymentId: string; featured: boolean | null }
  | { action: "fail"; type: string; paymentId: string | null; submissionId: string | null }
  | { action: "refund"; paymentId: string }
  | { action: "ignore"; type: string };

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function featuredFrom(data: Record<string, unknown>, metadata: Record<string, unknown>) {
  const addon = process.env.DODO_PAYMENTS_PRODUCT_FEATURED?.trim();
  const cart = data.product_cart;
  if (addon && Array.isArray(cart)) {
    const paid = cart.some((item) => asRecord(item)?.product_id === addon);
    if (paid) return true;
  }
  const flag = metadata.featured;
  if (flag === true || flag === "true" || flag === "1") return true;
  if (flag === false || flag === "false" || flag === "0") return false;
  return null;
}

/** Map a verified Dodo event onto publish, fail, refund, or ignore. */
export function parseDodoEvent(payload: unknown): DodoDecision {
  const body = asRecord(payload);
  const type = typeof body?.type === "string" ? body.type : "";
  const data = asRecord(body?.data) || {};
  const metadata = asRecord(data.metadata) || {};
  const paymentId = typeof data.payment_id === "string" ? data.payment_id : null;
  const submissionId = typeof metadata.submission_id === "string" ? metadata.submission_id : null;

  if (type === "payment.succeeded") {
    if (!submissionId || !paymentId) return { action: "ignore", type };
    return { action: "publish", submissionId, paymentId, featured: featuredFrom(data, metadata) };
  }
  if (type === "payment.failed" || type === "payment.cancelled") {
    return { action: "fail", type, paymentId, submissionId };
  }
  if (type === "refund.succeeded") {
    if (!paymentId) return { action: "ignore", type };
    return { action: "refund", paymentId };
  }
  return { action: "ignore", type };
}
