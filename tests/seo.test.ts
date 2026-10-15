import { describe, expect, it } from "vitest";
import { ROLES, SALARY_ROLES, SENIORITIES, SKILLS, GUIDES, REGIONS } from "@/lib/catalog";
import { listingFaqs } from "@/lib/query";
import { fitDescription, fitText, fitTitle, remoteRoleDescription, remoteRoleTitle } from "@/lib/seo";
import type { Job } from "@/lib/types";

function words(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

const sample = {
  companyName: "Ashby",
  title: "Design Engineer",
  salaryUnit: "YEAR",
  salaryMin: 140000,
  salaryMax: 180000,
  salaryCurrency: "USD",
} as Job;

describe("meta length", () => {
  const titles = [
    ...ROLES.map((item) => item.title),
    ...SALARY_ROLES.map((item) => item.title),
    ...SKILLS.map((item) => item.title),
    ...SENIORITIES.map((item) => item.title),
    ...REGIONS.map((item) => item.title),
    ...GUIDES.map((item) => item.title),
    "Design engineer jobs — Design Code Jobs",
    "Design engineer salary",
    "Remote design engineer jobs",
    "Post a design engineer job",
  ];
  const descriptions = [
    ...ROLES.map((item) => item.description),
    ...SALARY_ROLES.map((item) => item.description),
    ...SKILLS.map((item) => item.description),
    ...SENIORITIES.map((item) => item.description),
    ...GUIDES.map((item) => item.description),
    ...ROLES.map((item) => remoteRoleDescription(item.label)),
  ];

  it("keeps authored titles inside 65 characters", () => {
    for (const title of titles) expect(title.length, title).toBeLessThanOrEqual(65);
  });

  it("keeps authored descriptions inside 165 characters", () => {
    for (const description of descriptions) expect(description.length, description).toBeLessThanOrEqual(165);
  });
});

describe("fitText", () => {
  it("clips a long job title on a word boundary", () => {
    const title = fitTitle("Staff Design Engineer, Americas and Europe at A Very Long Company Name Indeed");
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title.endsWith("…")).toBe(true);
    expect(title.includes("  ")).toBe(false);
  });

  it("leaves a short title untouched", () => {
    expect(fitTitle("Design Engineer at Ashby")).toBe("Design Engineer at Ashby");
  });

  it("clips descriptions at the hard limit", () => {
    const description = fitDescription(`${"Salary posted. ".repeat(20)}`);
    expect(description.length).toBeLessThanOrEqual(155);
    expect(fitText("Short line", 165)).toBe("Short line");
  });
});

describe("listing FAQs", () => {
  it("keeps answers in the 40–60 word band and does not repeat the home keyword in every question", () => {
    for (const faq of listingFaqs("UX engineer jobs", [sample])) {
      const count = words(faq.a);
      expect(count, faq.q).toBeGreaterThanOrEqual(40);
      expect(count, faq.q).toBeLessThanOrEqual(60);
    }
    for (const faq of listingFaqs("UX engineer jobs", [])) {
      const count = words(faq.a);
      expect(count, faq.q).toBeGreaterThanOrEqual(40);
      expect(count, faq.q).toBeLessThanOrEqual(60);
    }
    const home = listingFaqs("Design engineer jobs", [sample]);
    const exact = home.filter((faq) => faq.q.toLowerCase().includes("design engineer jobs"));
    expect(exact).toHaveLength(1);
  });
});

describe("remote role titles", () => {
  it("keeps acronyms and the live lowercase for ordinary words", () => {
    expect(remoteRoleTitle("UX engineer jobs")).toBe("Remote UX engineer jobs");
    expect(remoteRoleTitle("UI engineer jobs")).toBe("Remote UI engineer jobs");
    expect(remoteRoleTitle("Software design engineer jobs")).toBe("Remote software design engineer jobs");
    expect(remoteRoleTitle("Design systems engineer jobs")).toBe("Remote design systems engineer jobs");
  });
});
