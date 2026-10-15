import { cookies } from "next/headers";
import { reviewLoginAction } from "@/app/actions";
import { pageMeta } from "@/lib/seo";
import { listReviewJobs } from "@/lib/store";

export const metadata = pageMeta({
  title: "Review queue",
  description: "Low-confidence job matches waiting for a decision.",
  path: "/review",
  index: false,
});

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const secret = process.env.REVIEW_SECRET;
  const jar = await cookies();
  const authed = Boolean(secret && jar.get("review")?.value === secret);
  const search = await searchParams;
  if (!secret) {
    return <p className="mx-auto max-w-xl px-5 py-16 text-sm text-muted">Set REVIEW_SECRET to open the queue.</p>;
  }
  if (!authed) {
    return (
      <form action={reviewLoginAction} className="mx-auto max-w-sm px-5 py-16">
        <h1 className="text-2xl font-medium tracking-tight">Review queue</h1>
        {search.error ? <p className="mt-3 text-sm">That key did not match.</p> : null}
        <input name="key" type="password" className="mt-4 h-10 w-full rounded-lg border border-line bg-bg px-3" />
        <button className="mt-3 h-10 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-fg" type="submit">Unlock</button>
      </form>
    );
  }
  const jobs = await listReviewJobs();
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="text-3xl font-medium tracking-tight">Review queue</h1>
      <p className="mt-2 text-sm text-muted">{jobs.length} low-confidence matches. They are not public.</p>
      <ul className="mt-6 divide-y divide-line border-y border-line">
        {jobs.map((job) => (
          <li key={job.id} className="py-3 text-sm">
            <p className="font-medium">{job.title}</p>
            <p className="text-muted">{job.companyName} · {job.confidence} · {job.matchReasons.join(", ")}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
