import { loadCompanies } from "@/lib/companies";
import { decodeHtmlEntities } from "@/lib/html";
import { getIngestCursor, saveIngestedJobs, setIngestCursor } from "@/lib/store";
import { buildJob } from "@/lib/model";
import { shouldFetchDescription } from "@/lib/matching";
import { parseSalaryFromText, salaryFromStructured } from "@/lib/salary";
import { stripTags } from "@/lib/html";
import type { Ats, Board, Company, EmploymentType, Job, Workplace } from "@/lib/types";

type BoardRef = { company: Company; board: Board };

function employment(value: string | null | undefined, title: string): EmploymentType | null {
  const s = `${value || ""} ${title}`.toLowerCase();
  if (/\bintern/.test(s)) return "INTERN";
  if (/part[\s-]?time/.test(s)) return "PART_TIME";
  if (/contract/.test(s)) return "CONTRACTOR";
  if (/temporary|\btemp\b/.test(s)) return "TEMPORARY";
  if (/full[\s-]?time/.test(s)) return "FULL_TIME";
  return null;
}

function workplaceOf(value: string | null | undefined, remoteFlag?: boolean | null): Workplace | null {
  const v = (value || "").toLowerCase();
  if (v.includes("hybrid")) return "hybrid";
  if (v.includes("remote") || remoteFlag) return "remote";
  if (v.includes("on")) return "onsite";
  return null;
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    headers: { accept: "application/json", "user-agent": "designcodejobs-ingest" },
    signal: AbortSignal.timeout(25_000),
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

type Collected = { jobs: Job[]; seenExternalIds: string[] };

async function fromGreenhouse(company: Company, board: Board): Promise<Collected> {
  const list = (await fetchJson(`https://boards-api.greenhouse.io/v1/boards/${board.token}/jobs`)) as {
    jobs?: { id: number; title: string }[];
  };
  const listed = list.jobs || [];
  const seenExternalIds = listed.map((job) => String(job.id));
  const candidates = listed.filter((job) => shouldFetchDescription(job.title));
  const jobs: Job[] = [];
  for (const item of candidates) {
    try {
      const detail = (await fetchJson(
        `https://boards-api.greenhouse.io/v1/boards/${board.token}/jobs/${item.id}`,
      )) as {
        id: number;
        title: string;
        content?: string;
        absolute_url?: string;
        first_published?: string;
        updated_at?: string;
        location?: { name?: string };
        offices?: { name?: string; location?: string }[];
      };
      const html = decodeHtmlEntities(detail.content || "");
      const office = detail.offices?.[0];
      const text = [detail.location?.name, office?.location, office?.name].filter(Boolean).join(" · ");
      jobs.push(
        buildJob({
          source: "greenhouse",
          externalId: String(detail.id),
          boardToken: board.token,
          companySlug: company.slug,
          companyName: company.name,
          title: detail.title,
          descriptionHtml: html,
          location: { text, workplace: workplaceOf(text) },
          applyUrl: detail.absolute_url || `https://job-boards.greenhouse.io/${board.token}/jobs/${detail.id}`,
          datePosted: detail.first_published || detail.updated_at || null,
          salary: parseSalaryFromText(stripTags(html)),
          employmentType: employment(null, detail.title),
        }),
      );
    } catch (error) {
      console.error(`[ingest] greenhouse ${board.token}/${item.id}`, error);
    }
  }
  return { jobs, seenExternalIds };
}

async function fromLever(company: Company, board: Board): Promise<Collected> {
  const list = (await fetchJson(`https://api.lever.co/v0/postings/${board.token}?mode=json`)) as {
    id: string;
    text: string;
    description?: string;
    descriptionPlain?: string;
    lists?: { text?: string; content?: string }[];
    additional?: string;
    categories?: { commitment?: string; location?: string; allLocations?: string[] };
    workplaceType?: string;
    country?: string;
    hostedUrl?: string;
    applyUrl?: string;
    createdAt?: number;
    salaryRange?: { min?: number; max?: number; currency?: string; interval?: string };
    salaryDescriptionPlain?: string;
  }[];
  const seenExternalIds = list.map((job) => job.id);
  const jobs = list
    .filter((job) => shouldFetchDescription(job.text))
    .map((job) => {
      const html = [job.description || "", ...(job.lists || []).flatMap((list) => [`<h2>${list.text || ""}</h2>`, list.content || ""]), job.additional || ""].join("\n");
      const salary = job.salaryRange
        ? salaryFromStructured({
            min: job.salaryRange.min,
            max: job.salaryRange.max,
            currency: job.salaryRange.currency,
            interval: job.salaryRange.interval,
            summary: job.salaryDescriptionPlain,
          })
        : parseSalaryFromText(job.descriptionPlain || "");
      return buildJob({
        source: "lever",
        externalId: job.id,
        boardToken: board.token,
        companySlug: company.slug,
        companyName: company.name,
        title: job.text,
        descriptionHtml: html,
        location: {
          text: [job.categories?.location, ...(job.categories?.allLocations || []), job.country].filter(Boolean).join(" · "),
          workplace: workplaceOf(job.workplaceType),
        },
        applyUrl: job.hostedUrl || job.applyUrl || `https://jobs.lever.co/${board.token}/${job.id}`,
        datePosted: job.createdAt ? new Date(job.createdAt).toISOString() : null,
        employmentType: employment(job.categories?.commitment, job.text),
        salary,
      });
    });
  return { jobs, seenExternalIds };
}

async function fromAshby(company: Company, board: Board): Promise<Collected> {
  const payload = (await fetchJson(
    `https://api.ashbyhq.com/posting-api/job-board/${board.token}?includeCompensation=true`,
  )) as {
    jobs?: {
      id: string;
      title: string;
      isListed?: boolean;
      isRemote?: boolean;
      workplaceType?: string;
      employmentType?: string;
      location?: string;
      secondaryLocations?: { location?: string }[];
      address?: { postalAddress?: { addressLocality?: string; addressRegion?: string; addressCountry?: string } };
      descriptionHtml?: string;
      publishedAt?: string;
      jobUrl?: string;
      applyUrl?: string;
      shouldDisplayCompensationOnJobPostings?: boolean;
      compensation?: {
        compensationTiers?: {
          components?: {
            compensationType?: string;
            interval?: string;
            currencyCode?: string;
            minValue?: number | null;
            maxValue?: number | null;
            summary?: string;
          }[];
        }[];
      };
    }[];
  };
  const open = (payload.jobs || []).filter((job) => job.isListed !== false);
  const seenExternalIds = open.map((job) => job.id);
  const jobs = open
    .filter((job) => shouldFetchDescription(job.title))
    .map((job) => {
      const component = job.compensation?.compensationTiers
        ?.flatMap((tier) => tier.components || [])
        .find((part) => part.compensationType === "Salary");
      const salary = job.shouldDisplayCompensationOnJobPostings
        ? component
          ? salaryFromStructured({
              min: component.minValue,
              max: component.maxValue,
              currency: component.currencyCode,
              interval: component.interval,
              summary: component.summary,
            })
          : parseSalaryFromText(stripTags(job.descriptionHtml || ""))
        : null;
      const address = job.address?.postalAddress;
      return buildJob({
        source: "ashby",
        externalId: job.id,
        boardToken: board.token,
        companySlug: company.slug,
        companyName: company.name,
        title: job.title,
        descriptionHtml: job.descriptionHtml || "",
        location: {
          text: job.location || "",
          workplace: workplaceOf(job.workplaceType, job.isRemote),
          address: address
            ? {
                locality: address.addressLocality,
                region: address.addressRegion,
                country: address.addressCountry,
              }
            : null,
          secondaryTexts: (job.secondaryLocations || []).map((item) => item.location || "").filter(Boolean),
        },
        applyUrl: job.jobUrl || job.applyUrl || `https://jobs.ashbyhq.com/${board.token}/${job.id}`,
        datePosted: job.publishedAt || null,
        employmentType: employment(job.employmentType, job.title),
        salary,
      });
    });
  return { jobs, seenExternalIds };
}

const FETCHERS: Record<Ats, (company: Company, board: Board) => Promise<Collected>> = {
  greenhouse: fromGreenhouse,
  lever: fromLever,
  ashby: fromAshby,
};

export function listBoards(): BoardRef[] {
  return loadCompanies().flatMap((company) => company.boards.map((board) => ({ company, board })));
}

export async function readBoard(companySlug: string, ats: Ats) {
  const ref = listBoards().find((item) => item.company.slug === companySlug && item.board.ats === ats);
  if (!ref) throw new Error(`No ${ats} board for ${companySlug}`);
  return FETCHERS[ats](ref.company, ref.board);
}

export async function ingestBoard(ref: BoardRef) {
  const collected = await FETCHERS[ref.board.ats](ref.company, ref.board);
  const kept = collected.jobs.filter((job) => job.status === "active" || job.status === "review");
  const result = await saveIngestedJobs(kept, {
    source: ref.board.ats,
    token: ref.board.token,
    seenExternalIds: collected.seenExternalIds,
  });
  return { company: ref.company.slug, ats: ref.board.ats, candidates: kept.length, ...result };
}

export async function runIngest(options: { limit?: number; company?: string; all?: boolean } = {}) {
  const boards = listBoards();
  let slice = boards;
  let cursor = 0;
  if (options.company) {
    const needle = options.company.toLowerCase();
    slice = boards.filter((ref) => ref.company.slug === needle || ref.board.token === needle);
  } else if (!options.all) {
    cursor = await getIngestCursor();
    const limit = options.limit || Number(process.env.INGEST_BATCH || 20);
    if (cursor >= boards.length) cursor = 0;
    slice = boards.slice(cursor, cursor + limit);
  }

  const results = [];
  for (const ref of slice) {
    try {
      results.push(await ingestBoard(ref));
    } catch (error) {
      results.push({
        company: ref.company.slug,
        ats: ref.board.ats,
        error: error instanceof Error ? error.message : "failed",
      });
    }
  }

  if (!options.company && !options.all) {
    const next = cursor + slice.length >= boards.length ? 0 : cursor + slice.length;
    await setIngestCursor(next, { at: new Date().toISOString(), processed: slice.length, next });
  }

  return {
    processed: slice.length,
    boards: boards.length,
    cursor,
    results,
  };
}
