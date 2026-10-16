import type { Job, RegionSlug, Seniority, TitleFamily } from "@/lib/types";

export type CalcRole = "all" | "design-engineer" | "ux-engineer" | "design-technologist" | "design-systems-engineer" | "creative-technologist";
export type CalcLevel = "all" | "junior" | "mid" | "senior" | "staff";
export type CalcLocation = "all" | "remote" | RegionSlug;

export const CALC_ROLES: { value: CalcRole; label: string }[] = [
  { value: "all", label: "Any design engineering role" },
  { value: "design-engineer", label: "Design engineer" },
  { value: "ux-engineer", label: "UX engineer" },
  { value: "design-technologist", label: "Design technologist" },
  { value: "design-systems-engineer", label: "Design systems engineer" },
  { value: "creative-technologist", label: "Creative technologist" },
];

export const CALC_LEVELS: { value: CalcLevel; label: string }[] = [
  { value: "all", label: "Any level" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "staff", label: "Staff and above" },
];

export const CALC_LOCATIONS: { value: CalcLocation; label: string }[] = [
  { value: "all", label: "Anywhere" },
  { value: "remote", label: "Remote only" },
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "europe", label: "Europe" },
  { value: "canada", label: "Canada" },
  { value: "worldwide", label: "Worldwide remote" },
];

/** Title families from the job matcher, folded into the five roles the calculator offers. */
export function calcRole(family: TitleFamily | null): Exclude<CalcRole, "all"> {
  switch (family) {
    case "ux-engineer":
    case "ui-engineer":
      return "ux-engineer";
    case "design-technologist":
    case "prototyper":
      return "design-technologist";
    case "design-systems-engineer":
      return "design-systems-engineer";
    case "creative-technologist":
    case "creative-developer":
      return "creative-technologist";
    default:
      return "design-engineer";
  }
}

/** Seniority comes from the posted title. No level word in the title counts as mid-level. */
export function calcLevel(seniority: Seniority | null): Exclude<CalcLevel, "all"> {
  if (seniority === "internship" || seniority === "junior") return "junior";
  if (seniority === "senior") return "senior";
  if (seniority === "staff" || seniority === "lead" || seniority === "founding" || seniority === "manager") return "staff";
  return "mid";
}

/** The slim, serialisable row the client needs. Only yearly base ranges the employer posted. */
export type SalaryRow = {
  id: string;
  title: string;
  company: string;
  slug: string;
  role: Exclude<CalcRole, "all">;
  level: Exclude<CalcLevel, "all">;
  remote: boolean;
  regions: RegionSlug[];
  currency: string;
  min: number;
  max: number;
};

/** Pass jobs already filtered to open listings (listedJobs). */
export function salaryRows(jobs: Job[]): SalaryRow[] {
  return jobs
    .filter((job) => job.salaryUnit === "YEAR" && job.salaryMin != null && job.salaryMax != null && job.salaryMin > 0)
    .map((job) => ({
      id: job.id,
      title: job.title,
      company: job.companyName,
      slug: job.slug,
      role: calcRole(job.titleFamily),
      level: calcLevel(job.seniority),
      remote: job.workplace === "remote",
      regions: job.regions,
      currency: (job.salaryCurrency || "USD").toUpperCase(),
      min: Math.min(job.salaryMin as number, job.salaryMax as number),
      max: Math.max(job.salaryMin as number, job.salaryMax as number),
    }));
}

export type CalcInput = { role: CalcRole; level: CalcLevel; location: CalcLocation; currency: string };

export const DEFAULT_INPUT: CalcInput = { role: "all", level: "all", location: "all", currency: "USD" };

export const MIN_SAMPLE = 3;

function matches(row: SalaryRow, input: CalcInput) {
  if (row.currency !== input.currency) return false;
  if (input.role !== "all" && row.role !== input.role) return false;
  if (input.level !== "all" && row.level !== input.level) return false;
  if (input.location === "remote" && !row.remote) return false;
  if (input.location !== "all" && input.location !== "remote" && !row.regions.includes(input.location)) return false;
  return true;
}

/** Linear-interpolated percentile of a sorted list. */
export function percentile(sorted: number[], p: number) {
  if (!sorted.length) return null;
  if (sorted.length === 1) return sorted[0];
  const rank = (sorted.length - 1) * p;
  const low = Math.floor(rank);
  const high = Math.ceil(rank);
  return sorted[low] + (sorted[high] - sorted[low]) * (rank - low);
}

export type CalcResult = {
  input: CalcInput;
  /** The filters actually used, after widening. */
  used: CalcInput;
  widened: ("level" | "location" | "role")[];
  rows: SalaryRow[];
  p25: number | null;
  median: number | null;
  p75: number | null;
};

/**
 * Percentiles of the midpoints of employer-posted yearly ranges in one currency.
 * Nothing is converted or estimated. When fewer than three ranges match, the
 * level, then the location, then the role filter is dropped, and the result says so.
 */
export function calculate(rows: SalaryRow[], input: CalcInput): CalcResult {
  let used = { ...input };
  const widened: CalcResult["widened"] = [];
  let hits = rows.filter((row) => matches(row, used));
  for (const key of ["level", "location", "role"] as const) {
    if (hits.length >= MIN_SAMPLE) break;
    if (used[key] === "all") continue;
    used = { ...used, [key]: "all" };
    widened.push(key);
    hits = rows.filter((row) => matches(row, used));
  }
  const points = hits.map((row) => (row.min + row.max) / 2).sort((a, b) => a - b);
  const sorted = [...hits].sort((a, b) => b.max + b.min - (a.max + a.min));
  return {
    input,
    used,
    widened,
    rows: sorted,
    p25: percentile(points, 0.25),
    median: percentile(points, 0.5),
    p75: percentile(points, 0.75),
  };
}

export function currenciesIn(rows: SalaryRow[]) {
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row.currency, (counts.get(row.currency) || 0) + 1);
  return [...counts.entries()].sort((a, b) => (a[0] === "USD" ? -1 : b[0] === "USD" ? 1 : b[1] - a[1])).map(([code, count]) => ({ code, count }));
}
