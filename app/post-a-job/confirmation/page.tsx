import Link from "next/link";
import { ArrowRight, Check, Clock, Plus } from "@/components/icons";
import { checkoutOutcome, type CheckoutOutcome } from "@/lib/post-job";
import { pageMeta } from "@/lib/seo";
import { LISTING_DAYS } from "@/lib/site";

export const metadata = pageMeta({
  title: "Listing checkout",
  description: "Payment status for a Design Code Jobs listing.",
  path: "/post-a-job/confirmation",
  index: false,
});

const TONE: Record<CheckoutOutcome, string> = {
  paid: "bg-salary text-salary-fg",
  pending: "bg-accent-soft text-accent-text",
  failed: "bg-featured text-featured-fg",
  cancelled: "bg-chip text-muted",
  unconfigured: "bg-accent-soft text-accent-text",
  unknown: "bg-chip text-muted",
};

const KICKER: Record<CheckoutOutcome, string> = {
  paid: "Paid",
  pending: "Pending",
  failed: "Failed",
  cancelled: "Cancelled",
  unconfigured: "Not charged",
  unknown: "Checkout",
};

const COPY: Record<CheckoutOutcome, { title: string; body: string; steps: string[] }> = {
  paid: {
    title: "Payment received",
    body: `Dodo marked this checkout as paid. The role is published for ${LISTING_DAYS} days when the webhook arrives, which is usually within a minute. This page does not publish it.`,
    steps: [
      "Wait a minute, then look for the title on the board.",
      "Keep the reference below if it is still missing.",
      "A later refund expires the listing.",
    ],
  },
  pending: {
    title: "Payment still processing",
    body: "Dodo has not confirmed the payment yet. The role stays unpublished until payment succeeds.",
    steps: [
      "Wait for the payment to finish. You do not need to submit the form again while it is processing.",
      "If it later fails, start checkout again from the post form.",
    ],
  },
  failed: {
    title: "Payment failed",
    body: "The payment did not succeed, so the role was not published.",
    steps: [
      "Return to the form and try checkout again.",
      "Your previous answers are not stored in the browser after you leave checkout.",
    ],
  },
  cancelled: {
    title: "Checkout cancelled",
    body: "Checkout was cancelled before payment. Nothing was published.",
    steps: [
      "Post the role again when you want to continue.",
      "No listing goes live without a successful payment.",
    ],
  },
  unconfigured: {
    title: "Draft saved",
    body: "The draft is saved. Checkout is not configured in this environment, so nothing was charged and the role is not public. Set the Dodo Payments API key, product IDs, and environment. The webhook publishes the role after a real payment.",
    steps: [
      "Add the Dodo environment variables.",
      "Submit the form again to open a checkout session.",
    ],
  },
  unknown: {
    title: "Back from checkout",
    body: "This return did not include a payment status. The role is published only after the webhook confirms payment.",
    steps: [
      "If you completed payment, wait a minute and check the board.",
      "If you did not pay, start again from the post form.",
    ],
  },
};

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const search = await searchParams;
  const outcome = checkoutOutcome(search);
  const copy = COPY[outcome];
  const submission = first(search.submission);
  const payment = first(search.payment_id);
  const tone = TONE[outcome];
  return (
    <section className="relative overflow-hidden">
      <div className="canvas canvas-fade absolute inset-0 -z-10" aria-hidden />
      <div className="mx-auto max-w-xl px-5 py-16 sm:py-24">
        <div className="card p-6 sm:p-8">
          <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`} aria-hidden>
            {outcome === "paid" ? <Check size={20} /> : outcome === "failed" || outcome === "cancelled" ? <Plus size={20} className="rotate-45" /> : <Clock size={20} />}
          </span>
          <p className="mt-5 font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-accent-text">{KICKER[outcome]}</p>
          <h1 className="mt-2 text-[34px] leading-tight sm:text-[40px]">{copy.title}</h1>
          <p className="mt-4 text-[16px] leading-7 text-fg-2">{copy.body}</p>
          <h2 className="mt-8 text-[15px] font-semibold tracking-tight">Next steps</h2>
          <ol className="mt-3 grid gap-2.5">
            {copy.steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-6 text-fg-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-chip font-mono text-[11px] text-muted">{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="btn btn-primary">
              Design engineer jobs <ArrowRight className="arrow" />
            </Link>
            {outcome === "failed" || outcome === "cancelled" || outcome === "unknown" || outcome === "unconfigured" ? (
              <Link href="/post-a-job" className="btn btn-secondary">
                Post a job
              </Link>
            ) : null}
          </div>
          {submission || payment ? (
            <dl className="mt-8 grid gap-1 rounded-xl bg-chip px-4 py-3 font-mono text-[12px] text-muted">
              {submission ? (
                <div className="flex justify-between gap-3">
                  <dt>Reference</dt>
                  <dd className="truncate tabular text-fg-2">{submission}</dd>
                </div>
              ) : null}
              {payment ? (
                <div className="flex justify-between gap-3">
                  <dt>Payment</dt>
                  <dd className="truncate tabular text-fg-2">{payment}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}
