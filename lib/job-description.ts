import { STANDARD_PRICE_USD } from "@/lib/site";
import type { PostJobValues } from "@/lib/post-job";

export const JD_ROLES = [
  { value: "design-engineer", title: "Design Engineer", focus: "You will own the product surface: prototypes, production interface, and the details that make it feel finished." },
  { value: "ux-engineer", title: "UX Engineer", focus: "You will prototype interactions in code and extend the design-system API other people ship on. Accessibility is part of the job." },
  { value: "ui-engineer", title: "UI Engineer", focus: "You will implement the interface in production: layout, CSS, components, and the gap between a design and real content." },
  { value: "design-technologist", title: "Design Technologist", focus: "You will sit between design and engineering and turn an unclear interaction into something the team can try." },
  { value: "design-systems-engineer", title: "Design Systems Engineer", focus: "You will own tokens, components, and the documentation designers and engineers share." },
  { value: "creative-technologist", title: "Creative Technologist", focus: "You will build interactive, motion-heavy interface work that still lives in a real product codebase." },
] as const;

export const JD_LEVELS = [
  { value: "junior", label: "Junior", scope: "You will implement a defined surface with review. The problem is scoped. A portfolio of coursework plus one shipped or personal interface is enough to start." },
  { value: "mid", label: "Mid-level", scope: "You will take a flow from a rough idea to a merged pull request. You decide interaction details inside an existing system." },
  { value: "senior", label: "Senior", scope: "You will own an area of the product. You set the quality bar, review interface pull requests, and decide when a prototype should become production UI." },
  { value: "staff", label: "Staff", scope: "You will set how design and engineering share a system. The work spans several surfaces, and other people reuse what you build." },
] as const;

export const JD_STACK = ["React", "TypeScript", "CSS", "Figma", "design systems", "motion", "accessibility", "Framer", "SwiftUI"] as const;

export type JdRole = (typeof JD_ROLES)[number]["value"];
export type JdLevel = (typeof JD_LEVELS)[number]["value"];
export type JdStack = (typeof JD_STACK)[number];
export type JdWorkplace = "remote" | "hybrid" | "onsite";

export type JdInput = {
  role: JdRole;
  level: JdLevel;
  stack: JdStack[];
  workplace: JdWorkplace;
  location: string;
  salaryMin: string;
  salaryMax: string;
  currency: string;
};

export const DEFAULT_JD: JdInput = {
  role: "design-engineer",
  level: "senior",
  stack: ["React", "TypeScript", "CSS", "Figma", "design systems", "accessibility"],
  workplace: "remote",
  location: "United States",
  salaryMin: "",
  salaryMax: "",
  currency: "USD",
};

const WORKPLACE_LABEL: Record<JdWorkplace, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

function roleOf(value: JdRole) {
  return JD_ROLES.find((item) => item.value === value) || JD_ROLES[0];
}

function levelOf(value: JdLevel) {
  return JD_LEVELS.find((item) => item.value === value) || JD_LEVELS[2];
}

function money(value: string) {
  const amount = Number(value.replace(/,/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount);
}

export function generateJobDescription(input: JdInput) {
  const role = roleOf(input.role);
  const level = levelOf(input.level);
  const stack = input.stack.length ? input.stack : ["the stack you actually use"];
  const place = input.location.trim();
  const where = place ? `${WORKPLACE_LABEL[input.workplace]}. ${place}.` : `${WORKPLACE_LABEL[input.workplace]}. Say the city or the countries you hire in.`;
  const min = money(input.salaryMin);
  const max = money(input.salaryMax);
  const pay = min && max
    ? `Base salary: ${input.currency} ${min}–${max} a year. Equity, if you offer it, is separate from base.`
    : "Base salary: publish the yearly range you will actually pay, in the currency you pay it. Leave it off until you have decided. Do not invent a band.";

  return [
    role.title,
    "",
    `This is a software role for a designer who codes. It is not a mechanical, hardware, or chip design job. ${role.focus}`,
    "",
    "What you will do",
    "- Ship UI in the product, from a rough flow to a merged pull request.",
    "- Prototype an interaction in code when a static mock is not enough to decide.",
    "- Build components, tokens, and short documentation that other designers and engineers reuse.",
    "- Leave the interface accessible: keyboard, focus, contrast, and clear empty and error states.",
    input.stack.includes("motion") ? "- Treat motion as part of the interface, not a layer added at the end." : "- Pair with product design on the interaction and with engineering on how it lives in the app.",
    "",
    "What you have done",
    `- Production interface work in ${stack.join(", ")}.`,
    "- A portfolio with something that runs, not only mockups. A design-system contribution, a prototype, or a shipped flow is enough to start.",
    "- Judgment about visual and interaction quality, written down so other people can reuse it.",
    "",
    "Level",
    `${level.label}. ${level.scope}`,
    "",
    "Pay",
    pay,
    "",
    "Location",
    where,
  ].join("\n");
}

export const POST_DRAFT_KEY = "dcj-post-draft";

export function postJobHref(input: JdInput) {
  const role = roleOf(input.role);
  const params = new URLSearchParams();
  params.set("draft", "1");
  params.set("title", role.title);
  params.set("workplace", input.workplace);
  if (input.location.trim()) params.set("location", input.location.trim().slice(0, 120));
  if (input.salaryMin.trim()) params.set("salary_min", input.salaryMin.replace(/[^\d.]/g, ""));
  if (input.salaryMax.trim()) params.set("salary_max", input.salaryMax.replace(/[^\d.]/g, ""));
  if (input.currency) params.set("salary_currency", input.currency);
  return `/post-a-job?${params.toString()}`;
}

export function draftFromSearch(params: URLSearchParams, stored: string | null): Partial<PostJobValues> | null {
  if (params.get("draft") !== "1") return null;
  const workplace = params.get("workplace");
  const currency = params.get("salary_currency");
  let description = "";
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as { description?: unknown };
      if (typeof parsed.description === "string") description = parsed.description;
    } catch {
      description = "";
    }
  }
  return {
    title: params.get("title") || undefined,
    workplace: workplace === "hybrid" || workplace === "onsite" || workplace === "remote" ? workplace : undefined,
    location: params.get("location") || undefined,
    salary_min: params.get("salary_min") || undefined,
    salary_max: params.get("salary_max") || undefined,
    salary_currency: currency === "USD" || currency === "CAD" || currency === "EUR" || currency === "GBP" ? currency : undefined,
    description: description || undefined,
  };
}

export const POST_PRICE_LABEL = `Post this job for $${STANDARD_PRICE_USD}`;
