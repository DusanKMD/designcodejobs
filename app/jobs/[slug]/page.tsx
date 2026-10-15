import Link from "next/link";
import { notFound } from "next/navigation";
import { CompanyLogo } from "@/components/company-logo";
import { CopyLink } from "@/components/copy-link";
import { ArrowRight, ArrowUpRight, Clock, Globe, Pin, Shield, Wallet } from "@/components/icons";
import { JobList } from "@/components/job-list";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumbs, SectionHeading } from "@/components/ui";
import { skillBySlug } from "@/lib/catalog";
import { formatDate, formatSalary, formatSalaryShort, hostLabel, jobFacts, withApplyUtm, workplaceLabel } from "@/lib/format";
import { normalizeHeadings } from "@/lib/html";
import { countryLabel } from "@/lib/location";
import { breadcrumbLd, buildJobPosting } from "@/lib/jsonld";
import { effectiveStatus, isGone } from "@/lib/model";
import { listedJobs, roleLabel, similarJobs } from "@/lib/query";
import { jobMetaDescription, jobMetaTitle, pageMeta } from "@/lib/seo";
import { absoluteUrl, LISTING_DAYS, STANDARD_PRICE_USD } from "@/lib/site";
import { getAllJobs, getJobBySlug } from "@/lib/store";
import type { JobSource } from "@/lib/types";
import type { Metadata } from "next";

const SOURCE: Record<JobSource, string> = {
  paid: "Posted directly by the employer",
  ashby: "Read from the employer’s public Ashby board",
  greenhouse: "Read from the employer’s public Greenhouse board",
  lever: "Read from the employer’s public Lever board",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return {};
  const status = effectiveStatus(job);
  return pageMeta({
    title: jobMetaTitle(job, listedJobs(await getAllJobs())),
    description: jobMetaDescription(job),
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
    ...(family ? [{ name: `${roleLabel(family)} jobs`, path: `/roles/${family}` }] : []),
    { name: job.title, path: `/jobs/${job.slug}` },
  ];
  const posted = job.datePosted ? formatDate(job.datePosted) : null;
  const applyHref = withApplyUtm(job.applyUrl);
  const host = hostLabel(job.applyUrl);
  const city = job.locations.find((location) => location.locality)?.locality;
  const body = normalizeHeadings(
    job.descriptionHtml || `<p>${job.descriptionText || "The employer did not include a description in the public posting."}</p>`,
  );
  const similar = similarJobs(all, job);

  return (
    <article className="pb-24 lg:pb-0">
      <JsonLd data={breadcrumbLd(crumbs)} />
      {schema ? <JsonLd data={schema} /> : null}

      <header className="relative overflow-hidden border-b border-line">
        <div className="canvas canvas-fade absolute inset-0 -z-10" aria-hidden />
        <div className="glow absolute inset-0 -z-10" aria-hidden />
        <div className="mx-auto max-w-6xl px-5 pb-10 pt-8 sm:px-6 sm:pt-10">
          <Breadcrumbs crumbs={crumbs} />
          {expired ? (
            <p className="mt-6 flex items-start gap-2.5 rounded-xl border border-featured-fg/25 bg-featured px-4 py-3 text-sm text-featured-fg" role="status">
              <Clock className="mt-0.5" />
              <span>
                This role is no longer open{job.expiredAt ? ` (closed ${formatDate(job.expiredAt)})` : ""}. The description stays up for reference. Similar open roles are below.
              </span>
            </p>
          ) : null}
          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
            <CompanyLogo name={job.companyName} domain={job.companyDomain} size={64} className="rise" />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] text-muted">
                <Link href={`/companies/${job.companySlug}`} className="font-medium text-fg-2 hover:text-fg hover:underline hover:underline-offset-4">
                  {job.companyName}
                </Link>{" "}
                is hiring
              </p>
              <h1 className="mt-2 max-w-3xl text-[34px] leading-[1.06] sm:text-[48px]">{job.title}</h1>
              <ul className="mt-5 flex flex-wrap items-center gap-2" aria-label="Role summary">
                <li className="chip h-7 px-3 text-[13px]">
                  {job.workplace === "remote" ? <Globe size={13} /> : <Pin size={13} />}
                  {workplaceLabel(job.workplace)}
                </li>
                {city ? <li className="chip h-7 px-3 text-[13px]">{city}</li> : null}
                {job.seniority ? <li className="chip h-7 px-3 text-[13px] capitalize">{job.seniority}</li> : null}
                {salary ? <li className="chip chip-salary tabular h-7 px-3 text-[13px]">{salary}</li> : null}
                {posted && job.datePosted ? (
                  <li className="chip h-7 px-3 text-[13px] text-muted">
                    <Clock size={13} /> Posted <time dateTime={job.datePosted}>{posted}</time>
                  </li>
                ) : null}
              </ul>
            </div>
            <div className="hidden shrink-0 gap-2 lg:flex">
              <CopyLink url={absoluteUrl(`/jobs/${job.slug}`)} />
              {!expired ? (
                <a href={applyHref} target="_blank" rel="noopener noreferrer" className="btn btn-accent">
                  Apply now
                  <ArrowUpRight className="arrow" />
                </a>
              ) : null}
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-[15px] leading-7 text-fg-2">
            {job.title} at {job.companyName}. {jobFacts(job)}. {salary ? `Posted salary ${salary}.` : "The employer did not post a salary."}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="min-w-0" aria-labelledby="about-role-heading">
            <h2 id="about-role-heading" className="text-[22px] tracking-tight">
              About the role
            </h2>
            <div className="job-body mt-2 text-[16px]" dangerouslySetInnerHTML={{ __html: body }} />
            <p className="mt-10 border-t border-line pt-5 text-[13px] leading-6 text-muted">
              Canonical listing: {absoluteUrl(`/jobs/${job.slug}`)}. Applications are completed on the original posting.
            </p>
          </section>

          <aside className="grid gap-4 lg:sticky lg:top-24" aria-label="Apply">
            <div className="card overflow-hidden">
              <div className="border-b border-line bg-chip/50 p-5">
                <p className="flex items-center gap-1.5 text-[12px] font-medium text-muted">
                  <Wallet size={13} /> Salary
                </p>
                <p className={`mt-1 text-[26px] font-semibold tracking-tight tabular ${salary ? "text-salary-fg" : "text-fg"}`}>
                  {formatSalaryShort(job) || "Not posted"}
                </p>
                {salary ? <p className="mt-0.5 text-xs text-muted tabular">{salary} ({job.salaryCurrency || "USD"})</p> : null}
                {job.salaryNote ? <p className="mt-1 text-xs text-muted">{job.salaryNote}</p> : null}
                {!salary ? <p className="mt-1 text-xs text-muted">The employer did not publish a range.</p> : null}
              </div>
              <dl className="grid gap-4 p-5 text-sm">
                <Fact label="Location">{jobFacts(job)}</Fact>
                {job.workplace === "remote" && job.applicantCountries.length ? (
                  <Fact label="Applicants in">{job.applicantCountries.map(countryLabel).join(", ")}</Fact>
                ) : null}
                <Fact label="Posted">
                  {posted && job.datePosted ? <time dateTime={job.datePosted}>{posted}</time> : "Date not posted"}
                </Fact>
                {job.skills.length ? (
                  <Fact label="Skills mentioned">
                    <ul className="mt-1 flex flex-wrap gap-1.5" aria-label="Skills">
                      {job.skills.map((skill) => (
                        <li key={skill}>
                          <Link href={`/skills/${skill}`} className="chip hover:border-line-strong hover:text-fg">
                            {skillBySlug(skill)?.label || skill}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Fact>
                ) : null}
              </dl>
              <div className="border-t border-line p-5">
                {!expired ? (
                  <a href={applyHref} target="_blank" rel="noopener noreferrer" className="btn btn-accent btn-lg w-full">
                    Apply on {host}
                    <ArrowUpRight className="arrow" />
                  </a>
                ) : (
                  <Link href={family ? `/roles/${family}` : "/"} className="btn btn-primary btn-lg w-full">
                    See open {family ? roleLabel(family).toLowerCase() : "design engineer"} roles
                    <ArrowRight className="arrow" />
                  </Link>
                )}
                <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted">
                  <Shield size={14} className="mt-0.5 text-salary-fg" />
                  <span>
                    {SOURCE[job.source]}
                    {posted ? ` · ${posted}` : ""}. You apply with the employer, not with us.
                  </span>
                </p>
              </div>
            </div>
            <div className="lg:hidden">
              <CopyLink url={absoluteUrl(`/jobs/${job.slug}`)} className="w-full" />
            </div>
            <Link
              href="/post-a-job"
              className="group card flex items-center justify-between gap-3 p-4 text-sm transition-colors hover:border-line-strong"
            >
              <span>
                <span className="block font-medium text-fg">Hiring a design engineer?</span>
                <span className="text-[13px] text-muted">
                  ${STANDARD_PRICE_USD} for {LISTING_DAYS} days, live in a minute.
                </span>
              </span>
              <ArrowRight className="arrow text-muted" />
            </Link>
          </aside>
        </div>

        {similar.length ? (
          <section className="reveal mt-20" aria-labelledby="similar-heading">
            <SectionHeading
              id="similar-heading"
              kicker="Keep looking"
              title="Similar roles"
              action={
                <Link href={family ? `/roles/${family}` : "/"} className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-fg">
                  All {family ? roleLabel(family).toLowerCase() : "design engineer"} jobs <ArrowRight className="arrow" />
                </Link>
              }
            />
            <div className="mt-5">
              <JobList jobs={similar} />
            </div>
          </section>
        ) : null}
      </div>

      {!expired ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/90 px-4 py-3 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{job.title}</p>
              <p className="truncate text-xs text-muted">
                {job.companyName}
                {salary ? ` · ${salary}` : ""}
              </p>
            </div>
            <a href={applyHref} target="_blank" rel="noopener noreferrer" className="btn btn-accent shrink-0">
              Apply
              <ArrowUpRight className="arrow" />
            </a>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[12px] font-medium text-muted">{label}</dt>
      <dd className="mt-0.5 text-fg">{children}</dd>
    </div>
  );
}
