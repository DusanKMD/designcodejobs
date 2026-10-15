import Link from "next/link";
import { checkoutOutcome, type CheckoutOutcome } from "@/lib/post-job";
import { pageMeta } from "@/lib/seo";
import { LISTING_DAYS } from "@/lib/site";

export const metadata = pageMeta({
  title: "Listing checkout",
  description: "Payment status for a Design Code Jobs listing.",
  path: "/post-a-job/confirmation",
  index: false,
});

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
  return (
    <div className="mx-auto max-w-xl px-5 py-16">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">{KICKER[outcome]}</p>
      <h1 className="mt-3 text-5xl text-balance">{copy.title}</h1>
      <p className="mt-5 text-[17px] leading-8 text-muted">{copy.body}</p>
      <h2 className="mt-8 text-lg font-medium tracking-tight">Next steps</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted">
        {copy.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="inline-flex h-11 items-center rounded-full bg-fg px-5 text-sm font-medium text-bg">
          Design engineer jobs
        </Link>
        {outcome === "failed" || outcome === "cancelled" || outcome === "unknown" || outcome === "unconfigured" ? (
          <Link href="/post-a-job" className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm">
            Post a job
          </Link>
        ) : null}
      </div>
      {submission || payment ? (
        <dl className="mt-8 text-xs text-muted">
          {submission ? (
            <div>
              <dt className="inline">Reference </dt>
              <dd className="inline font-mono">{submission}</dd>
            </div>
          ) : null}
          {payment ? (
            <div>
              <dt className="inline">Payment </dt>
              <dd className="inline font-mono">{payment}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </div>
  );
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}
