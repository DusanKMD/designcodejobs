import { GUIDES, REGIONS } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
import { roleLabel, salaryBands, updatedLabel, type SalaryBand } from "@/lib/query";
import type { Job, RegionSlug, TitleFamily } from "@/lib/types";

export type RemoteCompany = { name: string; slug: string; count: number };

export type RemoteRegion = {
  slug: RegionSlug;
  label: string;
  h1: string;
  count: number;
  companies: string[];
  pay: SalaryBand[];
};

export type RemoteFamily = {
  slug: TitleFamily | null;
  label: string;
  count: number;
};

export type RemoteSummary = {
  total: number;
  companyCount: number;
  companies: RemoteCompany[];
  regions: RemoteRegion[];
  pay: SalaryBand[];
  withPay: number;
  withoutPay: number;
  families: RemoteFamily[];
  updated: string;
};

const REGION_SHORT: Record<RegionSlug, string> = {
  us: "US",
  uk: "UK",
  europe: "Europe",
  canada: "Canada",
  worldwide: "Worldwide",
};

/** Current /remote meta description, kept for the empty board. */
export const REMOTE_EMPTY_DESCRIPTION =
  "Remote design engineer jobs in software. Fully remote UX, UI, design systems, and creative technologist roles, with salary when the employer posts it.";

const GUIDE_SLUGS = [
  "design-engineer-salary",
  "how-to-become-a-design-engineer",
  "design-engineer-portfolio",
  "design-engineer-interview-questions",
  "design-engineer-vs-frontend-engineer",
] as const;

function yearlyPaid(job: Job) {
  return job.salaryUnit === "YEAR" && job.salaryMin != null && job.salaryMax != null;
}

function byCountThenName<T extends { count: number; name: string }>(rows: T[]) {
  return rows.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Live totals for an already-filtered remote list. A job in two regions counts in each. */
export function remoteSummary(jobs: Job[]): RemoteSummary {
  const companyMap = new Map<string, RemoteCompany>();
  for (const job of jobs) {
    const slug = job.companySlug || job.companyName;
    const row = companyMap.get(slug) || { name: job.companyName || slug, slug, count: 0 };
    row.count += 1;
    if (!row.name && job.companyName) row.name = job.companyName;
    companyMap.set(slug, row);
  }
  const companies = byCountThenName([...companyMap.values()]);

  const regions: RemoteRegion[] = REGIONS.map((region) => {
    const matched = jobs.filter((job) => job.regions.includes(region.slug));
    const names = new Map<string, number>();
    for (const job of matched) {
      const name = job.companyName || job.companySlug;
      names.set(name, (names.get(name) || 0) + 1);
    }
    const regionCompanies = [...names.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name]) => name);
    return {
      slug: region.slug,
      label: region.label,
      h1: region.h1,
      count: matched.length,
      companies: regionCompanies,
      pay: salaryBands(matched),
    };
  });

  const familyMap = new Map<TitleFamily | null, number>();
  for (const job of jobs) familyMap.set(job.titleFamily, (familyMap.get(job.titleFamily) || 0) + 1);
  const families: RemoteFamily[] = [...familyMap.entries()]
    .map(([slug, count]) => ({ slug, label: roleLabel(slug), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const withPay = jobs.filter(yearlyPaid).length;
  return {
    total: jobs.length,
    companyCount: companies.length,
    companies,
    regions,
    pay: salaryBands(jobs),
    withPay,
    withoutPay: jobs.length - withPay,
    families,
    updated: updatedLabel(jobs),
  };
}

export function remoteRegionShort(slug: RegionSlug) {
  return REGION_SHORT[slug];
}

/** Compact yearly band for one currency, for example a USD minimum and maximum with the listing count. */
export function formatRemotePay(band: SalaryBand) {
  const money = (amount: number) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: band.currency,
        notation: Math.abs(amount) >= 1000 ? "compact" : "standard",
        maximumFractionDigits: Math.abs(amount) >= 1_000_000 ? 1 : 0,
      })
        .format(amount)
        .replace(/K$/, "k");
    } catch {
      return `${band.currency} ${Math.round(amount).toLocaleString("en-US")}`;
    }
  };
  return `${money(band.min)}–${money(band.max)} (${band.count})`;
}

export function remoteMetaTitle(summary: Pick<RemoteSummary, "total">) {
  if (summary.total > 0) return `Remote design engineer jobs: ${summary.total} open software roles`;
  return "Remote design engineer jobs";
}

function joinList(items: string[]) {
  if (items.length <= 1) return items[0] || "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function remoteMetaDescription(summary: RemoteSummary) {
  if (summary.total <= 0) return REMOTE_EMPTY_DESCRIPTION;
  const companyWord = summary.companyCount === 1 ? "company" : "companies";
  const head = `${summary.total} fully remote design engineer jobs at ${summary.companyCount} ${companyWord}`;
  const tail = "US, Canada, UK and Europe roles, with pay where posted.";
  const names = summary.companies.map((company) => company.name);
  for (let count = Math.min(3, names.length); count >= 1; count -= 1) {
    const text = `${head}, from ${joinList(names.slice(0, count))}. ${tail}`;
    if (text.length <= 158) return text;
  }
  const bare = `${head}. ${tail}`;
  return bare.length <= 158 ? bare : bare.slice(0, 158).trim();
}

export function remoteHeroText(summary: RemoteSummary) {
  const count = (slug: RegionSlug) => summary.regions.find((region) => region.slug === slug)?.count ?? 0;
  const roles = summary.total === 1 ? "role" : "roles";
  const companies = summary.companyCount === 1 ? "company" : "companies";
  return `${summary.total} fully remote software design engineer ${roles} at ${summary.companyCount} ${companies}, updated ${summary.updated}. ${count("us")} hire in the US, ${count("canada")} in Canada, ${count("uk")} in the UK and ${count("europe")} in Europe.`;
}

export function remoteGuideLinks() {
  return GUIDE_SLUGS.flatMap((slug) => {
    const guide = GUIDES.find((item) => item.slug === slug);
    return guide ? [{ href: `/guides/${guide.slug}`, label: guide.title }] : [];
  });
}

export function guideLink(slug: string) {
  const guide = GUIDES.find((item) => item.slug === slug);
  return guide ? { href: `/guides/${guide.slug}`, label: guide.title } : null;
}

function regionRow(summary: RemoteSummary, slug: RegionSlug) {
  const row = summary.regions.find((region) => region.slug === slug);
  return row || { slug, label: slug, h1: slug, count: 0, companies: [] as string[], pay: [] as SalaryBand[] };
}

function placeClause(place: string, row: RemoteRegion) {
  if (row.count === 0) return `no remote role is open to ${place} right now`;
  const roles = row.count === 1 ? "remote role is" : "remote roles are";
  const at = row.companies.length ? ` at ${joinList(row.companies)}` : "";
  return `${row.count} ${roles} open to ${place}${at}`;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function payAnswer(summary: RemoteSummary) {
  if (summary.withPay === 0) {
    return `None of the ${summary.total} remote listings post a yearly salary range. Pay on this page is the employer-posted yearly base only, not an estimate, and currencies are never converted or mixed. A missing range stays blank until the employer writes yearly base pay on the original posting.`;
  }
  const bands = summary.pay.map((band) => {
    const noun = band.count === 1 ? "listing" : "listings";
    const verb = band.count === 1 ? "posts" : "post";
    const min = formatMoney(band.min, band.currency);
    const max = formatMoney(band.max, band.currency);
    const median = formatMoney(band.median, band.currency);
    return `${band.count} ${noun} in ${band.currency} ${verb} ${min}–${max} a year (median midpoint ${median}).`;
  });
  const missing = summary.withoutPay === 1 ? "listing posts" : "listings post";
  return `${bands.join(" ")} ${summary.withoutPay} ${missing} no range. These figures are the employer-posted yearly bases, not estimates, and currencies are never converted or mixed.`;
}

function filledFaqs(summary: RemoteSummary, boardTotal: number) {
  const roles = summary.total === 1 ? "role is" : "roles are";
  const companies = summary.companyCount === 1 ? "company" : "companies";
  const live = boardTotal === 1 ? "live role" : "live roles";
  const hiring = summary.companies.map((company) => `${company.name} (${company.count})`).join(", ");
  const hiringVerb = summary.companies.length === 1 ? "is" : "are";
  const europe = regionRow(summary, "europe");
  const uk = regionRow(summary, "uk");
  const us = regionRow(summary, "us");
  const canada = regionRow(summary, "canada");
  const worldwide = regionRow(summary, "worldwide");
  const worldwideAnswer =
    worldwide.count === 0
      ? `None of the ${summary.total} remote roles open today accept applicants from any country; each names the countries or regions it hires in. ${us.count} hire in the US and ${canada.count} hire in Canada. A role open to both the US and Canada counts in each.`
      : `${worldwide.count} remote ${worldwide.count === 1 ? "role is" : "roles are"} open worldwide and accept applicants from any country. ${us.count} hire in the US and ${canada.count} hire in Canada. A role open to both the US and Canada counts in each. A worldwide role is separate from one that names specific countries, so read the applicant countries on the listing.`;

  return [
    {
      q: "How many remote design engineer jobs are open right now?",
      a: `${summary.total} fully remote software design engineer ${roles} open at ${summary.companyCount} ${companies}, out of ${boardTotal} ${live} on the board, updated ${summary.updated}. Hybrid weeks and city-office roles are excluded, and mechanical, hardware, and chip jobs stay off this software list.`,
    },
    {
      q: "Which companies are hiring remote design engineers?",
      a: `${hiring} ${hiringVerb} hiring remote design engineers right now. The number in parentheses is how many fully remote roles that company has open on this board. A company appears here only while at least one of those roles is still live.`,
    },
    {
      q: "Can I get a remote design engineer job from Europe or the UK?",
      a: `${capitalize(placeClause("Europe", europe))}, and ${placeClause("the UK", uk)}. Most remote roles name the countries they hire in, so check the applicant countries on each listing before you apply. The Europe list is at /remote/europe and the UK list is at /remote/uk. A role open to both Europe and the UK counts in each.`,
    },
    {
      q: "Are there remote design engineer jobs open worldwide?",
      a: worldwideAnswer,
    },
    {
      q: "How much do remote design engineer jobs pay?",
      a: payAnswer(summary),
    },
    {
      q: "What counts as a remote job on Design Code Jobs?",
      a: "A remote job on Design Code Jobs is only a listing the employer marks fully remote. Hybrid weeks and city-office roles are excluded, even when the posting mentions working from home on some days. Mechanical, hardware, and chip roles are excluded too. Each role links to the original posting.",
    },
  ];
}

function emptyFaqs() {
  return [
    {
      q: "How many remote design engineer jobs are open right now?",
      a: "No fully remote role is open right now. This page lists software design engineer jobs the employer marks fully remote, and it fills on the next board sync when a matching role is posted. Hybrid weeks and city-office roles stay off the list, and mechanical, hardware, and chip postings are excluded too. Set an alert if you want a note when the next remote role appears.",
    },
    {
      q: "Which companies are hiring remote design engineers?",
      a: "No company is hiring a fully remote design engineer on this board right now. The company list fills on the next board sync, and only an employer with a live fully remote software role is added. Hybrid and on-site postings do not put a company on this list. Mechanical and hardware employers are not used to stand in for an empty software board.",
    },
    {
      q: "Can I get a remote design engineer job from Europe or the UK?",
      a: "No fully remote role is open to applicants in Europe or the UK right now. Most remote roles name the countries they hire in, so when one is posted you should check the applicant countries on that listing. The Europe and UK pages fill on the next board sync if an employer opens a role in those regions. Nothing here is estimated while the list is empty.",
    },
    {
      q: "Are there remote design engineer jobs open worldwide?",
      a: "No fully remote role is open worldwide right now, and none are open in the US or Canada either. No remote role accepts applicants from any country today because no fully remote role is open. The page fills on the next board sync when an employer posts one. Each role that appears will name the countries or regions it hires in.",
    },
    {
      q: "How much do remote design engineer jobs pay?",
      a: "No remote listing posts a yearly salary range right now, because no fully remote role is open. Pay is shown only when an employer posts a yearly base, and this page does not estimate a market rate or convert currencies. The pay figures fill on the next board sync when a remote role includes a range. Currencies stay separate and are never mixed.",
    },
    {
      q: "What counts as a remote job on Design Code Jobs?",
      a: "A remote job on Design Code Jobs is a listing the employer marks fully remote. Hybrid weeks and city-office roles are excluded, and mechanical, hardware, and chip roles are excluded too. No fully remote role is open right now, and the page fills on the next board sync. Each role that appears links to the original posting so you can read it there.",
    },
  ];
}

export function remoteFaqs(summary: RemoteSummary, boardTotal: number) {
  return summary.total === 0 ? emptyFaqs() : filledFaqs(summary, boardTotal);
}
