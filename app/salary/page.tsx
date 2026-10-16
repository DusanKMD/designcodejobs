import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { SectionHeading, StatStrip } from "@/components/ui";
import { SALARY_ROLES } from "@/lib/catalog";
import { formatMoney, formatSalary } from "@/lib/format";
import { breadcrumbLd, datasetLd, faqLd } from "@/lib/jsonld";
import { listedJobs, salaryBands, type SalaryBand } from "@/lib/query";
import { pageMeta } from "@/lib/seo";
import { getAllJobs } from "@/lib/store";

export const metadata = pageMeta({
  title: "Design engineer salary",
  description:
    "Design engineer salary ranges from software job posts. Base pay the employer published — not mechanical engineering averages, and not estimated.",
  path: "/salary",
  index: true,
});

const SALARY_FAQS = [
  {
    q: "Which roles publish a range?",
    a: "Pay is split by the title on the posting, and each currency stays separate. A UX engineer range is not averaged into a design systems range. An empty cell means no employer published a yearly base for that role, not that the role is unpaid.",
  },
  {
    q: "Which listings include pay?",
    a: "Each row is an open software role with a yearly base the employer wrote on the posting. The figure is that range, not a midpoint invented for the table. Roles without a published yearly range are left off this list.",
  },
  {
    q: "How is this salary counted?",
    a: "A range is counted only when the employer published it as yearly base pay. Equity, OTE, and hidden compensation stay out. Each currency is counted on its own, and nothing is converted. The median is the median of the USD midpoints when a USD range exists.",
  },
];

function rangeLabel(bands: SalaryBand[]) {
  if (!bands.length) return "—";
  return bands.map((item) => `${formatMoney(item.min, item.currency)}–${formatMoney(item.max, item.currency)}`).join(", ");
}

export default async function SalaryPage() {
  const jobs = listedJobs(await getAllJobs());
  const paid = jobs.filter((job) => job.salaryUnit === "YEAR");
  const bands = salaryBands(jobs);
  const usd = bands.find((item) => item.currency === "USD") || null;
  const others = bands.filter((item) => item.currency !== "USD");
  const families = SALARY_ROLES.map((role) => ({
    role,
    bands: salaryBands(jobs.filter((job) => job.titleFamily === role.family)),
  }));
  const design = salaryBands(jobs.filter((job) => job.titleFamily === "design-engineer"));

  return (
    <article>
      <JsonLd data={breadcrumbLd([{ name: "Jobs", path: "/" }, { name: "Design engineer salary", path: "/salary" }])} />
      <JsonLd data={faqLd(SALARY_FAQS)} />
      <JsonLd
        data={datasetLd({
          name: "Design engineer salary",
          description: "Employer-posted base salary ranges for software design engineer, UX engineer, UI engineer, and related roles.",
          path: "/salary",
        })}
      />
      <PageHeader
        crumbs={[{ name: "Jobs", path: "/" }, { name: "Design engineer salary", path: "/salary" }]}
        kicker="Salary data"
        title="Design engineer salary"
        lede="Design engineer salary here is the yearly base employers wrote on software postings. It is not a mechanical average, and it is not estimated."
      >
        {usd ? (
          <div className="mt-8 max-w-3xl">
            <StatStrip
              stats={[
                { label: "Median posted midpoint", value: formatMoney(usd.median, "USD") },
                { label: "Lowest posted minimum", value: formatMoney(usd.min, "USD") },
                { label: "Highest posted maximum", value: formatMoney(usd.max, "USD") },
                { label: "USD ranges counted", value: String(usd.count) },
              ]}
            />
          </div>
        ) : null}
      </PageHeader>

      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <div className="mt-10 space-y-4 text-[15.5px] leading-7 text-fg-2">
          <p>
            Design engineer salary on the open web is mostly mechanical and hardware data. This page uses only base pay that employers wrote on software postings: design engineers who ship UI, plus UX engineer, UI engineer, design technologist, and design systems roles. Nothing here is estimated, crowdsourced, or converted from total compensation.
          </p>
          <p>
            {usd
              ? `${usd.count} open listings include a yearly USD range, from ${formatMoney(usd.min, "USD")} to ${formatMoney(usd.max, "USD")}, with a median midpoint near ${formatMoney(usd.median, "USD")}.`
              : "None of the open listings publish a yearly USD range yet. The table stays empty until an employer includes pay. Check back after the next board sync."}
            {others.length
              ? ` ${others.map((item) => `${item.currency} ranges run ${formatMoney(item.min, item.currency)}–${formatMoney(item.max, item.currency)} (${item.count})`).join(". ")}. Those figures stay in the currency the employer posted.`
              : ""}
          </p>
          {design.length ? (
            <p>
              Software design engineer postings with pay: {rangeLabel(design)} ({design.reduce((sum, item) => sum + item.count, 0)} listings).
            </p>
          ) : null}
        </div>

        <p className="mt-6 text-[15px] leading-7 text-fg-2">
          Want a number for your role, level and location? The <Link href="/tools/design-engineer-salary-calculator" className="link">design engineer salary calculator</Link> gives a p25, median and p75 from these same posted ranges.
        </p>

        <section className="reveal mt-14" aria-labelledby="by-role-heading">
          <SectionHeading id="by-role-heading" kicker="By role" title={SALARY_FAQS[0].q} />
          <p className="mt-3 text-[15px] leading-7 text-muted">{SALARY_FAQS[0].a}</p>
          <div className="card mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Posted yearly salary by role</caption>
              <thead className="border-b border-line bg-chip/60 text-[12px] text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">Role</th>
                  <th scope="col" className="px-5 py-3 font-medium">Posted range</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">Listings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                <tr className="transition-colors hover:bg-chip/50">
                  <td className="px-5 py-3.5"><Link href="/roles/design-engineer" className="font-medium hover:text-accent-text">Design engineer</Link></td>
                  <td className="px-5 py-3.5 tabular text-fg-2">{rangeLabel(design)}</td>
                  <td className="px-5 py-3.5 text-right font-mono text-[13px] tabular">{design.reduce((sum, item) => sum + item.count, 0)}</td>
                </tr>
                {families.map(({ role, bands: roleBands }) => (
                  <tr key={role.slug} className="transition-colors hover:bg-chip/50">
                    <td className="px-5 py-3.5"><Link href={`/salary/${role.slug}`} className="font-medium hover:text-accent-text">{role.h1.replace(" salary", "")}</Link></td>
                    <td className="px-5 py-3.5 tabular text-fg-2">{rangeLabel(roleBands)}</td>
                    <td className="px-5 py-3.5 text-right font-mono text-[13px] tabular">{roleBands.reduce((sum, item) => sum + item.count, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="reveal mt-14" aria-labelledby="listings-heading">
          <SectionHeading id="listings-heading" kicker="Source listings" title={SALARY_FAQS[1].q} />
          <p className="mt-3 text-[15px] leading-7 text-muted">{SALARY_FAQS[1].a}</p>
          <ul className="card mt-5 divide-y divide-line">
            {paid.length ? (
              paid.map((job) => (
                <li key={job.id}>
                  <Link href={`/jobs/${job.slug}`} className="group flex flex-col gap-1 px-5 py-3.5 transition-colors hover:bg-chip/50 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      <span className="block font-medium text-fg">{job.title}</span>
                      <span className="text-[13px] text-muted">{job.companyName}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="chip chip-salary tabular">{formatSalary(job)}</span>
                      <ArrowRight className="arrow hidden text-subtle sm:block" />
                    </span>
                  </Link>
                </li>
              ))
            ) : (
              <li className="px-5 py-6 text-sm text-muted">No posted ranges yet.</li>
            )}
          </ul>
        </section>

        <section className="reveal mt-14" aria-labelledby="method-heading">
          <SectionHeading id="method-heading" kicker="Method" title={SALARY_FAQS[2].q} />
          <p className="mt-3 text-[15px] leading-7 text-muted">{SALARY_FAQS[2].a}</p>
          <p className="mt-3 text-sm leading-7 text-muted">
            A range is included only when the source board exposes it as salary (Ashby compensation, Lever salary range, or a figure written in the Greenhouse description) and it is yearly base pay. Equity, OTE, and hidden compensation are left out of the schema and this table. Each currency is counted on its own. The median is the median of USD range midpoints when a USD range exists, otherwise the currency with a posted range. Nothing is converted. The <Link href="/guides/design-engineer-salary" className="link">salary guide</Link> explains the method. Per-role pages: {SALARY_ROLES.map((role) => role.h1).join(", ")}.
          </p>
        </section>
      </div>
    </article>
  );
}
