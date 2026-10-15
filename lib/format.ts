import type { Job, SalaryUnit, Workplace } from "@/lib/types";
import { countryLabel } from "@/lib/location";

export function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 72);
}

export function jobSlug(companySlug: string, title: string, externalId: string) {
  const short = externalId.replace(/[^a-z0-9]/gi, "").slice(0, 8).toLowerCase() || "role";
  return slugify(`${companySlug}-${title}-${short}`);
}

export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString("en-US")}`;
  }
}

const UNIT_LABEL: Record<SalaryUnit, string> = {
  YEAR: "a year",
  MONTH: "a month",
  WEEK: "a week",
  DAY: "a day",
  HOUR: "an hour",
};

export function formatSalary(job: Pick<Job, "salaryMin" | "salaryMax" | "salaryCurrency" | "salaryUnit">) {
  if (job.salaryMin == null && job.salaryMax == null) return null;
  const currency = job.salaryCurrency || "USD";
  const min = job.salaryMin;
  const max = job.salaryMax;
  let range: string;
  if (min != null && max != null && min !== max) range = `${formatMoney(min, currency)}–${formatMoney(max, currency)}`;
  else range = formatMoney((min ?? max) as number, currency);
  return job.salaryUnit ? `${range} ${UNIT_LABEL[job.salaryUnit]}` : range;
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function workplaceLabel(workplace: Workplace) {
  if (workplace === "remote") return "Remote";
  if (workplace === "hybrid") return "Hybrid";
  return "On-site";
}

export function jobFacts(job: Pick<Job, "workplace" | "locationRaw" | "applicantCountries" | "locations">) {
  const workplace = workplaceLabel(job.workplace);
  const place = locationLabel(job);
  if (place === workplace || place.startsWith(`${workplace} · `)) return place;
  return `${workplace} · ${place}`;
}

export function locationLabel(job: Pick<Job, "workplace" | "locationRaw" | "applicantCountries" | "locations">) {
  if (job.workplace === "remote") {
    const countries = job.applicantCountries.map(countryLabel);
    if (countries.length === 0) return "Remote";
    if (countries.length <= 3) return `Remote · ${countries.join(", ")}`;
    return `Remote · ${countries.slice(0, 2).join(", ")} +${countries.length - 2}`;
  }
  if (job.locations.length) {
    return job.locations
      .map((loc) => [loc.locality, loc.region, countryLabel(loc.country)].filter(Boolean).join(", "))
      .join(" · ");
  }
  return job.locationRaw || workplaceLabel(job.workplace);
}

export function withApplyUtm(url: string) {
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("utm_source")) {
      parsed.searchParams.set("utm_source", "designcodejobs");
      parsed.searchParams.set("utm_medium", "apply");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function hostLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "the company site";
  }
}

export function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
