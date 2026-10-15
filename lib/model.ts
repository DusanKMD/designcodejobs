import { companyDomain, companyName } from "@/lib/companies";
import { jobSlug } from "@/lib/format";
import { sanitizeJobHtml, stripTags } from "@/lib/html";
import { parseLocation, type LocationInput } from "@/lib/location";
import { cleanTitle, detectSeniority, detectSkills, matchRole } from "@/lib/matching";
import type { ParsedSalary } from "@/lib/salary";
import type { EmploymentType, Job, JobSource, Workplace } from "@/lib/types";
import { GONE_AFTER_DAYS } from "@/lib/site";

export type JobDraft = {
  source: JobSource;
  externalId: string;
  boardToken: string;
  companySlug: string;
  companyName?: string;
  title: string;
  descriptionHtml?: string;
  location: LocationInput;
  applyUrl: string;
  sourceUrl?: string;
  datePosted?: string | null;
  employmentType?: EmploymentType | null;
  salary?: ParsedSalary | null;
  featured?: boolean;
  now?: Date;
};

export function buildJob(draft: JobDraft): Job {
  const now = draft.now || new Date();
  const title = cleanTitle(draft.title);
  const descriptionHtml = sanitizeJobHtml(draft.descriptionHtml || "");
  const descriptionText = stripTags(descriptionHtml);
  const match = matchRole(title, descriptionText);
  const place = parseLocation(draft.location);
  const stamp = now.toISOString();
  const status =
    match.queue === "publish" ? "active" : match.queue === "review" ? "review" : "rejected";
  const id = `${draft.source}:${draft.boardToken}:${draft.externalId}`;
  return {
    id,
    source: draft.source,
    externalId: draft.externalId,
    boardToken: draft.boardToken,
    companySlug: draft.companySlug,
    companyName: draft.companyName || companyName(draft.companySlug),
    companyDomain: companyDomain(draft.companySlug),
    title,
    slug: jobSlug(draft.companySlug, title, draft.externalId),
    descriptionHtml,
    descriptionText,
    locationRaw: place.locationRaw,
    workplace: place.workplace,
    locations: place.locations,
    applicantCountries: place.applicantCountries,
    regions: place.regions,
    citySlugs: place.citySlugs,
    employmentType: draft.employmentType || employmentFromTitle(title),
    seniority: detectSeniority(title),
    titleFamily: match.titleFamily,
    skills: detectSkills(title, descriptionText),
    salaryMin: draft.salary?.min ?? null,
    salaryMax: draft.salary?.max ?? null,
    salaryCurrency: draft.salary?.currency ?? null,
    salaryUnit: draft.salary?.unit ?? null,
    salaryNote: draft.salary?.note ?? null,
    applyUrl: draft.applyUrl,
    sourceUrl: draft.sourceUrl || draft.applyUrl,
    datePosted: draft.datePosted || stamp,
    validThrough: null,
    expiredAt: null,
    status,
    confidence: match.confidence,
    matchReasons: match.reasons,
    featured: Boolean(draft.featured),
    featuredUntil: null,
    firstSeenAt: stamp,
    lastSeenAt: stamp,
    updatedAt: stamp,
  };
}

function employmentFromTitle(title: string): EmploymentType | null {
  if (/\bintern/i.test(title)) return "INTERN";
  if (/\bcontract/i.test(title)) return "CONTRACTOR";
  return null;
}

export function effectiveStatus(job: Job, now = new Date()) {
  if (job.status === "rejected" || job.status === "review" || job.status === "pending") return job.status;
  if (job.expiredAt && new Date(job.expiredAt) <= now) return "expired" as const;
  if (job.validThrough && new Date(job.validThrough) <= now) return "expired" as const;
  return job.status;
}

export function isListed(job: Job, now = new Date()) {
  return effectiveStatus(job, now) === "active";
}

export function isGone(job: Job, now = new Date()) {
  if (effectiveStatus(job, now) !== "expired") return false;
  const anchor = job.expiredAt || job.validThrough;
  if (!anchor) return false;
  const days = (now.getTime() - new Date(anchor).getTime()) / 86_400_000;
  return days >= GONE_AFTER_DAYS;
}

export function expireJob(job: Job, now = new Date()): Job {
  const stamp = now.toISOString();
  return {
    ...job,
    status: "expired",
    expiredAt: job.expiredAt || stamp,
    featured: false,
    updatedAt: stamp,
    lastSeenAt: stamp,
  };
}

export function workplaceOrNull(value: string | null | undefined): Workplace | null {
  const v = (value || "").toLowerCase();
  if (v.includes("hybrid")) return "hybrid";
  if (v.includes("remote")) return "remote";
  if (v.includes("on")) return "onsite";
  return null;
}
