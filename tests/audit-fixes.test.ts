import { describe, expect, it } from "vitest";
import { formatSalaryShort } from "@/lib/format";
import { normalizeHeadings } from "@/lib/html";
import { buildJob, type JobDraft } from "@/lib/model";
import { pageParam } from "@/lib/query";
import { jobMetaDescription, jobMetaTitle, pageMeta } from "@/lib/seo";

const html = `<p>${"Ship interface work in React and Figma, including prototypes and the design system. ".repeat(4)}</p>`;

function make(overrides: Partial<JobDraft> = {}) {
  const draft: JobDraft = {
    source: "ashby",
    externalId: "abc12345",
    boardToken: "linear",
    companySlug: "linear",
    title: "Design Engineer (Web & Brand)",
    descriptionHtml: html,
    applyUrl: "https://example.com/jobs/1",
    datePosted: "2026-09-01T00:00:00.000Z",
    location: { text: "Europe", workplace: "remote" },
    ...overrides,
  };
  return buildJob(draft);
}

describe("normalizeHeadings", () => {
  it("shifts an h4-only description up to h3 so the outline does not skip", () => {
    expect(normalizeHeadings("<h4>Team</h4><p>x</p><h4 class='a'>You</h4>")).toBe("<h3>Team</h3><p>x</p><h3 class='a'>You</h3>");
  });

  it("keeps relative levels and leaves heading-free HTML untouched", () => {
    expect(normalizeHeadings("<h2>A</h2><h3>B</h3>")).toBe("<h3>A</h3><h4>B</h4>");
    expect(normalizeHeadings("<p>No headings</p>")).toBe("<p>No headings</p>");
  });
});

describe("job meta", () => {
  it("adds the place only when another listing shares title and company", () => {
    const europe = make({ externalId: "eu000001", location: { text: "Europe", workplace: "remote" } });
    const americas = make({ externalId: "na000001", location: { text: "North America", workplace: "remote" } });
    const a = jobMetaTitle(europe, [europe, americas]);
    const b = jobMetaTitle(americas, [europe, americas]);
    expect(a).not.toBe(b);
    expect(a.length).toBeLessThanOrEqual(65);
    expect(jobMetaTitle(europe, [europe])).toBe("Design Engineer (Web & Brand) at Linear");
  });

  it("writes a description long enough to avoid a stub snippet", () => {
    const description = jobMetaDescription(make());
    expect(description.length).toBeGreaterThanOrEqual(70);
    expect(description.length).toBeLessThanOrEqual(155);
  });
});

describe("pagination metadata", () => {
  it("gives page 2 its own title and description", () => {
    const first = pageMeta({ title: "UX engineer jobs", description: "UX engineer jobs.", path: "/roles/ux-engineer", index: true });
    const second = pageMeta({ title: "UX engineer jobs", description: "UX engineer jobs.", path: "/roles/ux-engineer", index: true, page: 2 });
    expect(second.title).toBe("UX engineer jobs (page 2)");
    expect(second.description).not.toBe(first.description);
  });

  it("reads ?page safely", () => {
    expect(pageParam({ page: "2" })).toBe(2);
    expect(pageParam({ page: ["3"] })).toBe(3);
    expect(pageParam({ page: "-1" })).toBe(1);
    expect(pageParam({ page: "abc" })).toBe(1);
    expect(pageParam({})).toBe(1);
  });
});

describe("formatSalaryShort", () => {
  it("compacts a yearly range without repeating the currency symbol", () => {
    expect(formatSalaryShort({ salaryMin: 200000, salaryMax: 245000, salaryCurrency: "USD", salaryUnit: "YEAR" })).toBe("$200k–245k/yr");
    expect(formatSalaryShort({ salaryMin: 210000, salaryMax: 240000, salaryCurrency: "CAD", salaryUnit: "YEAR" })).toBe("CA$210k–240k/yr");
    expect(formatSalaryShort({ salaryMin: 60, salaryMax: 80, salaryCurrency: "USD", salaryUnit: "HOUR" })).toBe("$60–80/hr");
    expect(formatSalaryShort({ salaryMin: null, salaryMax: null, salaryCurrency: null, salaryUnit: null })).toBeNull();
  });
});
