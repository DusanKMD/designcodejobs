import Link from "next/link";
import { formatDate, formatSalary, jobFacts } from "@/lib/format";
import type { Job } from "@/lib/types";

export function JobList({ jobs }: { jobs: Job[] }) {
  if (!jobs.length) {
    return (
      <p className="rounded-xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
        No open roles match this filter. Related pages below stay linked while the list is thin.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
      {jobs.map((job) => {
        const salary = formatSalary(job);
        return (
          <li key={job.id}>
            <Link href={`/jobs/${job.slug}`} className="flex gap-3 px-4 py-3.5 hover:bg-chip sm:gap-4">
              <Monogram name={job.companyName} />
              <span className="min-w-0 flex-1">
                <span className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <span className="truncate font-medium tracking-tight">
                    {job.featured ? <span className="mr-2 text-[11px] font-medium uppercase tracking-wider text-muted">Featured</span> : null}
                    {job.title}
                  </span>
                  {salary ? <span className="shrink-0 text-sm tabular-nums text-fg">{salary}</span> : null}
                </span>
                <span className="mt-0.5 block truncate text-sm text-muted">
                  {job.companyName}
                  {" · "}
                  {jobFacts(job)}
                  {job.datePosted ? ` · ${formatDate(job.datePosted)}` : ""}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Monogram({ name }: { name: string }) {
  const letter = name.replace(/[^A-Za-z0-9]/g, "").slice(0, 1).toUpperCase() || "•";
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-chip text-[13px] font-medium" aria-hidden>
      {letter}
    </span>
  );
}
