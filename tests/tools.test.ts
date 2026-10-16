import { describe, expect, it } from "vitest";
import { draftFromSearch, generateJobDescription, postJobHref, POST_PRICE_LABEL, type JdInput } from "@/lib/job-description";
import { listingKeywords } from "@/lib/listing-keywords";
import { checklistCounts, parseChecked } from "@/lib/portfolio-checklist";
import { scoreResume, wordCount } from "@/lib/resume-checker";
import { POST_JOB_LIMITS } from "@/lib/post-job";
import {
  INDEX_FAQS,
  INDEX_HOW,
  JD_FAQS,
  JD_HOW,
  PORTFOLIO_FAQS,
  PORTFOLIO_HOW,
  RESUME_FAQS,
  RESUME_HOW,
} from "@/lib/tool-copy";

const RESUME_DESCRIPTION = "Free design engineer resume checker. Score pasted text from 0 to 100 on shipped UI, stack, impact, links, length, and ATS safety.";
const PORTFOLIO_DESCRIPTION = "Free design engineer portfolio checklist. Track what open listings ask for, save progress in this browser, and share or print the list.";
const JD_DESCRIPTION = "Free design engineer job description generator. Draft a software posting from role, level, stack, location, and salary, then post it here.";
const INDEX_DESCRIPTION = "Free design engineer tools. Check a resume, follow a portfolio checklist, write a job description, or estimate pay from ranges employers posted.";

function words(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function pad(body: string, target: number) {
  const have = wordCount(body);
  const extra = Math.max(0, target - have);
  return `${body} ${Array.from({ length: extra }, () => "detail").join(" ")}`.trim();
}

const STRONG = pad(
  `Ada Lovelace ada@example.com
Experience
Skills
I shipped a production interface and launched, released, and deployed it. The pull request was merged and it is live.
Built with React, TypeScript, CSS, and a design system in Figma. Motion and accessibility were part of the work.
Designed, prototyped, and implemented the flow. It improved checkout by 18% for 12000 users in 200ms and saved $40000.
GitHub https://github.com/ada-l and portfolio https://ada.example.`,
  400,
);

describe("resume score", () => {
  it("scores a complete design-engineer resume at 100 and a thin one at 0", () => {
    const strong = scoreResume(STRONG, [{ term: "React", count: 2, listings: 2 }, { term: "Storybook", count: 1, listings: 1 }]);
    expect(strong.score).toBe(100);
    expect(strong.rows.reduce((sum, row) => sum + row.max, 0)).toBe(100);
    expect(strong.rows.reduce((sum, row) => sum + row.score, 0)).toBe(strong.score);
    expect(strong.missing).toEqual(["Storybook"]);
    expect(strong.rows.every((row) => row.fixes.length === 0)).toBe(true);

    const thin = scoreResume("Designer who likes pixels.");
    expect(thin.score).toBe(0);
    expect(thin.rows.find((row) => row.id === "shipped")?.fixes.length).toBeGreaterThan(0);
  });

  it("is deterministic and does not treat a year as impact", () => {
    expect(scoreResume(STRONG)).toEqual(scoreResume(STRONG));
    const dated = scoreResume("Shipped in 2024 to 12 people. Experience and skills. ada@example.com");
    expect(dated.rows.find((row) => row.id === "impact")?.score).toBe(0);
    expect(dated.rows.find((row) => row.id === "impact")?.detail).toContain("1 quantities");
  });

  it("drops ATS points for box-drawing characters", () => {
    const clean = scoreResume(pad("Experience\nSkills\nada@example.com\nBuilt interface work.", 50));
    const ruled = scoreResume(pad("Experience\nSkills\nada@example.com\nBuilt interface work. ││", 50));
    const cleanAts = clean.rows.find((row) => row.id === "ats")?.score || 0;
    const ruledAts = ruled.rows.find((row) => row.id === "ats")?.score || 0;
    expect(cleanAts).toBeGreaterThan(ruledAts);
  });
});

describe("listing keywords", () => {
  it("counts term frequency and how many listings mention each term", () => {
    const rows = listingKeywords([
      "We use React and React again in production.",
      "TypeScript and React.",
      "No stack named here.",
    ]);
    expect(rows[0]).toEqual({ term: "React", count: 3, listings: 2 });
    expect(rows.find((row) => row.term === "TypeScript")).toEqual({ term: "TypeScript", count: 1, listings: 1 });
    expect(rows.find((row) => row.term === "SwiftUI")).toBeUndefined();
  });
});

describe("portfolio checklist", () => {
  it("counts listing mentions and keeps only known ids", () => {
    const counts = checklistCounts([
      "Shipped a React prototype with a design system.",
      "Accessibility and Figma.",
    ]);
    expect(counts.shipped).toBe(1);
    expect(counts.code).toBe(1);
    expect(counts.prototype).toBe(1);
    expect(counts.system).toBe(1);
    expect(counts.a11y).toBe(1);
    expect(counts.figma).toBe(1);
    expect(counts.motion).toBe(0);
    expect(parseChecked("shipped,nope,shipped, code")).toEqual(["shipped", "code"]);
    expect(parseChecked(null)).toEqual([]);
  });
});

describe("job description generator", () => {
  const blank: JdInput = {
    role: "ux-engineer",
    level: "senior",
    stack: ["React", "TypeScript", "motion"],
    workplace: "remote",
    location: "United States",
    salaryMin: "",
    salaryMax: "",
    currency: "EUR",
  };

  it("names the role and stack and refuses to invent a salary", () => {
    const text = generateJobDescription(blank);
    expect(text.startsWith("UX Engineer")).toBe(true);
    expect(text).toContain("React, TypeScript, motion");
    expect(text).toContain("Do not invent a band.");
    expect(text).not.toContain("160,000");
    expect(text).toContain("Treat motion as part of the interface");
    expect(text.length).toBeGreaterThanOrEqual(POST_JOB_LIMITS.description.min);
  });

  it("prints the range the employer typed, in that currency", () => {
    const text = generateJobDescription({ ...blank, salaryMin: "160000", salaryMax: "200000" });
    expect(text).toContain("Base salary: EUR 160,000–200,000 a year.");
    expect(text).not.toContain("$");
  });

  it("builds a posting link and only reads a draft when asked", () => {
    const href = postJobHref({ ...blank, salaryMin: "160000", salaryMax: "200,000" });
    const params = new URLSearchParams(href.slice(href.indexOf("?")));
    expect(params.get("draft")).toBe("1");
    expect(params.get("title")).toBe("UX Engineer");
    expect(params.get("workplace")).toBe("remote");
    expect(params.get("location")).toBe("United States");
    expect(params.get("salary_min")).toBe("160000");
    expect(params.get("salary_max")).toBe("200000");
    expect(params.get("salary_currency")).toBe("EUR");
    expect(POST_PRICE_LABEL).toBe("Post this job for $129");

    const stored = JSON.stringify({ description: "A long enough description for the form." });
    expect(draftFromSearch(new URLSearchParams(), stored)).toBeNull();
    expect(draftFromSearch(new URLSearchParams("draft=1"), "not-json")?.description).toBeUndefined();
    expect(draftFromSearch(params, stored)).toMatchObject({
      title: "UX Engineer",
      workplace: "remote",
      salary_currency: "EUR",
      description: "A long enough description for the form.",
    });
    expect(draftFromSearch(new URLSearchParams("draft=1&salary_currency=BTC"), null)?.salary_currency).toBeUndefined();
  });
});

describe("tool page copy", () => {
  it("keeps titles, descriptions, and answers inside the on-page limits", () => {
    const titles = [
      "Free design engineer tools",
      "Design engineer resume checker",
      "Design engineer portfolio checklist",
      "Design engineer job description generator",
    ];
    const descriptions = [INDEX_DESCRIPTION, RESUME_DESCRIPTION, PORTFOLIO_DESCRIPTION, JD_DESCRIPTION];
    for (const title of titles) expect(title.length, title).toBeLessThanOrEqual(60);
    for (const description of descriptions) expect(description.length, description).toBeLessThanOrEqual(155);
    for (const item of [INDEX_HOW, RESUME_HOW, PORTFOLIO_HOW, JD_HOW, ...INDEX_FAQS, ...RESUME_FAQS, ...PORTFOLIO_FAQS, ...JD_FAQS]) {
      const count = words(item.a);
      expect(count, item.q).toBeGreaterThanOrEqual(40);
      expect(count, item.q).toBeLessThanOrEqual(60);
    }
  });
});
