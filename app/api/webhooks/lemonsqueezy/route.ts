import { NextResponse } from "next/server";
import { parseLemonOrder, verifyLemonSignature } from "@/lib/lemonsqueezy";
import { publishPaidSubmission, refundSubmission } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const raw = await request.text();
  if (!process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "webhook secret is not set" }, { status: 500 });
  }
  if (!verifyLemonSignature(raw, request.headers.get("x-signature"))) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }
  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const order = parseLemonOrder(payload);
  if (!order) return NextResponse.json({ ok: true });
  if (order.eventName === "order_created" && order.status === "paid" && order.submissionId) {
    const result = await publishPaidSubmission(order.submissionId, order.orderId || "unknown", order.featured);
    return NextResponse.json(result);
  }
  if (order.eventName === "order_refunded" && order.orderId) {
    await refundSubmission(order.orderId);
  }
  return NextResponse.json({ ok: true });
}
