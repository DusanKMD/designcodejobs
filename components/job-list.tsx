import Link from "next/link";
import { skillBySlug } from "@/lib/catalog";
import { formatDate, formatSalary, jobFacts } from "@/lib/format";
import type { Job } from "@/lib/types";

export function JobList({ jobs }: { jobs: Job[] }) {
  if (!jobs.length) {
    return (
      <p className="rounded-md border border-dashed border-line px-4 py-12 text-center text-sm text-muted">
        No open roles match this filter. Related pages below stay linked while the list is thin.
      </p>
    );
  }

  return (
    <ul className="grid gap-3">
      {jobs.map((job) => {
        const salary = formatSalary(job);
        const posted = formatDate(job.datePosted);
        return (
          <li key={job.id}>
            <Link
              href={`/jobs/${job.slug}`}
              className={`lift block rounded-md border bg-bg px-4 py-4 hover:bg-chip sm:px-5 ${job.featured ? "border-accent" : "border-line"}`}
            >
              <span className="flex gap-3">
                <Monogram name={job.companyName} />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm text-muted">{job.companyName}</span>
                    {job.featured ? (
                      <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-accent-fg">
                        Featured
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <span className="text-[17px] font-medium tracking-tight text-fg">{job.title}</span>
                    {salary ? <span className="shrink-0 text-sm tabular-nums text-fg">{salary}</span> : null}
                  </span>
                  <span className="mt-1 block text-sm text-muted">{jobFacts(job)}</span>
                  <span className="mt-3 flex flex-wrap items-center gap-2">
                    {job.skills.slice(0, 4).map((skill) => (
                      <span key={skill} className="rounded-md bg-chip px-2.5 py-0.5 text-xs text-muted">
                        {skillBySlug(skill)?.label || skill}
                      </span>
                    ))}
                    {posted ? (
                      <time dateTime={job.datePosted} className="text-xs text-muted sm:ml-auto">
                        Posted {posted}
                      </time>
                    ) : null}
                  </span>
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
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-chip font-mono text-sm font-medium" aria-hidden>
      {letter}
    </span>
  );
}
