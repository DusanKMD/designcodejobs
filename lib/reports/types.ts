export type ReportWorkplace = "remote" | "hybrid" | "onsite";

export type ReportNewRole = {
  company: string;
  title: string;
  datePosted: string;
  workplace: ReportWorkplace;
};

export type ReportSalaryRow = {
  roleFamily: string;
  currency: string;
  listings: number;
  medianMidpoint: number;
  lowestPostedMin: number;
  highestPostedMax: number;
};

export type ReportCurrencySalary = {
  currency: string;
  listings: number;
  medianMidpoint: number;
};

export type ReportListing = {
  company: string;
  title: string;
  statusAtLastSync: string;
  datePosted: string;
  titleFamily: string;
  workplace: ReportWorkplace;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  unit: string | null;
};

export type WorkplaceCounts = {
  hybrid: number;
  remote: number;
  onsite: number;
};

/**
 * Frozen monthly figures. Every number on a snapshot page is read from this
 * object, which is parsed from data/reports/YYYY-MM.json without recomputation.
 */
export type ReportSnapshot = {
  month: string;
  scopeNote: string;
  noteOnNonUsd: string;
  trackedListings: number;
  trackedCompanies: number;
  openAtLastSync: number;
  openCompanies: number;
  closedDuringMonth: number;
  newRoles: ReportNewRole[];
  topCompanies: { name: string; openRoles: number }[];
  workplaceTracked: WorkplaceCounts;
  workplaceOpen: WorkplaceCounts;
  remoteShareOpenPct: number;
  roleFamiliesTracked: Record<string, number>;
  listingsWithPostedYearlySalary: number;
  salaryByRoleAndCurrency: ReportSalaryRow[];
  salaryByCurrencyAllRoles: ReportCurrencySalary[];
  usdRemoteVsNot: {
    remote: { n: number; medianMidpoint: number };
    onsiteOrHybrid: { n: number; medianMidpoint: number };
  };
  listings: ReportListing[];
};
