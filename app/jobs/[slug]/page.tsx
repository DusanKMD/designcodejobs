import Link from "next/link";
import { notFound } from "next/navigation";
import { JobList } from "@/components/job-list";
import { JsonLd } from "@/components/json-ld";
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
    <article className="mx-auto max-w-3xl px-5 py-8">
      <JsonLd data={breadcrumbLd(crumbs)} />
      {schema ? <JsonLd data={schema} /> : null}
      <nav className="text-sm text-muted">
        <Link href="/" className="hover:text-fg">Jobs</Link>
        {family ? <> / <Link href={`/roles/${family}`} className="hover:text-fg">{roleLabel(family)} jobs</Link></> : null}
      </nav>
      {expired ? (
        <p className="mt-6 rounded-xl border border-line bg-chip px-4 py-3 text-sm">
          This role is no longer open{job.expiredAt ? ` (closed ${formatDate(job.expiredAt)})` : ""}. The description stays up for reference. Similar open roles are below.
        </p>
      ) : null}
      <h1 className="mt-6 text-4xl font-medium tracking-tight text-balance">{job.title}</h1>
      <p className="mt-3 text-muted">
        <Link href={`/companies/${job.companySlug}`} className="text-fg underline underline-offset-4">{job.companyName}</Link>
        {" · "}
        {jobFacts(job)}
        {job.datePosted ? ` · Posted ${formatDate(job.datePosted)}` : ""}
      </p>
      {salary ? (
        <p className="mt-6 text-2xl font-medium tabular-nums tracking-tight">
          {salary}
          {job.salaryNote ? <span className="mt-1 block text-sm font-normal text-muted">{job.salaryNote}</span> : null}
        </p>
      ) : (
        <p className="mt-6 text-sm text-muted">Salary not posted by the employer.</p>
      )}
      {job.workplace === "remote" && job.applicantCountries.length ? (
        <p className="mt-2 text-sm text-muted">
          Fully remote. Applicants in {job.applicantCountries.map(countryLabel).join(", ")}.
        </p>
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
      <div className="job-body mt-10 border-t border-line pt-8" dangerouslySetInnerHTML={{ __html: job.descriptionHtml || `<p>${job.descriptionText || "The employer did not include a description in the public posting."}</p>` }} />
      <p className="mt-8 text-sm text-muted">
        Canonical listing: {absoluteUrl(`/jobs/${job.slug}`)}. Applications are completed on the original posting.
      </p>
      <section className="mt-12">
        <h2 className="text-lg font-medium tracking-tight">Similar roles</h2>
        <div className="mt-4">
          <JobList jobs={similarJobs(all, job)} />
        </div>
      </section>
    </article>
  );
}
