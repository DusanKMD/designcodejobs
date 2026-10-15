import Link from "next/link";
import { formatMoney, formatSalary, workplaceLabel } from "@/lib/format";
import { listedJobs, salaryBands, type SalaryBand } from "@/lib/query";
import { getAllJobs } from "@/lib/store";
import type { Job, SkillSlug } from "@/lib/types";

function money(amount: number, currency: string) {
  return formatMoney(amount, currency);
}

function bandLabel(bands: SalaryBand[]) {
  if (!bands.length) return "No yearly base range in the current sample";
  return bands
    .map((band) => `${money(band.min, band.currency)}–${money(band.max, band.currency)} (${band.count} ${band.currency})`)
    .join("; ");
}

function yearly(jobs: Job[]) {
  return jobs.filter((job) => job.salaryUnit === "YEAR" && job.salaryMin != null && job.salaryMax != null);
}

export async function SampleSignals() {
  const jobs = listedJobs(await getAllJobs());
  const count = (skill: SkillSlug) => jobs.filter((job) => job.skills.includes(skill)).length;
  return (
    <p className="mt-3 text-[15px] leading-7 text-muted">
      In the current sample of {jobs.length} open listings, the hosted text matches React on {count("react")}, Figma on {count("figma")}, and “design system” on {count("design-systems")}. Framer, the design tool, matches {count("framer")}. These are word matches on the posting, not a survey of how teams spend their week.
    </p>
  );
}

export async function SalarySnapshot() {
  const jobs = listedJobs(await getAllJobs());
  const bands = salaryBands(jobs);
  const usd = bands.find((band) => band.currency === "USD") || null;
  const others = bands.filter((band) => band.currency !== "USD");
  const design = salaryBands(jobs.filter((job) => job.titleFamily === "design-engineer"));
  const designUsd = design.find((band) => band.currency === "USD") || null;

  return (
    <div className="mt-4">
      <p className="text-[15px] leading-7 text-muted">
        {usd
          ? `${usd.count} open listings publish a yearly USD base range. The lowest minimum is ${money(usd.min, "USD")} and the highest maximum is ${money(usd.max, "USD")}. The median of the range midpoints is ${money(usd.median, "USD")}.`
          : "No open listing currently publishes a yearly USD base range."}
        {designUsd
          ? ` Among postings counted as design engineer, that is ${designUsd.count} USD ranges, ${money(designUsd.min, "USD")}–${money(designUsd.max, "USD")}, median midpoint ${money(designUsd.median, "USD")}.`
          : ""}
      </p>
      {others.length ? (
        <p className="mt-3 text-[15px] leading-7 text-muted">
          Other currencies stay in the currency the employer posted.{" "}
          {others
            .map(
              (band) =>
                `${band.currency}: ${band.count} yearly ${band.count === 1 ? "range" : "ranges"}, ${money(band.min, band.currency)}–${money(band.max, band.currency)}, median midpoint ${money(band.median, band.currency)}.`,
            )
            .join(" ")}
        </p>
      ) : null}
      <p className="mt-3 text-[15px] leading-7 text-muted">
        The same figures, with every listing named, are on the <Link href="/salary">design engineer salary</Link> page. This paragraph is rendered from those listings, so it moves when a role opens or closes.
      </p>
    </div>
  );
}

const ROLE_ROWS: { href: string; label: string; family: Job["titleFamily"] | null }[] = [
  { href: "/salary", label: "All software listings", family: null },
  { href: "/roles/design-engineer", label: "Design engineer", family: "design-engineer" },
  { href: "/salary/ux-engineer", label: "UX engineer", family: "ux-engineer" },
  { href: "/salary/ui-engineer", label: "UI engineer", family: "ui-engineer" },
  { href: "/salary/design-technologist", label: "Design technologist", family: "design-technologist" },
  { href: "/salary/design-systems-engineer", label: "Design systems engineer", family: "design-systems-engineer" },
  { href: "/salary/creative-technologist", label: "Creative technologist", family: "creative-technologist" },
];

export async function RolePayTable() {
  const jobs = listedJobs(await getAllJobs());
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-muted">
          <tr className="border-b border-line">
            <th className="py-2 font-medium">Role</th>
            <th className="py-2 font-medium">Yearly posted range</th>
          </tr>
        </thead>
        <tbody>
          {ROLE_ROWS.map((row) => {
            const slice = row.family ? jobs.filter((job) => job.titleFamily === row.family) : jobs;
            return (
              <tr key={row.label} className="border-b border-line">
                <td className="py-3">
                  <Link href={row.href} className="underline underline-offset-4">
                    {row.label}
                  </Link>
                </td>
                <td className="py-3 tabular-nums">{bandLabel(salaryBands(slice))}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export async function UxSalaryNote() {
  const jobs = yearly(listedJobs(await getAllJobs()).filter((job) => job.titleFamily === "ux-engineer"));
  if (!jobs.length) {
    return (
      <p className="mt-3 text-[15px] leading-7 text-muted">
        No open UX engineer listing currently publishes a yearly base range.{" "}
        <Link href="/salary/ux-engineer">UX engineer salary</Link> stays up so the figure can appear when an employer posts one. One posting, when it exists, is a single requisition, not a market rate.
      </p>
    );
  }
  return (
    <p className="mt-3 text-[15px] leading-7 text-muted">
      The current sample has {jobs.length} yearly UX engineer {jobs.length === 1 ? "posting" : "postings"} with pay:{" "}
      {jobs.map((job, index) => (
        <span key={job.id}>
          {index > 0 ? "; " : ""}
          <Link href={`/jobs/${job.slug}`}>{job.title}</Link> at {job.companyName}, {formatSalary(job)}
          {job.workplace ? `, ${workplaceLabel(job.workplace).toLowerCase()}` : ""}
        </span>
      ))}
      . {jobs.length === 1 ? "One posting is a single requisition, not a market rate. " : ""}
      The running table is <Link href="/salary/ux-engineer">UX engineer salary</Link>. Open roles are on{" "}
      <Link href="/roles/ux-engineer">UX engineer jobs</Link>.
    </p>
  );
}

export async function WorkplacePay() {
  const jobs = yearly(listedJobs(await getAllJobs()).filter((job) => job.titleFamily === "design-engineer" && (job.salaryCurrency || "USD") === "USD"));
  const remote = salaryBands(jobs.filter((job) => job.workplace === "remote"));
  const other = salaryBands(jobs.filter((job) => job.workplace !== "remote"));
  const remoteBand = remote[0];
  const otherBand = other[0];
  if (!remoteBand || !otherBand) {
    return (
      <p className="mt-3 text-[15px] leading-7 text-muted">
        The USD design-engineer sample is too small to split remote from hybrid and on-site.{" "}
        <Link href="/remote">Remote design engineer jobs</Link> lists the open remote roles.
      </p>
    );
  }
  return (
    <p className="mt-3 text-[15px] leading-7 text-muted">
      Among software design engineer listings with a yearly USD range, {remoteBand.count} are fully remote ({money(remoteBand.min, "USD")}–{money(remoteBand.max, "USD")}, median midpoint {money(remoteBand.median, "USD")}) and {otherBand.count} are hybrid or on-site ({money(otherBand.min, "USD")}–{money(otherBand.max, "USD")}, median midpoint {money(otherBand.median, "USD")}). Staff roles sit in both groups, and both samples are small, so the gap is a description of this sample, not a remote premium. See <Link href="/remote">remote design engineer jobs</Link>.
    </p>
  );
}

const NAMED = ["Vercel", "WorkOS", "Linear"];

export async function NamedPostings() {
  const jobs = listedJobs(await getAllJobs());
  return (
    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-7 text-muted">
      {NAMED.map((name) => {
        const rows = jobs.filter((job) => job.companyName === name);
        const paid = yearly(rows);
        if (!rows.length) {
          return <li key={name}>{name} has no open listing in the current sample.</li>;
        }
        if (!paid.length) {
          return (
            <li key={name}>
              {name} has {rows.length} open {rows.length === 1 ? "listing" : "listings"} ({rows.map((job) => job.title).join("; ")}) and does not publish a yearly base range on {rows.length === 1 ? "it" : "them"}.
            </li>
          );
        }
        return (
          <li key={name}>
            {paid.map((job, index) => (
              <span key={job.id}>
                {index > 0 ? " " : ""}
                <Link href={`/jobs/${job.slug}`}>{job.companyName} — {job.title}</Link>
                {": "}
                {formatSalary(job)}
                {job.locationRaw ? ` (${job.locationRaw})` : ""}.
              </span>
            ))}
          </li>
        );
      })}
    </ul>
  );
}
