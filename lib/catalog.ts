import type { RegionSlug, Seniority, SkillSlug, TitleFamily } from "@/lib/types";

export type RoleDef = {
  slug: TitleFamily;
  label: string;
  h1: string;
  title: string;
  description: string;
  priority: boolean;
};

/**
 * Titles and H1s follow the OpenSEO targets (US volume, 2026-10-15).
 * Home owns "design engineer jobs" (2,900). Role hubs own the variant titles.
 */
export const ROLES: RoleDef[] = [
  {
    slug: "ux-engineer",
    label: "UX engineer",
    h1: "UX engineer jobs",
    title: "UX engineer jobs",
    description:
      "UX engineer jobs at product companies. Open roles for people who prototype, build design systems, and ship interface code.",
    priority: true,
  },
  {
    slug: "creative-technologist",
    label: "Creative technologist",
    h1: "Creative technologist jobs",
    title: "Creative technologist jobs",
    description:
      "Creative technologist jobs across product teams and studios. Fresh software roles in prototyping, web, and interactive work, not general creative staffing.",
    priority: true,
  },
  {
    slug: "design-systems-engineer",
    label: "Design systems engineer",
    h1: "Design systems engineer jobs",
    title: "Design systems engineer jobs",
    description:
      "Design systems engineer jobs and design system jobs. Roles building tokens, components, and the tooling designers and engineers share.",
    priority: true,
  },
  {
    slug: "ui-engineer",
    label: "UI engineer",
    h1: "UI engineer jobs",
    title: "UI engineer jobs",
    description:
      "UI engineer jobs and UI developer jobs. Software interface roles — React, CSS, and design-system implementation — separate from mechanical engineering.",
    priority: true,
  },
  {
    slug: "design-technologist",
    label: "Design technologist",
    h1: "Design technologist jobs",
    title: "Design technologist jobs",
    description:
      "Design technologist jobs at product companies and agencies. Prototyping, design systems, and frontend roles for designers who code.",
    priority: true,
  },
  {
    slug: "design-engineer",
    label: "Design engineer",
    h1: "Software design engineer jobs",
    title: "Software design engineer jobs",
    description:
      "Software design engineer jobs for designers who code. Product, brand, and design-systems roles — not mechanical, hardware, or chip design.",
    priority: false,
  },
  {
    slug: "creative-developer",
    label: "Creative developer",
    h1: "Creative developer jobs",
    title: "Creative developer jobs",
    description:
      "Creative developer jobs in web, WebGL, and interactive product work. A shorter list than the bigger creative technologist search.",
    priority: false,
  },
  {
    slug: "prototyper",
    label: "Prototyper",
    h1: "Prototyper jobs",
    title: "Prototyper jobs",
    description: "Prototyper jobs, including UX prototyper and AI prototyper roles. The work is a working prototype, not a slide deck.",
    priority: false,
  },
];

export const SALARY_ROLES: { slug: string; family: TitleFamily | "all"; h1: string; title: string; description: string }[] = [
  {
    slug: "ux-engineer",
    family: "ux-engineer",
    h1: "UX engineer salary",
    title: "UX engineer salary",
    description:
      "UX engineer salary ranges taken only from pay figures employers published on the job post. Updated as listings open and close.",
  },
  {
    slug: "ui-engineer",
    family: "ui-engineer",
    h1: "UI engineer salary",
    title: "UI engineer salary",
    description: "UI engineer salary ranges from employer-posted figures on software UI roles. Not crowdsourced estimates.",
  },
  {
    slug: "design-technologist",
    family: "design-technologist",
    h1: "Design technologist salary",
    title: "Design technologist salary",
    description: "Design technologist salary ranges from postings that publish pay. Base salary only, as written by the employer.",
  },
  {
    slug: "design-systems-engineer",
    family: "design-systems-engineer",
    h1: "Design systems engineer salary",
    title: "Design systems engineer salary",
    description: "Design systems engineer salary from employer-posted base pay on design system jobs. Tokens and components, not a mechanical average.",
  },
  {
    slug: "creative-technologist",
    family: "creative-technologist",
    h1: "Creative technologist salary",
    title: "Creative technologist salary",
    description: "Creative technologist salary from employer-posted yearly ranges. Campaign, brand, and interactive roles, not a crowdsourced average.",
  },
  {
    slug: "creative-developer",
    family: "creative-developer",
    h1: "Creative developer salary",
    title: "Creative developer salary",
    description: "Creative developer salary from posted software roles. Thin until more employers publish a yearly base. Nothing here is estimated.",
  },
];

export type SkillDef = {
  slug: SkillSlug;
  label: string;
  h1: string;
  title: string;
  description: string;
  priority: boolean;
};

export const SKILLS: SkillDef[] = [
  {
    slug: "framer",
    label: "Framer",
    h1: "Framer jobs",
    title: "Framer jobs",
    description:
      "Framer jobs for designers and developers who use Framer the design tool — sites, prototypes, and production UI. Not carpentry or construction framing.",
    priority: true,
  },
  {
    slug: "react",
    label: "React",
    h1: "React design engineer jobs",
    title: "React design engineer jobs",
    description: "React design engineer jobs where the posting names React. Interface and design-system work, not a general frontend board.",
    priority: false,
  },
  {
    slug: "figma",
    label: "Figma",
    h1: "Figma design engineer jobs",
    title: "Figma design engineer jobs",
    description: "Figma design engineer jobs that mention Figma next to production UI. The design tool, used by people who also ship the interface.",
    priority: false,
  },
  {
    slug: "design-systems",
    label: "Design systems",
    h1: "Design system jobs",
    title: "Design system jobs",
    description: "Design system jobs that mention tokens, components, and shared libraries. Software roles only, not mechanical documentation.",
    priority: false,
  },
  {
    slug: "threejs",
    label: "Three.js",
    h1: "Three.js jobs",
    title: "Three.js jobs",
    description: "Three.js jobs for creative developers and design engineers who mention Three.js. Interactive product work, not a general graphics board.",
    priority: false,
  },
  {
    slug: "webgl",
    label: "WebGL",
    h1: "WebGL developer jobs",
    title: "WebGL developer jobs",
    description: "WebGL developer jobs that mention WebGL in the posting. Creative coding and interface roles, not a general graphics board.",
    priority: false,
  },
  {
    slug: "swiftui",
    label: "SwiftUI",
    h1: "SwiftUI design engineer jobs",
    title: "SwiftUI design engineer jobs",
    description: "SwiftUI design engineer jobs that mention SwiftUI. Apple interface work for designers who ship production UI.",
    priority: false,
  },
  {
    slug: "motion",
    label: "Motion",
    h1: "Motion design engineer jobs",
    title: "Motion design engineer jobs",
    description: "Motion design engineer jobs that mention GSAP, Framer Motion, Lottie, or Rive. Interface motion, not a motion-graphics studio board.",
    priority: false,
  },
];

export type SeniorityDef = {
  slug: Seniority;
  label: string;
  h1: string;
  title: string;
  description: string;
  priority: boolean;
};

export const SENIORITIES: SeniorityDef[] = [
  {
    slug: "internship",
    label: "Internship",
    h1: "Design engineer internship",
    title: "Design engineer internship",
    description:
      "Design engineer internship and intern roles in software — UX, UI, and product teams. Not mechanical or civil internships.",
    priority: true,
  },
  {
    slug: "junior",
    label: "Junior",
    h1: "Junior design engineer jobs",
    title: "Junior design engineer jobs",
    description: "Junior design engineer jobs and other entry-level software roles. Interface work early in a design-engineering career, not a mechanical internship.",
    priority: false,
  },
  {
    slug: "senior",
    label: "Senior",
    h1: "Senior design engineer jobs",
    title: "Senior design engineer jobs",
    description: "Senior design engineer jobs in software. Product UI, design systems, and prototyping roles that name a senior level in the title.",
    priority: false,
  },
  {
    slug: "staff",
    label: "Staff",
    h1: "Staff design engineer jobs",
    title: "Staff design engineer jobs",
    description: "Staff design engineer jobs, including principal titles, in software. Broader scope than a senior req, and still interface work.",
    priority: false,
  },
  {
    slug: "lead",
    label: "Lead",
    h1: "Lead design engineer jobs",
    title: "Lead design engineer jobs",
    description: "Lead design engineer jobs in software product teams. The title names a lead, and the work is still the interface.",
    priority: false,
  },
  {
    slug: "founding",
    label: "Founding",
    h1: "Founding design engineer jobs",
    title: "Founding design engineer jobs",
    description: "Founding design engineer jobs at early startups. The first interface hire, still a software role rather than a mechanical one.",
    priority: false,
  },
  {
    slug: "manager",
    label: "Manager",
    h1: "Design engineering manager jobs",
    title: "Design engineering manager jobs",
    description: "Design engineering manager jobs leading software interface teams. People management on top of design-engineer work, not a hardware org.",
    priority: false,
  },
];

export const REGIONS: { slug: RegionSlug; label: string; h1: string; title: string }[] = [
  { slug: "us", label: "United States", h1: "Remote design engineer jobs in the US", title: "Remote design engineer jobs in the US" },
  { slug: "uk", label: "United Kingdom", h1: "Remote design engineer jobs in the UK", title: "Remote design engineer jobs in the UK" },
  { slug: "europe", label: "Europe", h1: "Remote design engineer jobs in Europe", title: "Remote design engineer jobs in Europe" },
  { slug: "canada", label: "Canada", h1: "Remote design engineer jobs in Canada", title: "Remote design engineer jobs in Canada" },
  { slug: "worldwide", label: "Worldwide", h1: "Worldwide remote design engineer jobs", title: "Worldwide remote design engineer jobs" },
];

export function roleBySlug(slug: string) {
  return ROLES.find((role) => role.slug === slug) || null;
}

export function skillBySlug(slug: string) {
  return SKILLS.find((skill) => skill.slug === slug) || null;
}

export function seniorityBySlug(slug: string) {
  return SENIORITIES.find((item) => item.slug === slug) || null;
}

export function salaryRoleBySlug(slug: string) {
  return SALARY_ROLES.find((item) => item.slug === slug) || null;
}

export const GUIDES = [
  {
    slug: "what-is-a-design-engineer",
    published: "2026-10-15",
    updated: "2026-10-15",
    title: "What is a design engineer?",
    description:
      "What a software design engineer is: prototypes, design systems, and production UI, distinct from mechanical design engineering.",
    h1: "What is a design engineer?",
  },
  {
    slug: "design-engineer-salary",
    published: "2026-10-15",
    updated: "2026-10-15",
    title: "Design engineer salary guide",
    description:
      "Software design engineer salary from employer-posted yearly ranges, plus UX engineer salary. Mechanical averages are a different dataset.",
    h1: "Design engineer salary guide",
  },
  {
    slug: "design-engineer-job-description",
    published: "2026-10-15",
    updated: "2026-10-15",
    title: "Design engineer job description",
    description:
      "A design engineer job description for software roles, with a UX engineer job description section and the lines that attract the wrong applicants.",
    h1: "Design engineer job description",
  },
  {
    slug: "design-technologist",
    published: "2026-10-20",
    updated: "2026-10-20",
    title: "What is a design technologist? Role vs design engineer",
    description:
      "A design technologist builds coded prototypes, design-system code and tools in a design team. How it compares with design engineer and UX engineer roles.",
    h1: "What is a design technologist?",
  },
] as const;

export function guideBySlug(slug: string) {
  return GUIDES.find((guide) => guide.slug === slug) || null;
}
