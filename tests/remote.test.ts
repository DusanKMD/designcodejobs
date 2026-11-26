import { describe, expect, it } from "vitest";
import { wordCount } from "@/lib/format";
import { remoteFaqs, remoteMetaDescription, remoteMetaTitle, remoteSummary } from "@/lib/remote";
import type { Job, RegionSlug, TitleFamily } from "@/lib/types";

function job(partial: Partial<Job> & Pick<Job, "id" | "companyName" | "companySlug">): Job {
  return {
    regions: [],
    titleFamily: "design-engineer",
    workplace: "remote",
    salaryMin: null,
    salaryMax: null,
    salaryCurrency: null,
    salaryUnit: null,
    updatedAt: "2026-11-01T00:00:00.000Z",
    datePosted: "2026-11-01T00:00:00.000Z",
    ...partial,
  } as Job;
}

const jobs = [
  job({
    id: "dual",
    companyName: "Ashby",
    companySlug: "ashby",
    regions: ["us", "canada"] as RegionSlug[],
    titleFamily: "design-engineer" as TitleFamily,
    salaryUnit: "YEAR",
    salaryCurrency: "USD",
    salaryMin: 100000,
    salaryMax: 200000,
    updatedAt: "2026-11-02T00:00:00.000Z",
  }),
  job({
    id: "unpaid",
    companyName: "Reddit",
    companySlug: "reddit",
    regions: ["us"],
    titleFamily: "ux-engineer",
  }),
  job({
    id: "gbp",
    companyName: "Linear",
    companySlug: "linear",
    regions: ["europe"],
    salaryUnit: "YEAR",
    salaryCurrency: "GBP",
    salaryMin: 80000,
    salaryMax: 120000,
  }),
  job({
    id: "hourly",
    companyName: "Vercel",
    companySlug: "vercel",
    regions: ["uk"],
    titleFamily: "creative-technologist",
    salaryUnit: "HOUR",
    salaryCurrency: "USD",
    salaryMin: 50,
    salaryMax: 80,
  }),
];

describe("remoteSummary", () => {
  const summary = remoteSummary(jobs);

  it("counts a job in each region it names, and keeps currencies apart", () => {
    expect(summary.total).toBe(4);
    expect(summary.companyCount).toBe(4);
    expect(summary.companies.map((company) => [company.name, company.count])).toEqual([
      ["Ashby", 1],
      ["Linear", 1],
      ["Reddit", 1],
      ["Vercel", 1],
    ]);
    expect(summary.updated).toBe("Nov 2, 2026");

    const region = (slug: string) => summary.regions.find((item) => item.slug === slug);
    expect(summary.regions.map((item) => item.slug)).toEqual(["us", "uk", "europe", "canada", "worldwide"]);
    expect(region("us")).toMatchObject({ count: 2, companies: ["Ashby", "Reddit"] });
    expect(region("canada")).toMatchObject({ count: 1, companies: ["Ashby"] });
    expect(region("europe")).toMatchObject({ count: 1, companies: ["Linear"] });
    expect(region("uk")).toMatchObject({ count: 1, companies: ["Vercel"], pay: [] });
    expect(region("worldwide")).toMatchObject({ count: 0, companies: [], pay: [] });

    expect(summary.pay.map((band) => band.currency)).toEqual(["USD", "GBP"]);
    expect(summary.pay[0]).toMatchObject({ count: 1, min: 100000, max: 200000, median: 150000 });
    expect(summary.pay[1]).toMatchObject({ count: 1, min: 80000, max: 120000, median: 100000 });
    expect(summary.withPay).toBe(2);
    expect(summary.withoutPay).toBe(2);
    expect(region("us")?.pay).toMatchObject([{ currency: "USD", min: 100000, max: 200000 }]);
    expect(region("canada")?.pay[0]?.currency).toBe("USD");
    expect(region("europe")?.pay[0]?.currency).toBe("GBP");

    expect(summary.families.map((family) => [family.label, family.count])).toEqual([
      ["Design engineer", 2],
      ["Creative technologist", 1],
      ["UX engineer", 1],
    ]);
    expect(summary.families.reduce((sum, family) => sum + family.count, 0)).toBe(summary.total);
  });
});

describe("remoteFaqs", () => {
  const summary = remoteSummary(jobs);

  it("returns six answers with no missing values", () => {
    const faqs = remoteFaqs(summary, 10);
    expect(faqs).toHaveLength(6);
    const blob = faqs.map((faq) => `${faq.q}\n${faq.a}`).join("\n");
    expect(blob).not.toMatch(/undefined|NaN|\bnull\b/);
    expect(faqs[0].a).toContain("4 fully remote software design engineer roles are open at 4 companies, out of 10 live roles");
    expect(faqs[1].a).toContain("Ashby (1), Linear (1), Reddit (1), Vercel (1)");
    expect(faqs[2].a).toContain("1 remote role is open to Europe at Linear");
    expect(faqs[2].a).toContain("1 remote role is open to the UK at Vercel");
    expect(faqs[3].a).toContain("None of the 4 remote roles open today accept applicants from any country");
    expect(faqs[3].a).toContain("2 hire in the US and 1 hire in Canada");
    expect(faqs[4].a).toContain("1 listing in USD posts");
    expect(faqs[4].a).toContain("1 listing in GBP posts");
    expect(faqs[4].a).toContain("2 listings post no range");
    expect(faqs[4].a).toContain("employer-posted");
    expect(faqs[4].a).not.toContain("$50");
    for (const faq of faqs) {
      const count = wordCount(faq.a);
      expect(count, faq.q).toBeGreaterThanOrEqual(35);
      expect(count, faq.q).toBeLessThanOrEqual(90);
    }
  });

  it("uses an empty state with no invented numbers or table data", () => {
    const faqs = remoteFaqs(remoteSummary([]), 12);
    expect(faqs).toHaveLength(6);
    const blob = faqs.map((faq) => faq.a).join("\n");
    expect(blob).not.toMatch(/undefined|NaN|\bnull\b/);
    expect(blob).not.toContain("$");
    expect(blob).not.toContain("|");
    expect(blob).not.toContain("12");
    expect(blob.toLowerCase()).toContain("no fully remote role is open right now");
    expect(blob.toLowerCase()).toContain("next board sync");
    for (const faq of faqs) {
      const numbers = faq.a.match(/\d+/g) || [];
      expect(numbers.every((value) => value === "0"), faq.a).toBe(true);
      expect(wordCount(faq.a), faq.q).toBeGreaterThanOrEqual(35);
      expect(wordCount(faq.a), faq.q).toBeLessThanOrEqual(90);
    }
  });
});

describe("remote meta", () => {
  it("keeps the title within 60 characters and the description within 158", () => {
    const long = "Northwind Collaborative Laboratory Partners International";
    const named = [1, 2, 3, 4].map((index) =>
      job({
        id: `long-${index}`,
        companyName: `${long} ${index} Design Systems Group`,
        companySlug: `long-${index}`,
        regions: ["us"],
        salaryUnit: "YEAR",
        salaryCurrency: "USD",
        salaryMin: 100000,
        salaryMax: 200000,
      }),
    );
    const summary = remoteSummary(named);
    const title = remoteMetaTitle(summary);
    const description = remoteMetaDescription(summary);
    expect(title.length).toBeLessThanOrEqual(60);
    expect(description.length).toBeLessThanOrEqual(158);
    expect(title).toBe("Remote design engineer jobs: 4 open software roles");
    expect(description.startsWith("4 fully remote design engineer jobs at 4 companies")).toBe(true);
    expect(description).not.toContain(long);

    const short = remoteMetaDescription(remoteSummary(jobs));
    expect(short.length).toBeLessThanOrEqual(158);
    expect(short).toContain("Ashby");
    expect(remoteMetaTitle(remoteSummary([])).length).toBeLessThanOrEqual(60);
    expect(remoteMetaDescription(remoteSummary([])).length).toBeLessThanOrEqual(158);
  });
});
