import { z } from "zod";
import type { ReportSnapshot } from "@/lib/reports/types";

const workplace = z.enum(["remote", "hybrid", "onsite"]);

const newRole = z.object({
  company: z.string(),
  title: z.string(),
  date_posted: z.string(),
  workplace,
});

const salaryRow = z.object({
  role_family: z.string(),
  currency: z.string(),
  listings: z.number(),
  median_midpoint: z.number(),
  lowest_posted_min: z.number(),
  highest_posted_max: z.number(),
});

const listing = z.object({
  company: z.string(),
  title: z.string(),
  status_at_last_sync: z.string(),
  date_posted: z.string(),
  title_family: z.string(),
  workplace,
  salary_min: z.number().nullable(),
  salary_max: z.number().nullable(),
  currency: z.string().nullable(),
  unit: z.string().nullable(),
});

const counts = z.object({
  hybrid: z.number(),
  remote: z.number(),
  onsite: z.number(),
});

/**
 * On-disk shape of data/reports/YYYY-MM.json.
 * `new_roles` is the stable key. October 2026 keeps its original
 * `new_roles_posted_in_october` key so the file stays a verbatim export.
 */
export const reportFileSchema = z
  .object({
    month: z.string().regex(/^\d{4}-\d{2}$/),
    scope_note: z.string().min(1),
    tracked_listings: z.number(),
    tracked_companies: z.number(),
    open_at_last_sync: z.number(),
    open_companies: z.number(),
    closed_during_month: z.number(),
    new_roles: z.array(newRole).optional(),
    new_roles_posted_in_october: z.array(newRole).optional(),
    top_companies_by_open_roles: z.array(z.tuple([z.string(), z.number()])),
    workplace_tracked: counts,
    workplace_open: counts,
    remote_share_open_pct: z.number(),
    role_families_tracked: z.record(z.string(), z.number()),
    listings_with_posted_yearly_salary: z.number(),
    salary_by_role_and_currency: z.array(salaryRow),
    salary_by_currency_all_roles: z.array(
      z.object({
        currency: z.string(),
        listings: z.number(),
        median_midpoint: z.number(),
      }),
    ),
    usd_remote_vs_not: z.object({
      remote: z.object({ n: z.number(), median_midpoint: z.number() }),
      onsite_or_hybrid: z.object({ n: z.number(), median_midpoint: z.number() }),
    }),
    note_on_non_usd: z.string().min(1),
    listings: z.array(listing),
  })
  .superRefine((data, ctx) => {
    if (!data.new_roles && !data.new_roles_posted_in_october) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Snapshot needs a new_roles array",
        path: ["new_roles"],
      });
    }
  });

export function parseSnapshot(input: unknown): ReportSnapshot {
  const file = reportFileSchema.parse(input);
  const roles = file.new_roles ?? file.new_roles_posted_in_october ?? [];
  return {
    month: file.month,
    scopeNote: file.scope_note,
    noteOnNonUsd: file.note_on_non_usd,
    trackedListings: file.tracked_listings,
    trackedCompanies: file.tracked_companies,
    openAtLastSync: file.open_at_last_sync,
    openCompanies: file.open_companies,
    closedDuringMonth: file.closed_during_month,
    newRoles: roles.map((role) => ({
      company: role.company,
      title: role.title,
      datePosted: role.date_posted,
      workplace: role.workplace,
    })),
    topCompanies: file.top_companies_by_open_roles.map(([name, openRoles]) => ({ name, openRoles })),
    workplaceTracked: file.workplace_tracked,
    workplaceOpen: file.workplace_open,
    remoteShareOpenPct: file.remote_share_open_pct,
    roleFamiliesTracked: file.role_families_tracked,
    listingsWithPostedYearlySalary: file.listings_with_posted_yearly_salary,
    salaryByRoleAndCurrency: file.salary_by_role_and_currency.map((row) => ({
      roleFamily: row.role_family,
      currency: row.currency,
      listings: row.listings,
      medianMidpoint: row.median_midpoint,
      lowestPostedMin: row.lowest_posted_min,
      highestPostedMax: row.highest_posted_max,
    })),
    salaryByCurrencyAllRoles: file.salary_by_currency_all_roles.map((row) => ({
      currency: row.currency,
      listings: row.listings,
      medianMidpoint: row.median_midpoint,
    })),
    usdRemoteVsNot: {
      remote: {
        n: file.usd_remote_vs_not.remote.n,
        medianMidpoint: file.usd_remote_vs_not.remote.median_midpoint,
      },
      onsiteOrHybrid: {
        n: file.usd_remote_vs_not.onsite_or_hybrid.n,
        medianMidpoint: file.usd_remote_vs_not.onsite_or_hybrid.median_midpoint,
      },
    },
    listings: file.listings.map((row) => ({
      company: row.company,
      title: row.title,
      statusAtLastSync: row.status_at_last_sync,
      datePosted: row.date_posted,
      titleFamily: row.title_family,
      workplace: row.workplace,
      salaryMin: row.salary_min,
      salaryMax: row.salary_max,
      currency: row.currency,
      unit: row.unit,
    })),
  };
}
