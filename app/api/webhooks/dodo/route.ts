import { NextResponse } from "next/server";
import { WebhookVerificationError } from "standardwebhooks";
import { parseDodoEvent, verifyDodoWebhook, WebhookConfigError } from "@/lib/dodo";
import { publishPaidSubmission, refundSubmission } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const raw = await request.text();
  try {
    await verifyDodoWebhook(raw, request.headers);
  } catch (error) {
    if (error instanceof WebhookConfigError) {
      return NextResponse.json({ error: "webhook secret is not set" }, { status: 500 });
    }
    if (error instanceof WebhookVerificationError) {
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const decision = parseDodoEvent(payload);
  if (decision.action === "publish") {
    const result = await publishPaidSubmission(decision.submissionId, decision.paymentId, decision.featured);
    return NextResponse.json(result);
  }
  if (decision.action === "refund") {
    const result = await refundSubmission(decision.paymentId);
    return NextResponse.json(result);
  }
  if (decision.action === "fail") {
    return NextResponse.json({ ok: true, published: false, type: decision.type });
  }
  return NextResponse.json({ ok: true, ignored: decision.type || "unknown" });
}
