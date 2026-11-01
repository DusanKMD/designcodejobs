import { formatMoney } from "@/lib/format";
import { currentMonth, dayAndMonth, longDate, monthLabel, monthName } from "@/lib/reports/month";
import type { ReportNewRole, ReportSalaryRow, ReportSnapshot } from "@/lib/reports/types";

const ROLE_LABELS: Record<string, string> = {
  "design-engineer": "Design engineer",
  "design-systems-engineer": "Design systems engineer",
  "ux-engineer": "UX engineer",
  "ui-engineer": "UI engineer",
  "creative-technologist": "Creative technologist",
  "design-technologist": "Design technologist",
  "creative-developer": "Creative developer",
  prototyper: "Prototyper",
};

export function roleLabel(slug: string) {
  return ROLE_LABELS[slug] ?? slug;
}

export function workplaceLabel(workplace: ReportNewRole["workplace"]) {
  if (workplace === "remote") return "Remote";
  if (workplace === "hybrid") return "Hybrid";
  return "On-site";
}

/** A row with fewer than five listings is too thin to read as a market rate. */
export function isSmallSample(row: Pick<ReportSalaryRow, "listings">) {
  return row.listings < 5;
}

export function salaryRow(report: ReportSnapshot, roleFamily: string, currency: string) {
  return report.salaryByRoleAndCurrency.find((row) => row.roleFamily === roleFamily && row.currency === currency) ?? null;
}

function mustSalaryRow(report: ReportSnapshot, roleFamily: string, currency: string) {
  const row = salaryRow(report, roleFamily, currency);
  if (!row) throw new Error(`Snapshot ${report.month} is missing ${roleFamily} ${currency}`);
  return row;
}

function joinNames(names: string[]) {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function uniqueNames(roles: ReportNewRole[]) {
  const names: string[] = [];
  for (const role of roles) {
    if (!names.includes(role.company)) names.push(role.company);
  }
  return names;
}

/** ISO dates in the order the scope note states them, duplicates removed. */
export function scopeDates(note: string) {
  const seen = new Set<string>();
  const dates: string[] = [];
  for (const match of note.matchAll(/\d{4}-\d{2}-\d{2}/g)) {
    if (seen.has(match[0])) continue;
    seen.add(match[0]);
    dates.push(match[0]);
  }
  return dates;
}

function trackingDates(report: ReportSnapshot) {
  const dates = scopeDates(report.scopeNote);
  if (dates.length < 4) throw new Error(`Snapshot ${report.month} scope note needs four ISO dates`);
  return dates;
}

export function snapshotTitle(report: ReportSnapshot) {
  return `Design engineering jobs and salary report: ${monthLabel(report.month)}`;
}

export function snapshotDescription(report: ReportSnapshot) {
  const design = mustSalaryRow(report, "design-engineer", "USD");
  return `Frozen ${monthLabel(report.month)} design engineering jobs report: ${report.openAtLastSync} open roles at ${report.openCompanies} companies, ${report.newRoles.length} new posts, ${report.remoteShareOpenPct}% remote, ${formatMoney(design.medianMidpoint, "USD")} median USD midpoint. See who hired.`;
}

export function reportsIndexDescription(snapshots: ReportSnapshot[], now = new Date()) {
  const frozen = snapshots.filter((snapshot) => snapshot.month !== currentMonth(now));
  const latest = frozen[frozen.length - 1];
  if (!latest) return "Dated design engineering jobs reports. The current month is calculated from the live board.";
  return `Dated design engineering jobs reports. ${monthLabel(latest.month)} is a frozen snapshot, with ${latest.openAtLastSync} open roles at last sync. The current month stays live.`;
}

export function openingParagraph(report: ReportSnapshot) {
  const design = mustSalaryRow(report, "design-engineer", "USD");
  return `This ${monthLabel(report.month)} design engineering jobs and salary report is a frozen snapshot. At the last sync, ${report.openAtLastSync} open roles were listed at ${report.openCompanies} companies. ${report.newRoles.length} new roles were posted in ${monthName(report.month)}. ${report.remoteShareOpenPct}% of open roles were fully remote. The median posted USD midpoint for design engineer roles was ${formatMoney(design.medianMidpoint, "USD")}.`;
}

export function howManyAnswer(report: ReportSnapshot) {
  const [, lastSync] = trackingDates(report);
  return `At the last successful sync, ${report.openAtLastSync} design engineering jobs were open at ${report.openCompanies} companies. The board tracked ${report.trackedListings} listings at ${report.trackedCompanies} companies that month, and ${report.closedDuringMonth} listings closed before the sync. The count is software roles only and stops on ${longDate(lastSync)}.`;
}

export function whoHiredAnswer(report: ReportSnapshot) {
  const [top, ...rest] = report.topCompanies;
  if (!top) throw new Error(`Snapshot ${report.month} has no companies`);
  const others = rest.length
    ? `${joinNames(rest.map((row) => `${row.name} (${row.openRoles})`))} are the other companies with more than one open role.`
    : "No other company in this snapshot has more than one open role.";
  return `${top.name} had the most open design engineering roles, with ${top.openRoles} still open at the last sync. ${others} This ranking uses roles still open, not roles posted during the month alone.`;
}

export function remoteAnswer(report: ReportSnapshot) {
  const open = report.workplaceOpen;
  const tracked = report.workplaceTracked;
  return `Of the ${report.openAtLastSync} open roles, ${open.remote} were fully remote, ${open.hybrid} were hybrid, and ${open.onsite} were on-site. That fully remote share is ${report.remoteShareOpenPct}%. Across all ${report.trackedListings} tracked listings, including roles that closed, the split was ${tracked.remote} remote, ${tracked.hybrid} hybrid, and ${tracked.onsite} on-site. Hybrid weeks are not counted as remote.`;
}

export function salaryAnswer(report: ReportSnapshot) {
  const design = mustSalaryRow(report, "design-engineer", "USD");
  const systems = salaryRow(report, "design-systems-engineer", "USD");
  const lead = `Design engineer roles with a posted yearly USD range had a median midpoint of ${formatMoney(design.medianMidpoint, "USD")} across ${design.listings} listings. The lowest posted minimum was ${formatMoney(design.lowestPostedMin, "USD")} and the highest posted maximum was ${formatMoney(design.highestPostedMax, "USD")}.`;
  const extra = systems
    ? ` Design systems engineer roles in USD had a median midpoint of ${formatMoney(systems.medianMidpoint, "USD")} across ${systems.listings} listings.`
    : "";
  return `${lead}${extra} Currencies in the table are never converted.`;
}

export function remotePayAnswer(report: ReportSnapshot) {
  const remote = report.usdRemoteVsNot.remote;
  const other = report.usdRemoteVsNot.onsiteOrHybrid;
  const relation =
    remote.medianMidpoint === other.medianMidpoint ? "the same as" : remote.medianMidpoint > other.medianMidpoint ? "higher than" : "lower than";
  return `Fully remote USD listings with a posted yearly range had a median midpoint of ${formatMoney(remote.medianMidpoint, "USD")} (n=${remote.n}). On-site and hybrid USD listings together had a median midpoint of ${formatMoney(other.medianMidpoint, "USD")} (n=${other.n}). The remote median is ${relation} the on-site and hybrid median in this snapshot. Both samples are small, and no currency was converted.`;
}

export function newRolesAnswer(report: ReportSnapshot) {
  const dates = report.newRoles.map((role) => role.datePosted).sort();
  const first = dates[0];
  const last = dates[dates.length - 1];
  if (!first || !last) throw new Error(`Snapshot ${report.month} has no new roles`);
  return `${report.newRoles.length} design engineering jobs were posted in ${monthLabel(report.month)} and are included in this snapshot. ${joinNames(uniqueNames(report.newRoles))} posted them between ${dayAndMonth(first)} and ${dayAndMonth(last)}. The list below gives the company, title, date posted, and workplace for each role.`;
}

export function methodologyAnswer(report: ReportSnapshot) {
  const [launch, lastSync, pauseStart, pauseEnd] = trackingDates(report);
  return `Tracked from ${longDate(launch)} through the last successful ingest on ${longDate(lastSync)}. Ingest paused from ${longDate(pauseStart)} through ${longDate(pauseEnd)}, so later opens and closes are excluded. One internal test listing and two hardware listings were rejected. Pay is the employer-posted yearly range, the midpoint is (minimum + maximum) / 2, and currencies are never converted.`;
}

export type ReportSection = {
  id: string;
  kicker: string;
  question: string;
  answer: string;
};

export function reportSections(report: ReportSnapshot): ReportSection[] {
  const name = monthName(report.month);
  return [
    { id: "open-roles", kicker: "Open roles", question: "How many design engineering jobs were open?", answer: howManyAnswer(report) },
    { id: "companies", kicker: "Companies", question: "Who hired the most?", answer: whoHiredAnswer(report) },
    { id: "remote", kicker: "Workplace", question: "How many roles are remote?", answer: remoteAnswer(report) },
    {
      id: "salary",
      kicker: "Pay",
      question: "What do design engineers earn by role and currency?",
      answer: salaryAnswer(report),
    },
    { id: "remote-pay", kicker: "Remote pay", question: "Do remote roles pay more?", answer: remotePayAnswer(report) },
    {
      id: "new-roles",
      kicker: "New roles",
      question: `Which new roles were posted in ${name}?`,
      answer: newRolesAnswer(report),
    },
    {
      id: "method",
      kicker: "Method",
      question: `How was this ${name} report counted?`,
      answer: methodologyAnswer(report),
    },
  ];
}

export function reportFaqs(report: ReportSnapshot) {
  const [launch, lastSync, pauseStart, pauseEnd] = trackingDates(report);
  const name = monthName(report.month);
  return [
    {
      q: `Is this ${name} ${report.month.slice(0, 4)} report still changing?`,
      a: `No. It is a frozen snapshot of software design engineering listings tracked from launch on ${longDate(launch)} through the last successful ingest on ${longDate(lastSync)} UTC. Ingest paused from ${longDate(pauseStart)} through ${longDate(pauseEnd)}, so roles opened or closed after ${longDate(lastSync)} are not counted. The live board is a separate page.`,
    },
    {
      q: "Why are some roles missing a salary?",
      a: `Only listings with an employer-posted yearly range enter the salary table. This snapshot has ${report.listingsWithPostedYearlySalary} such listings out of ${report.trackedListings} tracked. The rest stay in the open-role and workplace counts. Equity, bonuses, and hourly rates are not added. A blank salary means the employer did not publish a yearly range.`,
    },
    {
      q: "Can I convert the GBP, EUR, or CAD medians into USD?",
      a: `No. Currencies are never converted. ${report.noteOnNonUsd} The design engineer USD median midpoint on this page is separate from those bands and is not a blend of them.`,
    },
    {
      q: "Were hardware design engineering jobs included?",
      a: "No. The snapshot excludes one internal test listing and two hardware listings rejected by review. Counts cover software design engineering titles only: design engineer, UI engineer, UX engineer, design systems engineer, and creative technologist. Mechanical, chip, and audiovisual design roles are not in this report.",
    },
  ];
}

export const RELATED_LINKS = [
  { href: "/guides/design-engineer-salary", anchor: "Design engineer salary guide" },
  { href: "/tools/design-engineer-salary-calculator", anchor: "Design engineer salary calculator" },
  { href: "/guides/design-systems-engineer", anchor: "What is a design systems engineer?" },
] as const;

export function reportStats(report: ReportSnapshot) {
  return [
    { label: "Open roles", value: String(report.openAtLastSync) },
    { label: "Companies", value: String(report.openCompanies) },
    { label: "Fully remote", value: `${report.remoteShareOpenPct}%` },
    { label: `New in ${monthName(report.month)}`, value: String(report.newRoles.length) },
  ];
}

/** Prose a reader sees, used to prove the page does not introduce figures. */
export function visibleProse(report: ReportSnapshot) {
  return [
    snapshotTitle(report),
    snapshotDescription(report),
    openingParagraph(report),
    ...reportSections(report).flatMap((section) => [section.question, section.answer]),
    report.scopeNote,
    report.noteOnNonUsd,
    ...reportFaqs(report).flatMap((faq) => [faq.q, faq.a]),
    ...reportStats(report).flatMap((stat) => [stat.label, stat.value]),
  ];
}
