import { describe, expect, it } from "vitest";
import raw from "@/data/reports/2026-10.json";
import { generateMetadata } from "@/app/reports/[month]/page";
import {
  isSmallSample,
  methodologyAnswer,
  openingParagraph,
  RELATED_LINKS,
  reportFaqs,
  reportSections,
  reportsIndexDescription,
  salaryRow,
  snapshotDescription,
  snapshotTitle,
  visibleProse,
} from "@/lib/reports/copy";
import { currentMonth } from "@/lib/reports/month";
import { frozenSnapshot, indexableReportPaths, reportNavLinks } from "@/lib/reports/paths";
import { getSnapshot, listSnapshots } from "@/lib/reports/registry";
import { indexablePagePaths } from "@/lib/sitemap-data";

function words(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function numberTokens(value: string) {
  return [...value.matchAll(/\d[\d,]*/g)].map((match) => match[0].replace(/,/g, "").replace(/^0+(?=\d)/, ""));
}

function collectNumbers(value: unknown, into = new Set<string>()) {
  if (typeof value === "number") into.add(String(value));
  else if (typeof value === "string") for (const token of numberTokens(value)) into.add(token);
  else if (Array.isArray(value)) for (const item of value) collectNumbers(item, into);
  else if (value && typeof value === "object") for (const item of Object.values(value)) collectNumbers(item, into);
  return into;
}

function repeatedWords(title: string) {
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const word of title.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean)) {
    if (seen.has(word)) dupes.push(word);
    seen.add(word);
  }
  return dupes;
}

describe("October 2026 snapshot", () => {
  const snapshot = getSnapshot("2026-10");

  it("loads the frozen file without changing its figures", () => {
    expect(snapshot).not.toBeNull();
    if (!snapshot) return;
    expect(snapshot.month).toBe(raw.month);
    expect(snapshot.scopeNote).toBe(raw.scope_note);
    expect(snapshot.noteOnNonUsd).toBe(raw.note_on_non_usd);
    expect(snapshot.trackedListings).toBe(raw.tracked_listings);
    expect(snapshot.trackedCompanies).toBe(raw.tracked_companies);
    expect(snapshot.openAtLastSync).toBe(raw.open_at_last_sync);
    expect(snapshot.openCompanies).toBe(raw.open_companies);
    expect(snapshot.closedDuringMonth).toBe(raw.closed_during_month);
    expect(snapshot.remoteShareOpenPct).toBe(raw.remote_share_open_pct);
    expect(snapshot.listingsWithPostedYearlySalary).toBe(raw.listings_with_posted_yearly_salary);
    expect(snapshot.workplaceOpen).toEqual(raw.workplace_open);
    expect(snapshot.workplaceTracked).toEqual(raw.workplace_tracked);
    expect(snapshot.roleFamiliesTracked).toEqual(raw.role_families_tracked);
    expect(snapshot.newRoles.map((role) => role.title)).toEqual(raw.new_roles_posted_in_october.map((role) => role.title));
    expect(snapshot.topCompanies).toEqual(raw.top_companies_by_open_roles.map(([name, openRoles]) => ({ name, openRoles })));
    expect(snapshot.salaryByRoleAndCurrency.map((row) => row.medianMidpoint)).toEqual(
      raw.salary_by_role_and_currency.map((row) => row.median_midpoint),
    );
    expect(snapshot.salaryByCurrencyAllRoles.map((row) => row.medianMidpoint)).toEqual(
      raw.salary_by_currency_all_roles.map((row) => row.median_midpoint),
    );
    expect(snapshot.usdRemoteVsNot.remote).toEqual({
      n: raw.usd_remote_vs_not.remote.n,
      medianMidpoint: raw.usd_remote_vs_not.remote.median_midpoint,
    });
    expect(snapshot.usdRemoteVsNot.onsiteOrHybrid).toEqual({
      n: raw.usd_remote_vs_not.onsite_or_hybrid.n,
      medianMidpoint: raw.usd_remote_vs_not.onsite_or_hybrid.median_midpoint,
    });
    expect(snapshot.listings).toHaveLength(raw.listings.length);
  });

  it("keeps answer paragraphs in the 40–60 word band and the headline facts in the opening", () => {
    expect(snapshot).not.toBeNull();
    if (!snapshot) return;
    const opening = openingParagraph(snapshot);
    expect(words(opening)).toBeGreaterThanOrEqual(40);
    expect(words(opening)).toBeLessThanOrEqual(60);
    expect(opening).toContain("35 open roles");
    expect(opening).toContain("23 companies");
    expect(opening).toContain("9 new roles");
    expect(opening).toContain("49% of open roles were fully remote");
    expect(opening).toContain("$235,000");
    expect(opening).not.toMatch(/\/guides\/|\/tools\/|https?:/);
    for (const section of reportSections(snapshot)) {
      const count = words(section.answer);
      expect(count, section.question).toBeGreaterThanOrEqual(40);
      expect(count, section.question).toBeLessThanOrEqual(60);
    }
    for (const faq of reportFaqs(snapshot)) {
      const count = words(faq.a);
      expect(count, faq.q).toBeGreaterThanOrEqual(40);
      expect(count, faq.q).toBeLessThanOrEqual(60);
    }
  });

  it("uses only numbers that appear in the snapshot file", () => {
    expect(snapshot).not.toBeNull();
    if (!snapshot) return;
    const allowed = collectNumbers(raw);
    const prose = visibleProse(snapshot).join("\n");
    const stray = [...new Set(numberTokens(prose).filter((token) => !allowed.has(token)))];
    expect(stray).toEqual([]);
    expect(methodologyAnswer(snapshot)).toContain("(minimum + maximum) / 2");
    expect(prose).toContain(raw.scope_note);
    expect(prose).toContain(raw.note_on_non_usd);
  });

  it("writes a unique title and description inside the length limits", () => {
    expect(snapshot).not.toBeNull();
    if (!snapshot) return;
    const title = snapshotTitle(snapshot);
    const description = snapshotDescription(snapshot);
    expect(title).toBe("Design engineering jobs and salary report: October 2026");
    expect(title.length).toBeLessThanOrEqual(65);
    expect(title.includes("|")).toBe(false);
    expect(repeatedWords(title)).toEqual([]);
    expect(description.length).toBeLessThanOrEqual(155);
    expect(description.includes("|")).toBe(false);
    const index = reportsIndexDescription(listSnapshots(), new Date("2026-11-01T00:00:00Z"));
    expect(index.length).toBeLessThanOrEqual(165);
    expect(repeatedWords("Design engineering jobs reports")).toEqual([]);
    const phrase = visibleProse(snapshot).join(" ").toLowerCase().match(/design engineering jobs/g) ?? [];
    expect(phrase.length).toBeGreaterThanOrEqual(3);
    expect(phrase.length).toBeLessThanOrEqual(8);
  });

  it("flags small salary samples and keeps the design engineer USD row intact", () => {
    expect(snapshot).not.toBeNull();
    if (!snapshot) return;
    const design = salaryRow(snapshot, "design-engineer", "USD");
    expect(design).toMatchObject({ listings: 13, medianMidpoint: 235000, lowestPostedMin: 140000, highestPostedMax: 440000 });
    expect(design && isSmallSample(design)).toBe(false);
    const gbp = salaryRow(snapshot, "design-engineer", "GBP");
    expect(gbp && isSmallSample(gbp)).toBe(true);
    expect(salaryRow(snapshot, "ux-engineer", "USD")?.listings).toBe(1);
  });

  it("links the salary guide, calculator, and design systems guide with distinct anchors", () => {
    const hrefs = RELATED_LINKS.map((link) => link.href);
    const anchors = RELATED_LINKS.map((link) => link.anchor);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(new Set(anchors).size).toBe(anchors.length);
    expect(hrefs).toEqual([
      "/guides/design-engineer-salary",
      "/tools/design-engineer-salary-calculator",
      "/guides/design-systems-engineer",
    ]);
  });

  it("serves the snapshot only after the month has closed", () => {
    expect(frozenSnapshot("2026-10", new Date("2026-11-01T00:00:00Z"))?.month).toBe("2026-10");
    expect(frozenSnapshot("2026-10", new Date("2026-10-23T00:00:00Z"))).toBeNull();
    expect(frozenSnapshot("2026-09", new Date("2026-11-01T00:00:00Z"))).toBeNull();
    expect(getSnapshot("2026-09")).toBeNull();
  });

  it("indexes the frozen report and the reports index", async () => {
    const paths = await indexablePagePaths();
    expect(paths).toEqual(expect.arrayContaining(["/reports", "/reports/2026-10", `/reports/${currentMonth()}`]));
    expect(indexableReportPaths(new Date("2026-11-01T00:00:00Z"))).toEqual(["/reports", "/reports/2026-10", "/reports/2026-11"]);
    const links = reportNavLinks(new Date("2026-11-01T00:00:00Z"));
    expect(links.map((link) => link.href)).toEqual(["/reports", "/reports/2026-11", "/reports/2026-10"]);
    expect(new Set(links.map((link) => link.label)).size).toBe(links.length);

    const october = await generateMetadata({ params: Promise.resolve({ month: "2026-10" }) });
    if (currentMonth() === "2026-10") {
      expect(october.title).toBe("Design engineering jobs report 2026-10");
    } else {
      expect(october.title).toBe("Design engineering jobs and salary report: October 2026");
      expect(october.description).toBe(snapshotDescription(snapshot!));
    }
    expect(october.robots).toMatchObject({ index: true, follow: true });
    expect(october.alternates?.canonical).toBe("https://designcodejobs.com/reports/2026-10");

    const missing = await generateMetadata({ params: Promise.resolve({ month: "2026-09" }) });
    expect(missing.robots).toMatchObject({ index: false, follow: true });

    const live = await generateMetadata({ params: Promise.resolve({ month: currentMonth() }) });
    expect(live.title).toBe(`Design engineering jobs report ${currentMonth()}`);
    expect(live.robots).toMatchObject({ index: true, follow: true });
  });
});
