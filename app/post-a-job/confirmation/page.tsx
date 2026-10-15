import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Listing received",
  description: "Payment status for a Design Code Jobs listing.",
  path: "/post-a-job/confirmation",
  index: false,
});

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const search = await searchParams;
  const pending = search.pending === "1";
  return (
    <div className="mx-auto max-w-xl px-5 py-16">
      <h1 className="text-4xl font-medium tracking-tight">Listing received</h1>
      <p className="mt-4 text-[15px] leading-7 text-muted">
        {pending
          ? "The draft is saved. Checkout is not configured in this environment, so the role is not public yet. Add the Lemon Squeezy checkout URLs and the webhook will publish it after payment."
          : "If payment succeeded, the role is published for 30 days. It can take a moment for the webhook to land."}
      </p>
      {typeof search.submission === "string" ? <p className="mt-4 font-mono text-xs text-muted">Reference {search.submission}</p> : null}
    </div>
  );
}
