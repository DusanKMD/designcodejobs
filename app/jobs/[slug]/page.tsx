import Link from "next/link";
import { notFound } from "next/navigation";
import { JobList, Monogram } from "@/components/job-list";
import { JsonLd } from "@/components/json-ld";
import { skillBySlug } from "@/lib/catalog";
import { formatDate, formatSalary, hostLabel, jobFacts, withApplyUtm } from "@/lib/format";
import { countryLabel } from "@/lib/location";
import { breadcrumbLd, buildJobPosting } from "@/lib/jsonld";
import { effectiveStatus, isGone } from "@/lib/model";
import { roleLabel } from "@/lib/query";
import { similarJobs } from "@/lib/query";
import { pageMeta } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { getAllJobs, getJobBySlug } from "@/lib/store";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return {};
  const status = effectiveStatus(job);
  const description = `${job.title} at ${job.companyName}. ${jobFacts(job)}. ${formatSalary(job) || "Salary not posted."}`;
  return pageMeta({
    title: `${job.title} at ${job.companyName}`,
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

  return (
    <article className="mx-auto max-w-3xl px-5 py-10">
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
      <div className="mt-6 flex items-center gap-3">
        <Monogram name={job.companyName} />
        <p className="text-sm text-muted">
          <Link href={`/companies/${job.companySlug}`} className="text-fg underline underline-offset-4">{job.companyName}</Link>
        </p>
      </div>
      <h1 className="mt-4 text-4xl text-balance sm:text-5xl">{job.title}</h1>
      <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Workplace</dt>
          <dd className="mt-1 text-fg">{jobFacts(job)}</dd>
        </div>
        <div>
          <dt className="text-muted">Posted</dt>
          <dd className="mt-1 text-fg">{job.datePosted ? <time dateTime={job.datePosted}>{formatDate(job.datePosted)}</time> : "Date not posted"}</dd>
        </div>
        <div>
          <dt className="text-muted">Salary</dt>
          <dd className="mt-1 text-fg">
            {salary || "Not posted by the employer"}
            {job.salaryNote ? <span className="mt-1 block text-muted">{job.salaryNote}</span> : null}
          </dd>
        </div>
        {job.workplace === "remote" && job.applicantCountries.length ? (
          <div>
            <dt className="text-muted">Applicants in</dt>
            <dd className="mt-1 text-fg">{job.applicantCountries.map(countryLabel).join(", ")}</dd>
          </div>
        ) : null}
      </dl>
      {job.skills.length ? (
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Skills">
          {job.skills.map((skill) => (
            <li key={skill} className="rounded-full bg-chip px-2.5 py-0.5 text-xs text-muted">
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
          className="mt-6 inline-flex h-11 items-center rounded-full bg-fg px-5 text-sm font-medium text-bg"
        >
          Apply on {hostLabel(job.applyUrl)}
        </a>
      ) : null}
      <div className="job-body mt-10 border-t border-line pt-8 text-[17px]" dangerouslySetInnerHTML={{ __html: job.descriptionHtml || `<p>${job.descriptionText || "The employer did not include a description in the public posting."}</p>` }} />
      <p className="mt-8 text-sm text-muted">
        Canonical listing: {absoluteUrl(`/jobs/${job.slug}`)}. Applications are completed on the original posting.
      </p>
      <section className="mt-12" aria-labelledby="similar-heading">
        <h2 id="similar-heading" className="text-lg font-medium tracking-tight">Similar roles</h2>
        <div className="mt-4">
          <JobList jobs={similarJobs(all, job)} />
        </div>
      </section>
    </article>
  );
}
