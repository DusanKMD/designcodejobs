import Link from "next/link";
import { CompanyLogo } from "@/components/company-logo";
import { ArrowRight, Globe, Pin } from "@/components/icons";
import { formatSalaryShort, workplaceLabel } from "@/lib/format";
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

const NEW_DAYS = 4;

export function JobList({ jobs, headingLevel = 3 }: { jobs: Job[]; headingLevel?: 2 | 3 }) {
  if (!jobs.length) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong bg-card px-6 py-14 text-center">
        <p className="font-medium">No open roles match this filter yet.</p>
        <p className="mt-1 text-sm text-muted">New roles appear after the next board sync. Related pages below stay linked while the list is thin.</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-2.5">
      {jobs.map((job) => (
        <li key={job.id}>
          <JobCard job={job} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}

export function JobCard({ job, headingLevel = 3 }: { job: Job; headingLevel?: 2 | 3 }) {
  const salary = formatSalaryShort(job);
  const place = placeLabel(job);
  const days = daysSince(job.datePosted);
  const fresh = days != null && days <= NEW_DAYS;
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <article className={`job-card group px-4 py-4 sm:px-5 ${job.featured ? "is-featured" : ""}`}>
      <div className="flex items-start gap-3.5 sm:items-center sm:gap-4">
        <CompanyLogo name={job.companyName} domain={job.companyDomain} size={44} className="job-logo" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
            <Link href={`/companies/${job.companySlug}`} className="lift-above font-medium text-fg-2 hover:text-fg hover:underline hover:underline-offset-4">
              {job.companyName}
            </Link>
            {job.featured ? <span className="chip chip-featured h-5 px-2 text-[11px]">Featured</span> : null}
            {fresh ? <span className="chip chip-accent h-5 px-2 text-[11px]">New</span> : null}
            <span className="text-subtle" aria-hidden>·</span>
            {job.datePosted ? (
              <time dateTime={job.datePosted} className="text-muted">
                {postedAgo(days)}
              </time>
            ) : (
              <span className="text-muted">Date not posted</span>
            )}
          </div>
          <Heading className="mt-1 text-[16.5px] font-semibold leading-snug tracking-[-0.015em] text-fg sm:text-[17px]">
            <Link href={`/jobs/${job.slug}`} className="stretched outline-none">
              {job.title}
            </Link>
          </Heading>
          <ul className="mt-2.5 flex flex-wrap items-center gap-1.5" aria-label="Role details">
            <li className="chip">
              {job.workplace === "remote" ? <Globe size={12} /> : <Pin size={12} />}
              {workplaceLabel(job.workplace)}
            </li>
            {place ? <li className="chip">{place}</li> : null}
            {job.seniority ? <li className="chip">{SENIORITY[job.seniority]}</li> : null}
            {salary ? <li className="chip chip-salary tabular sm:hidden">{salary}</li> : null}
          </ul>
        </div>
        <div className="hidden shrink-0 items-center gap-4 sm:flex">
          {salary ? <span className="chip chip-salary tabular h-7 px-3 text-[13px]">{salary}</span> : null}
          <span className="job-go flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted" aria-hidden>
            <ArrowRight />
          </span>
        </div>
      </div>
    </article>
  );
}

function placeLabel(job: Job) {
  const city = job.locations.find((location) => location.locality)?.locality;
  if (city) return city;
  const raw = job.locationRaw.replace(/^(remote|hybrid|on-?site)\s*[-·:,(]?\s*/i, "").replace(/\)$/, "").trim();
  if (!raw || raw.toLowerCase() === workplaceLabel(job.workplace).toLowerCase()) return null;
  return raw.length > 28 ? `${raw.slice(0, 27)}…` : raw;
}

function daysSince(iso: string | null | undefined) {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.max(0, Math.floor((Date.now() - then) / 86_400_000));
}

function postedAgo(days: number | null) {
  if (days == null) return "Date not posted";
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
