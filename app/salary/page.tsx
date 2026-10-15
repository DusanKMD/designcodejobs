import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { SALARY_ROLES } from "@/lib/catalog";
import { formatMoney, formatSalary } from "@/lib/format";
import { breadcrumbLd, datasetLd } from "@/lib/jsonld";
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
    <article className="mx-auto max-w-3xl px-5 py-10">
      <JsonLd data={breadcrumbLd([{ name: "Jobs", path: "/" }, { name: "Design engineer salary", path: "/salary" }])} />
      <JsonLd
        data={datasetLd({
          name: "Design engineer salary",
          description: "Employer-posted base salary ranges for software design engineer, UX engineer, UI engineer, and related roles.",
          path: "/salary",
        })}
      />
      <p className="text-sm text-muted"><Link href="/" className="hover:text-fg">Jobs</Link> / Design engineer salary</p>
      <h1 className="mt-4 text-4xl font-medium tracking-tight sm:text-5xl">Design engineer salary</h1>
      <p className="mt-5 text-[15px] leading-7 text-muted">
        Design engineer salary on the open web is mostly mechanical and hardware data. This page uses only base pay that employers wrote on software postings: design engineers who ship UI, plus UX engineer, UI engineer, design technologist, and design systems roles. Nothing here is estimated, crowdsourced, or converted from total compensation.
      </p>
      <p className="mt-3 text-[15px] leading-7 text-muted">
        {usd
          ? `${usd.count} open listings include a yearly USD range, from ${formatMoney(usd.min, "USD")} to ${formatMoney(usd.max, "USD")}, with a median midpoint near ${formatMoney(usd.median, "USD")}.`
          : "None of the open listings publish a yearly USD range yet. The table stays empty until an employer includes pay. Check back after the next board sync."}
        {others.length
          ? ` ${others.map((item) => `${item.currency} ranges run ${formatMoney(item.min, item.currency)}–${formatMoney(item.max, item.currency)} (${item.count})`).join(". ")}. Those figures stay in the currency the employer posted.`
          : ""}
      </p>
      {design.length ? (
        <p className="mt-3 text-[15px] leading-7 text-muted">
          Software design engineer postings with pay: {rangeLabel(design)} ({design.reduce((sum, item) => sum + item.count, 0)} listings).
        </p>
      ) : null}

      <h2 className="mt-10 text-xl font-medium tracking-tight">By role</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-muted">
            <tr className="border-b border-line">
              <th className="py-2 font-medium">Role</th>
              <th className="py-2 font-medium">Posted range</th>
              <th className="py-2 font-medium">Listings</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line">
              <td className="py-3"><Link href="/roles/design-engineer" className="underline underline-offset-4">Design engineer</Link></td>
              <td className="py-3 tabular-nums">{rangeLabel(design)}</td>
              <td className="py-3 tabular-nums">{design.reduce((sum, item) => sum + item.count, 0)}</td>
            </tr>
            {families.map(({ role, bands: roleBands }) => (
              <tr key={role.slug} className="border-b border-line">
                <td className="py-3"><Link href={`/salary/${role.slug}`} className="underline underline-offset-4">{role.h1.replace(" salary", "")}</Link></td>
                <td className="py-3 tabular-nums">{rangeLabel(roleBands)}</td>
                <td className="py-3 tabular-nums">{roleBands.reduce((sum, item) => sum + item.count, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-xl font-medium tracking-tight">Listings with pay</h2>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {paid.length ? paid.map((job) => (
          <li key={job.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between">
            <Link href={`/jobs/${job.slug}`} className="font-medium hover:underline">{job.title}</Link>
            <span className="text-sm tabular-nums text-muted">{job.companyName} · {formatSalary(job)}</span>
          </li>
        )) : <li className="py-6 text-sm text-muted">No posted ranges yet.</li>}
      </ul>

      <h2 className="mt-10 text-xl font-medium tracking-tight">How this is counted</h2>
      <p className="mt-3 text-sm leading-7 text-muted">
        A range is included only when the source board exposes it as salary (Ashby compensation, Lever salary range, or a figure written in the Greenhouse description) and it is yearly base pay. Equity, OTE, and hidden compensation are left out of the schema and this table. Each currency is counted on its own. The median is the median of USD range midpoints when a USD range exists, otherwise the currency with a posted range. Nothing is converted. See the <Link href="/guides/design-engineer-salary" className="text-fg underline underline-offset-4">salary guide outline</Link> for what a fuller write-up will cover. Per-role pages: {SALARY_ROLES.map((role) => role.h1).join(", ")}.
      </p>
    </article>
  );
}
