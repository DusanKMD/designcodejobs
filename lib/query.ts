import { ROLES } from "@/lib/catalog";
import { formatDate, wordCount } from "@/lib/format";
import { isListed } from "@/lib/model";
import { COMPANY_INDEX_THRESHOLD, INDEX_THRESHOLD, PAGE_SIZE } from "@/lib/site";
import type { Job, RegionSlug, Seniority, SkillSlug, TitleFamily } from "@/lib/types";

export type Facet = {
  q?: string;
  title?: TitleFamily;
  remote?: boolean;
  region?: RegionSlug;
  seniority?: Seniority;
  skill?: SkillSlug;
  company?: string;
  page?: number;
};

export type ListingMeta = {
  index: boolean;
  follow: true;
  canonicalPath: string;
};

export function listedJobs(jobs: Job[], now = new Date()) {
  return jobs.filter((job) => isListed(job, now));
}

export function filterJobs(jobs: Job[], facet: Facet, now = new Date()) {
  const q = facet.q?.trim().toLowerCase();
  return listedJobs(jobs, now)
    .filter((job) => {
      if (facet.title && job.titleFamily !== facet.title) return false;
      if (facet.remote && job.workplace !== "remote") return false;
      if (facet.region && !job.regions.includes(facet.region)) return false;
      if (facet.seniority && job.seniority !== facet.seniority) return false;
      if (facet.skill && !job.skills.includes(facet.skill)) return false;
      if (facet.company && job.companySlug !== facet.company) return false;
      if (q) {
        const hay = `${job.title} ${job.companyName} ${job.locationRaw} ${job.descriptionText}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort(compareJobs);
}

function compareJobs(a: Job, b: Job) {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
}

export function paginate<T>(items: T[], page = 1, size = PAGE_SIZE) {
  const safe = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const pages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(safe, pages);
  const start = (current - 1) * size;
  return { items: items.slice(start, start + size), page: current, pages, total: items.length };
}

export function listingRobots(count: number, path: string, options: { company?: boolean; page?: number; filtered?: boolean }): ListingMeta {
  const page = options.page ?? 1;
  const threshold = options.company ? COMPANY_INDEX_THRESHOLD : INDEX_THRESHOLD;
  const enough = count >= threshold;
  const filtered = Boolean(options.filtered);
  const index = enough && !filtered && page <= 3;
  const canonicalPath = !filtered && page > 1 && page <= 3 ? `${path}?page=${page}` : path;
  return { index, follow: true, canonicalPath };
}

export type SalaryBand = {
  currency: string;
  count: number;
  min: number;
  max: number;
  median: number;
};

function yearlyPaid(jobs: Job[]) {
  return jobs.filter((job) => job.salaryUnit === "YEAR" && job.salaryMin != null && job.salaryMax != null);
}

/** One band per currency. Ranges are never converted or mixed. USD is listed first. */
export function salaryBands(jobs: Job[]): SalaryBand[] {
  const groups = new Map<string, Job[]>();
  for (const job of yearlyPaid(jobs)) {
    const currency = job.salaryCurrency || "USD";
    groups.set(currency, [...(groups.get(currency) || []), job]);
  }
  const currencies = [...groups.keys()].sort((a, b) => (a === "USD" ? -1 : b === "USD" ? 1 : a.localeCompare(b)));
  return currencies.map((currency) => {
    const rows = groups.get(currency) || [];
    const points = rows
      .map((job) => ((job.salaryMin as number) + (job.salaryMax as number)) / 2)
      .sort((a, b) => a - b);
    const mid = Math.floor(points.length / 2);
    const median = points.length % 2 ? points[mid] : (points[mid - 1] + points[mid]) / 2;
    return {
      currency,
      count: rows.length,
      min: Math.min(...rows.map((job) => job.salaryMin as number)),
      max: Math.max(...rows.map((job) => job.salaryMax as number)),
      median,
    };
  });
}

export function medianSalary(jobs: Job[]) {
  const bands = salaryBands(jobs);
  const band = bands.find((item) => item.currency === "USD") || bands[0];
  if (!band) return null;
  return { value: band.median, currency: band.currency, count: band.count };
}

export function listingIntro(input: {
  subject: string;
  jobs: Job[];
  qualifier: string;
  updated: string;
}) {
  const count = input.jobs.length;
  const companies = [...new Set(input.jobs.map((job) => job.companyName))];
  const remote = input.jobs.filter((job) => job.workplace === "remote").length;
  const remoteShare = count ? Math.round((remote / count) * 100) : 0;
  const salary = medianSalary(input.jobs);
  const salarySentence = salary
    ? `Where employers publish base pay, the median posted midpoint is about ${new Intl.NumberFormat("en-US", { style: "currency", currency: salary.currency, maximumFractionDigits: 0 }).format(salary.value)} a year across ${salary.count} listing${salary.count === 1 ? "" : "s"}.`
    : "Few of these employers publish a salary range, so this page does not estimate pay.";
  const companySentence = companies.length
    ? `Companies with open roles include ${companies.slice(0, 5).join(", ")}${companies.length > 5 ? `, and ${companies.length - 5} more` : ""}.`
    : "No companies have a matching open role right now.";
  const text = [
    `${input.subject} on Design Code Jobs ${count === 1 ? "is" : "are"} ${count} open software ${count === 1 ? "role" : "roles"}. ${input.qualifier}`,
    `${remoteShare}% are fully remote. Hybrid roles stay off the remote list, because a hybrid week is not a remote job.`,
    companySentence,
    salarySentence,
    `The list was last updated ${input.updated}. Each role links to the original posting, and the full description is hosted here.`,
    `Mechanical, hardware, chip, and audiovisual jobs are filtered out. The phrase design engineer is used for those jobs elsewhere, and this board does not mix them in.`,
  ].join(" ");
  return text;
}

export function listingFaqs(subject: string, jobs: Job[]) {
  const companies = [...new Set(jobs.map((job) => job.companyName))].slice(0, 4);
  const salaryJobs = jobs.filter((job) => job.salaryUnit === "YEAR" && job.salaryMin != null);
  const sample = salaryJobs[0];
  const companyAnswer = companies.length
    ? `${companies.join(", ")} ${companies.length === 1 ? "has" : "have"} an open role in this list. The names are taken from the listings on the page, not from a paid logo wall. A company appears here only while at least one of its software roles is still open.`
    : `No company has an open role in this list right now. The page stays up so the next board sync can fill it. Mechanical and hardware employers are not added to stand in for an empty software list.`;
  const salaryAnswer = sample
    ? `${salaryJobs.length} ${salaryJobs.length === 1 ? "listing includes" : "listings include"} a yearly range the employer published. Ranges are not estimated, converted, or copied from a salary site. One posted example is ${sample.companyName}. The figure is the band they wrote, not a market rate. A single posting is not a wage survey.`
    : `None of the roles in this list publish a yearly range. Pay is shown only when the employer wrote it on the posting. This page does not estimate a market rate to fill the gap. A missing figure is not a guess waiting to be filled in from another site.`;
  const companyText = companies.length
    ? companyAnswer
    : `${companyAnswer} Names appear only while a software role is open.`;
  // Home already uses the head term in the title, H1, and intro. Other pages need it in each question so the FAQ is unique.
  const hiring = subject === "Design engineer jobs" ? "these software roles" : subject;
  return [
    {
      q: `How many ${subject} are open?`,
      a: `${jobs.length} ${jobs.length === 1 ? "open role matches" : "open roles match"} this page today. The count is software interface work that is still listed, not every design-engineer posting on the web. Hardware, mechanical, chip, and audiovisual titles stay off the list even when the words match. The number changes when a board sync adds or closes a role.`,
    },
    {
      q: `Which companies are hiring for ${hiring}?`,
      a: companyText,
    },
    {
      q: subject === "Design engineer jobs" ? "Do these software roles publish salary?" : `Do these ${subject} publish salary?`,
      a: salaryAnswer,
    },
  ];
}

export function assertIntroLength(text: string) {
  const words = wordCount(text);
  return words >= 80 && words <= 170;
}

export function similarJobs(jobs: Job[], job: Job, limit = 4) {
  return listedJobs(jobs)
    .filter((other) => other.id !== job.id)
    .map((other) => ({
      other,
      score:
        (other.titleFamily && other.titleFamily === job.titleFamily ? 3 : 0) +
        (other.companySlug === job.companySlug ? 2 : 0) +
        (other.workplace === job.workplace ? 1 : 0),
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || compareJobs(a.other, b.other))
    .slice(0, limit)
    .map((row) => row.other);
}

export function roleLabel(family: TitleFamily | null) {
  return ROLES.find((role) => role.slug === family)?.label || "Design engineer";
}

export function updatedLabel(jobs: Job[]) {
  const newest = jobs.map((job) => job.updatedAt || job.datePosted).sort().at(-1);
  return formatDate(newest || new Date().toISOString()) || "today";
}

export function companyStats(jobs: Job[], slug: string, now = new Date()) {
  const all = jobs.filter((job) => job.companySlug === slug && (job.status === "active" || job.status === "expired"));
  const open = all.filter((job) => isListed(job, now));
  return { open, past: all.length - open.length, all };
}
