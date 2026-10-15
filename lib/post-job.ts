import { z } from "zod";

export const CURRENCIES = ["USD", "CAD", "EUR", "GBP"] as const;
export type PostCurrency = (typeof CURRENCIES)[number];

export const POST_JOB_LIMITS = {
  email: { min: 3, max: 120 },
  company: { min: 2, max: 80 },
  domain: { max: 120 },
  title: { min: 5, max: 80 },
  location: { min: 2, max: 120 },
  applyUrl: { min: 8, max: 500 },
  description: { min: 200, max: 10000 },
} as const;

const salaryField = z.preprocess((value) => {
  if (value == null) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  if (typeof value === "string") return Number(value);
  return value;
}, z.union([
  z.null(),
  z.number({ invalid_type_error: "Enter a number" }).finite("Enter a number").nonnegative("Salary cannot be negative").max(10_000_000, "Salary must be 10,000,000 or less"),
]));

export const postJobSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(POST_JOB_LIMITS.email.min, "Work email is required")
      .max(POST_JOB_LIMITS.email.max, `Email must be ${POST_JOB_LIMITS.email.max} characters or fewer`)
      .email("Enter a valid email address"),
    company: z
      .string()
      .trim()
      .min(POST_JOB_LIMITS.company.min, `Company name needs at least ${POST_JOB_LIMITS.company.min} characters`)
      .max(POST_JOB_LIMITS.company.max, `Company name must be ${POST_JOB_LIMITS.company.max} characters or fewer`),
    domain: z
      .string()
      .trim()
      .max(POST_JOB_LIMITS.domain.max, `Domain must be ${POST_JOB_LIMITS.domain.max} characters or fewer`),
    title: z
      .string()
      .trim()
      .min(POST_JOB_LIMITS.title.min, `Title needs at least ${POST_JOB_LIMITS.title.min} characters`)
      .max(POST_JOB_LIMITS.title.max, `Title must be ${POST_JOB_LIMITS.title.max} characters or fewer`),
    workplace: z.enum(["remote", "hybrid", "onsite"], { message: "Choose remote, hybrid, or on-site" }),
    location: z
      .string()
      .trim()
      .max(POST_JOB_LIMITS.location.max, `Location must be ${POST_JOB_LIMITS.location.max} characters or fewer`),
    apply_url: z
      .string()
      .trim()
      .min(POST_JOB_LIMITS.applyUrl.min, "Apply URL is required")
      .max(POST_JOB_LIMITS.applyUrl.max, `Apply URL must be ${POST_JOB_LIMITS.applyUrl.max} characters or fewer`)
      .refine(httpUrl, "Enter an http or https URL"),
    salary_min: salaryField,
    salary_max: salaryField,
    salary_currency: z.enum(CURRENCIES, { message: "Choose a currency" }),
    description: z
      .string()
      .trim()
      .min(POST_JOB_LIMITS.description.min, `Description needs at least ${POST_JOB_LIMITS.description.min} characters`)
      .max(POST_JOB_LIMITS.description.max, `Description must be ${POST_JOB_LIMITS.description.max} characters or fewer`),
    featured: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.domain && !domainOk(value.domain)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["domain"], message: "Enter a domain like vercel.com" });
    }
    if (value.workplace !== "remote" && value.location.trim().length < POST_JOB_LIMITS.location.min) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["location"],
        message: "Add a city or office for hybrid and on-site roles",
      });
    }
    if (value.salary_min != null && value.salary_max != null && value.salary_min > value.salary_max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["salary_max"],
        message: "Maximum must be at least the minimum",
      });
    }
  });

export type PostJobValues = {
  email: string;
  company: string;
  domain: string;
  title: string;
  workplace: "remote" | "hybrid" | "onsite";
  location: string;
  apply_url: string;
  salary_min: string;
  salary_max: string;
  salary_currency: PostCurrency;
  description: string;
  featured: boolean;
};

export type PostJobData = {
  email: string;
  companyName: string;
  companyDomain: string;
  title: string;
  workplace: PostJobValues["workplace"];
  location: string;
  applyUrl: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: PostCurrency;
  descriptionHtml: string;
  featured: boolean;
};

export const EMPTY_POST_JOB: PostJobValues = {
  email: "",
  company: "",
  domain: "",
  title: "",
  workplace: "remote",
  location: "",
  apply_url: "",
  salary_min: "",
  salary_max: "",
  salary_currency: "USD",
  description: "",
  featured: false,
};

export function valuesFromForm(form: FormData): PostJobValues {
  const workplace = String(form.get("workplace") || "");
  const currency = String(form.get("salary_currency") || "");
  return {
    email: String(form.get("email") || ""),
    company: String(form.get("company") || ""),
    domain: String(form.get("domain") || ""),
    title: String(form.get("title") || ""),
    workplace: workplace === "hybrid" || workplace === "onsite" || workplace === "remote" ? workplace : "remote",
    location: String(form.get("location") || ""),
    apply_url: String(form.get("apply_url") || ""),
    salary_min: String(form.get("salary_min") || ""),
    salary_max: String(form.get("salary_max") || ""),
    salary_currency: (CURRENCIES as readonly string[]).includes(currency) ? (currency as PostCurrency) : "USD",
    description: String(form.get("description") || ""),
    featured: form.get("featured") === "on" || form.get("featured") === "true",
  };
}

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] || "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export function parsePostJob(input: PostJobValues): { ok: true; data: PostJobData } | { ok: false; errors: Record<string, string> } {
  const parsed = postJobSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const value = parsed.data;
  const salaryMin = value.salary_min;
  const salaryMax = value.salary_max ?? salaryMin;
  return {
    ok: true,
    data: {
      email: value.email.toLowerCase(),
      companyName: value.company,
      companyDomain: normalizeDomain(value.domain),
      title: value.title,
      workplace: value.workplace,
      location: value.location,
      applyUrl: value.apply_url,
      salaryMin,
      salaryMax,
      salaryCurrency: value.salary_currency,
      descriptionHtml: descriptionToHtml(value.description),
      featured: value.featured,
    },
  };
}

export function normalizeDomain(value: string) {
  return value.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "").replace(/^www\./i, "");
}

export function descriptionToHtml(description: string) {
  const escaped = description.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<p>${escaped.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>")}</p>`;
}

export type CheckoutOutcome = "unconfigured" | "paid" | "pending" | "failed" | "cancelled" | "unknown";

export function checkoutOutcome(search: { pending?: string | string[]; status?: string | string[] }): CheckoutOutcome {
  const pending = first(search.pending);
  if (pending === "1") return "unconfigured";
  const status = first(search.status).toLowerCase();
  if (["succeeded", "success", "paid"].includes(status)) return "paid";
  if (["processing", "pending"].includes(status)) return "pending";
  if (["failed", "failure"].includes(status)) return "failed";
  if (["cancelled", "canceled"].includes(status)) return "cancelled";
  return "unknown";
}

function first(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

function httpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function domainOk(value: string) {
  const domain = normalizeDomain(value);
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(domain);
}
