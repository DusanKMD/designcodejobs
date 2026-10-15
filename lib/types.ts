export type Ats = "greenhouse" | "lever" | "ashby";
export type JobSource = Ats | "paid";
export type Workplace = "remote" | "hybrid" | "onsite";
export type JobStatus = "active" | "expired" | "review" | "rejected" | "pending";
export type Seniority =
  | "internship"
  | "junior"
  | "senior"
  | "staff"
  | "lead"
  | "founding"
  | "manager";
export type RegionSlug = "us" | "uk" | "europe" | "canada" | "worldwide";
export type SalaryUnit = "YEAR" | "MONTH" | "WEEK" | "DAY" | "HOUR";
export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACTOR"
  | "TEMPORARY"
  | "INTERN";

export type TitleFamily =
  | "design-engineer"
  | "ux-engineer"
  | "ui-engineer"
  | "design-technologist"
  | "creative-developer"
  | "creative-technologist"
  | "design-systems-engineer"
  | "prototyper";

export type SkillSlug =
  | "react"
  | "figma"
  | "framer"
  | "threejs"
  | "webgl"
  | "swiftui"
  | "motion"
  | "design-systems";

export type JobLocation = {
  locality?: string;
  region?: string;
  country: string;
  citySlug?: string;
};

export type Job = {
  id: string;
  source: JobSource;
  externalId: string;
  boardToken: string;
  companySlug: string;
  companyName: string;
  companyDomain: string;
  title: string;
  slug: string;
  descriptionHtml: string;
  descriptionText: string;
  locationRaw: string;
  workplace: Workplace;
  locations: JobLocation[];
  applicantCountries: string[];
  regions: RegionSlug[];
  citySlugs: string[];
  employmentType: EmploymentType | null;
  seniority: Seniority | null;
  titleFamily: TitleFamily | null;
  skills: SkillSlug[];
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryUnit: SalaryUnit | null;
  /** Shown with the range. JSON-LD baseSalary is omitted unless salaryUnit is set. */
  salaryNote: string | null;
  applyUrl: string;
  sourceUrl: string;
  datePosted: string;
  validThrough: string | null;
  expiredAt: string | null;
  status: JobStatus;
  confidence: number;
  matchReasons: string[];
  featured: boolean;
  featuredUntil: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  updatedAt: string;
};

export type Board = {
  ats: Ats;
  token: string;
  apiUrl: string;
  openJobsHint: number;
};

export type Company = {
  slug: string;
  name: string;
  domain: string;
  boards: Board[];
};

export type Submission = {
  id: string;
  email: string;
  companyName: string;
  companyDomain: string;
  title: string;
  location: string;
  workplace: Workplace;
  descriptionHtml: string;
  applyUrl: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  featured: boolean;
  status: "pending_payment" | "paid" | "published" | "refunded";
  jobId: string | null;
  lemonsqueezyOrderId: string | null;
  createdAt: string;
  paidAt: string | null;
};

export type AlertSubscription = {
  id: string;
  email: string;
  filters: {
    q?: string;
    title?: string;
    remote?: boolean;
    city?: string;
    region?: string;
  };
  status: "active" | "unsubscribed";
  unsubscribeToken: string;
  createdAt: string;
};
