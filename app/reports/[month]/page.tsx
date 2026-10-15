import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { LinkPills, SectionHeading, StatStrip } from "@/components/ui";
import { ROLES, skillBySlug } from "@/lib/catalog";
import { formatMoney, formatSalary } from "@/lib/format";
import { breadcrumbLd, datasetLd } from "@/lib/jsonld";
import { listedJobs, medianSalary, salaryBands } from "@/lib/query";
import { pageMeta } from "@/lib/seo";
import { getAllJobs } from "@/lib/store";

function currentMonth() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(month: string) {
  const [year, value] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, value - 1, 1)));
}

export async function generateMetadata({ params }: { params: Promise<{ month: string }> }) {
  const { month } = await params;
  const live = month === currentMonth();
  return pageMeta({
    title: `Design engineering jobs report ${month}`,
    description: `Design engineering jobs report for ${month}. Open software roles, the fully remote share, and employer-posted salary. Hardware listings are excluded.`,
    path: `/reports/${month}`,
    index: live,
  });
}

export default async function ReportPage({ params }: { params: Promise<{ month: string }> }) {
  const { month } = await params;
  if (!/^\d{4}-\d{2}$/.test(month)) notFound();
  const live = month === currentMonth();
  const jobs = listedJobs(await getAllJobs());
  const remote = jobs.filter((job) => job.workplace === "remote").length;
  const hybrid = jobs.filter((job) => job.workplace === "hybrid").length;
  const onsite = jobs.length - remote - hybrid;
  const salary = medianSalary(jobs);
  const bands = salaryBands(jobs);
  const withPay = jobs.filter((job) => job.salaryUnit === "YEAR" && job.salaryMin != null).length;
  const companies = new Map<string, { name: string; count: number; slug: string }>();
  for (const job of jobs) {
    const row = companies.get(job.companySlug) || { name: job.companyName, count: 0, slug: job.companySlug };
    row.count += 1;
    companies.set(job.companySlug, row);
  }
  const topCompanies = [...companies.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, 8);
  const skills = new Map<string, number>();
  for (const job of jobs) for (const skill of job.skills) skills.set(skill, (skills.get(skill) || 0) + 1);
  const topSkills = [...skills.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxSkill = topSkills[0]?.[1] || 1;
  const families = ROLES.map((role) => ({ role, count: jobs.filter((job) => job.titleFamily === role.slug).length }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);
  const pct = (value: number) => (jobs.length ? Math.round((value / jobs.length) * 100) : 0);
  const label = monthLabel(month);

  return (
    <article>
      <JsonLd data={breadcrumbLd([{ name: "Jobs", path: "/" }, { name: `Jobs report ${month}`, path: `/reports/${month}` }])} />
      {live ? (
        <JsonLd
          data={datasetLd({
            name: `Design engineering jobs report ${month}`,
            description: "Open software design engineering roles, remote share, skills mentioned, and employer-posted salary ranges.",
            path: `/reports/${month}`,
          })}
        />
      ) : null}
      <PageHeader
        crumbs={[{ name: "Jobs", path: "/" }, { name: `Report ${month}`, path: `/reports/${month}` }]}
        kicker={`Monthly report · ${label}`}
        title={`Design engineering jobs report ${month}`}
        lede={
          live
            ? `This month’s report is the live board: ${jobs.length} open software roles, ${pct(remote)}% fully remote${salary ? `, median posted midpoint ${formatMoney(salary.value, salary.currency)}` : ""}.`
            : "No archived snapshot for this month."
        }
      >
        {live ? (
          <div className="mt-8 max-w-3xl">
            <StatStrip
              stats={[
                { label: "Open roles", value: String(jobs.length) },
                { label: "Companies hiring", value: String(companies.size) },
                { label: "Fully remote", value: `${pct(remote)}%` },
                { label: "Publish salary", value: `${pct(withPay)}%` },
              ]}
            />
          </div>
        ) : null}
      </PageHeader>

      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        {!live ? (
          <p className="mt-10 text-sm text-muted">Historical snapshots are not stored yet. This URL stays noindex until a month is archived.</p>
        ) : (
          <>
            <p className="mt-10 text-[15.5px] leading-7 text-fg-2">
              The {label} report counts every open software design role on Design Code Jobs: design engineers, UX and UI engineers, design technologists, creative technologists, and design systems engineers. Roles come from public Greenhouse, Lever, and Ashby boards plus paid posts. Mechanical, hardware, chip, and audiovisual design roles are excluded. Salary figures are yearly base ranges the employer published, kept in their own currency.
            </p>

            <section className="reveal mt-12" aria-labelledby="workplace-heading">
              <SectionHeading id="workplace-heading" kicker="Workplace" title="Where the work happens" />
              <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-chip" aria-hidden>
                <span className="bg-accent" style={{ width: `${pct(remote)}%` }} />
                <span className="bg-[color-mix(in_srgb,var(--accent)_45%,var(--chip))]" style={{ width: `${pct(hybrid)}%` }} />
              </div>
              <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-fg-2">
                <li>Fully remote: {remote} ({pct(remote)}%)</li>
                <li>Hybrid: {hybrid} ({pct(hybrid)}%)</li>
                <li>On-site: {onsite} ({pct(onsite)}%)</li>
              </ul>
            </section>

            <section className="reveal mt-12" aria-labelledby="titles-heading">
              <SectionHeading id="titles-heading" kicker="Titles" title="Open roles by title" />
              <ul className="card mt-5 divide-y divide-line">
                {families.map(({ role, count }) => (
                  <li key={role.slug} className="flex items-center justify-between px-5 py-3 text-sm">
                    <Link href={`/roles/${role.slug}`} className="font-medium hover:text-accent-text">{role.h1}</Link>
                    <span className="font-mono text-[13px] tabular">{count}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="reveal mt-12" aria-labelledby="skills-heading">
              <SectionHeading id="skills-heading" kicker="Skills" title="Skills mentioned in descriptions" />
              <ul className="mt-5 grid gap-2.5">
                {topSkills.length ? (
                  topSkills.map(([skill, count]) => (
                    <li key={skill} className="grid grid-cols-[120px_1fr_40px] items-center gap-3 text-sm">
                      <Link href={`/skills/${skill}`} className="truncate hover:text-accent-text">{skillBySlug(skill)?.label || skill}</Link>
                      <span className="h-2 overflow-hidden rounded-full bg-chip" aria-hidden>
                        <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.round((count / maxSkill) * 100)}%` }} />
                      </span>
                      <span className="text-right font-mono text-[13px] tabular">{count}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-muted">No skill mentions yet.</li>
                )}
              </ul>
              <p className="mt-3 text-xs text-muted">Word matches in the hosted description, not a survey of how teams spend their week.</p>
            </section>

            <section className="reveal mt-12" aria-labelledby="pay-heading">
              <SectionHeading id="pay-heading" kicker="Pay" title="Employer-posted salary" />
              <p className="mt-3 text-[15px] leading-7 text-fg-2">
                {withPay} of {jobs.length} open roles publish a yearly base range.{" "}
                {bands.map((band) => `${band.currency}: ${band.count} ${band.count === 1 ? "range" : "ranges"}, ${formatMoney(band.min, band.currency)}–${formatMoney(band.max, band.currency)}, median midpoint ${formatMoney(band.median, band.currency)}.`).join(" ")}{" "}
                The full table is on the <Link href="/salary" className="link">design engineer salary</Link> page.
              </p>
            </section>

            <section className="reveal mt-12" aria-labelledby="companies-heading">
              <SectionHeading id="companies-heading" kicker="Companies" title="Most open roles" />
              <div className="mt-5">
                <LinkPills links={topCompanies.map((row) => ({ href: `/companies/${row.slug}`, label: row.name, count: row.count }))} />
              </div>
            </section>

            <section className="reveal mt-12" aria-labelledby="notable-heading">
              <SectionHeading id="notable-heading" kicker="Notable" title="Notable open roles" />
              <ul className="card mt-5 divide-y divide-line">
                {jobs.slice(0, 8).map((job) => (
                  <li key={job.id}>
                    <Link href={`/jobs/${job.slug}`} className="flex flex-col gap-1 px-5 py-3.5 transition-colors hover:bg-chip/50 sm:flex-row sm:items-center sm:justify-between">
                      <span>
                        <span className="block font-medium">{job.title}</span>
                        <span className="text-[13px] text-muted">{job.companyName}</span>
                      </span>
                      {formatSalary(job) ? <span className="chip chip-salary tabular">{formatSalary(job)}</span> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </article>
  );
}
