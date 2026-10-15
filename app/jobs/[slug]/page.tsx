import Link from "next/link";
import { notFound } from "next/navigation";
import { CompanyLogo } from "@/components/company-logo";
import { JobList } from "@/components/job-list";
import { JsonLd } from "@/components/json-ld";
import { skillBySlug } from "@/lib/catalog";
import { formatDate, formatSalary, hostLabel, jobFacts, withApplyUtm } from "@/lib/format";
import { countryLabel } from "@/lib/location";
import { breadcrumbLd, buildJobPosting } from "@/lib/jsonld";
import { effectiveStatus, isGone } from "@/lib/model";
import { roleLabel, similarJobs } from "@/lib/query";
import { fitDescription, fitTitle, pageMeta } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { getAllJobs, getJobBySlug } from "@/lib/store";
import type { JobSource } from "@/lib/types";
import type { Metadata } from "next";

const SOURCE: Record<JobSource, string> = {
  paid: "Posted by the employer",
  ashby: "Posted via Ashby",
  greenhouse: "Posted via Greenhouse",
  lever: "Posted via Lever",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return {};
  const status = effectiveStatus(job);
  const description = fitDescription(
    `${job.title} at ${job.companyName}. ${jobFacts(job)}. ${formatSalary(job) || "Salary not posted."}`,
  );
  return pageMeta({
    title: fitTitle(`${job.title} at ${job.companyName}`),
    description,
    path: `/jobs/${slug}`,
    index: status === "active",
    image: `/jobs/${slug}/opengraph-image`,
  });
}

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job || job.status === "rejected" || job.status === "review" || job.status === "pending") notFound();
  if (isGone(job)) notFound();
  const all = await getAllJobs();
  const status = effectiveStatus(job);
  const expired = status === "expired";
  const salary = formatSalary(job);
  const schema = buildJobPosting(job);
  const family = job.titleFamily;
  const crumbs = [
    { name: "Jobs", path: "/" },
    ...(family ? [{ name: roleLabel(family), path: `/roles/${family}` }] : []),
    { name: job.title, path: `/jobs/${job.slug}` },
  ];
  const posted = job.datePosted ? formatDate(job.datePosted) : null;

  return (
    <article className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
      <JsonLd data={breadcrumbLd(crumbs)} />
      {schema ? <JsonLd data={schema} /> : null}
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-fg">Jobs</Link>
        {family ? <> / <Link href={`/roles/${family}`} className="hover:text-fg">{roleLabel(family)} jobs</Link></> : null}
      </nav>
      {expired ? (
        <p className="mt-6 rounded-2xl border border-line bg-chip px-4 py-3 text-sm" role="status">
          This role is no longer open{job.expiredAt ? ` (closed ${formatDate(job.expiredAt)})` : ""}. The description stays up for reference. Similar open roles are below.
        </p>
      ) : null}
      <h1 className="mt-5 max-w-3xl text-4xl text-balance sm:text-5xl">{job.title}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-fg">
        {job.title} at {job.companyName}. {jobFacts(job)}. {salary ? `Posted salary ${salary}.` : "The employer did not post a salary."}
      </p>
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <aside className="card order-1 p-5 lg:sticky lg:top-24 lg:order-2">
          <div className="flex items-center gap-3">
            <CompanyLogo name={job.companyName} domain={job.companyDomain} size={48} />
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted">Company</p>
              <Link href={`/companies/${job.companySlug}`} className="font-semibold text-fg hover:text-accent">{job.companyName}</Link>
            </div>
          </div>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-muted">Salary</dt>
              <dd className={`mt-1 font-semibold ${salary ? "text-salary-fg" : "text-fg"}`}>
                {salary || "Not posted by the employer"}
                {job.salaryNote ? <span className="mt-1 block font-normal text-muted">{job.salaryNote}</span> : null}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Location</dt>
              <dd className="mt-1 text-fg">{jobFacts(job)}</dd>
            </div>
            {job.workplace === "remote" && job.applicantCountries.length ? (
              <div>
                <dt className="text-muted">Applicants in</dt>
                <dd className="mt-1 text-fg">{job.applicantCountries.map(countryLabel).join(", ")}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-muted">Posted</dt>
              <dd className="mt-1 text-fg">{posted && job.datePosted ? <time dateTime={job.datePosted}>{posted}</time> : "Date not posted"}</dd>
            </div>
          </dl>
          {job.skills.length ? (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Skills">
              {job.skills.map((skill) => (
                <li key={skill} className="rounded-full bg-chip px-2.5 py-0.5 text-xs font-medium text-fg">
                  {skillBySlug(skill)?.label || skill}
                </li>
              ))}
            </ul>
          ) : null}
          {!expired ? (
            <a
              href={withApplyUtm(job.applyUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-accent text-sm font-semibold text-accent-fg hover:opacity-90"
            >
              Apply
            </a>
          ) : null}
          <p className="mt-3 text-xs leading-5 text-muted">
            {SOURCE[job.source]}
            {posted ? ` · ${posted}` : ""}
            {!expired ? ` · Opens ${hostLabel(job.applyUrl)}` : ""}
          </p>
        </aside>
        <div className="order-2 min-w-0 lg:order-1">
          <div className="job-body text-[17px]" dangerouslySetInnerHTML={{ __html: job.descriptionHtml || `<p>${job.descriptionText || "The employer did not include a description in the public posting."}</p>` }} />
          <p className="mt-8 text-sm text-muted">
            Canonical listing: {absoluteUrl(`/jobs/${job.slug}`)}. Applications are completed on the original posting.
          </p>
        </div>
      </div>
      <section className="mt-14" aria-labelledby="similar-heading">
        <h2 id="similar-heading" className="text-2xl font-bold tracking-tight">Similar roles</h2>
        <div className="mt-4">
          <JobList jobs={similarJobs(all, job)} />
        </div>
      </section>
    </article>
  );
}
