import Link from "next/link";
import { CompanyLogo } from "@/components/company-logo";
import { formatSalary, workplaceLabel } from "@/lib/format";
import type { Job, Seniority } from "@/lib/types";

const SENIORITY: Record<Seniority, string> = {
  internship: "Internship",
  junior: "Junior",
  senior: "Senior",
  staff: "Staff",
  lead: "Lead",
  founding: "Founding",
  manager: "Manager",
};

export function JobList({ jobs }: { jobs: Job[] }) {
  if (!jobs.length) {
    return (
      <p className="rounded-2xl border border-dashed border-line bg-card px-4 py-12 text-center text-sm text-muted">
        No open roles match this filter. Related pages below stay linked while the list is thin.
      </p>
    );
  }

  return (
    <ul className="grid gap-3">
      {jobs.map((job) => {
        const salary = formatSalary(job);
        const place = placeLabel(job);
        return (
          <li key={job.id} className="card lift px-4 py-4 sm:px-5">
            <div className="flex gap-3 sm:gap-4">
              <CompanyLogo name={job.companyName} domain={job.companyDomain} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="text-sm font-medium text-muted">
                    <Link href={`/companies/${job.companySlug}`} className="hover:text-fg">
                      {job.companyName}
                    </Link>
                    {job.featured ? <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-fg">Featured</span> : null}
                  </p>
                  {job.datePosted ? (
                    <time dateTime={job.datePosted} className="text-xs text-muted">
                      {postedAgo(job.datePosted)}
                    </time>
                  ) : null}
                </div>
                <h3 className="mt-1 text-lg font-bold text-fg">
                  <Link href={`/jobs/${job.slug}`} className="hover:text-accent">
                    {job.title}
                  </Link>
                </h3>
                <ul className="mt-3 flex flex-wrap gap-2" aria-label="Role details">
                  <li className="inline-flex items-center rounded-full border border-line bg-chip px-2.5 py-0.5 text-xs font-medium text-fg">{workplaceLabel(job.workplace)}</li>
                  {place ? <li className="inline-flex items-center rounded-full border border-line bg-chip px-2.5 py-0.5 text-xs font-medium text-fg">{place}</li> : null}
                  {salary ? <li className="inline-flex items-center rounded-full bg-salary px-2.5 py-0.5 text-xs font-semibold text-salary-fg">{salary}</li> : null}
                  {job.seniority ? <li className="inline-flex items-center rounded-full border border-line bg-chip px-2.5 py-0.5 text-xs font-medium text-fg">{SENIORITY[job.seniority]}</li> : null}
                </ul>
              </div>
              <Link
                href={`/jobs/${job.slug}`}
                className="hidden h-10 shrink-0 items-center self-center rounded-xl bg-accent px-4 text-sm font-semibold text-accent-fg hover:opacity-90 sm:inline-flex"
              >
                View
              </Link>
            </div>
            <Link
              href={`/jobs/${job.slug}`}
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-accent text-sm font-semibold text-accent-fg hover:opacity-90 sm:hidden"
            >
              View
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function placeLabel(job: Job) {
  const city = job.locations.find((location) => location.locality)?.locality;
  if (city) return city;
  if (job.workplace === "remote") return null;
  const raw = job.locationRaw.replace(/^(remote|hybrid|on-?site)\s*[-·]\s*/i, "").trim();
  return raw && raw.toLowerCase() !== workplaceLabel(job.workplace).toLowerCase() ? raw : null;
}

function postedAgo(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Date not posted";
  const days = Math.max(0, Math.floor((Date.now() - then) / 86_400_000));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  return `${Math.floor(days / 30)} mo ago`;
}
