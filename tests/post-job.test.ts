import { describe, expect, it } from "vitest";
import { checkoutOutcome, EMPTY_POST_JOB, parsePostJob, type PostJobValues } from "@/lib/post-job";

function values(overrides: Partial<PostJobValues> = {}): PostJobValues {
  return {
    ...EMPTY_POST_JOB,
    email: "ada@vercel.com",
    company: "Vercel",
    domain: "https://www.vercel.com/jobs",
    title: "Design Engineer",
    workplace: "remote",
    location: "",
    apply_url: "https://vercel.com/careers/design-engineer",
    salary_min: "180000",
    salary_max: "240000",
    salary_currency: "USD",
    description: "A".repeat(200),
    featured: true,
    ...overrides,
  };
}

describe("post job schema", () => {
  it("accepts a complete remote listing and normalizes domain and salary", () => {
    const parsed = parsePostJob(values());
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.data.companyDomain).toBe("vercel.com");
    expect(parsed.data.email).toBe("ada@vercel.com");
    expect(parsed.data.salaryMin).toBe(180000);
    expect(parsed.data.salaryMax).toBe(240000);
    expect(parsed.data.featured).toBe(true);
    expect(parsed.data.descriptionHtml.startsWith("<p>")).toBe(true);
  });

  it("rejects short titles, short descriptions, bad emails, and non-http apply links", () => {
    const parsed = parsePostJob(values({
      email: "not-an-email",
      title: "Role",
      description: "Too short",
      apply_url: "javascript:alert(1)",
    }));
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(parsed.errors.email).toBeTruthy();
    expect(parsed.errors.title).toMatch(/5/);
    expect(parsed.errors.description).toMatch(/200/);
    expect(parsed.errors.apply_url).toMatch(/http/);
  });

  it("requires a location off remote and keeps salary min at or below max", () => {
    const onsite = parsePostJob(values({ workplace: "onsite", location: "" }));
    expect(onsite.ok).toBe(false);
    if (!onsite.ok) expect(onsite.errors.location).toBeTruthy();

    const pay = parsePostJob(values({ salary_min: "200", salary_max: "100" }));
    expect(pay.ok).toBe(false);
    if (!pay.ok) expect(pay.errors.salary_max).toMatch(/Maximum/);
  });

  it("copies a single salary figure into the max", () => {
    const parsed = parsePostJob(values({ salary_min: "160000", salary_max: "" }));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.data.salaryMax).toBe(160000);
  });
});

describe("checkout outcome", () => {
  it("maps Dodo return statuses and the unconfigured pending flag", () => {
    expect(checkoutOutcome({ pending: "1", status: "failed" })).toBe("unconfigured");
    expect(checkoutOutcome({ status: "succeeded" })).toBe("paid");
    expect(checkoutOutcome({ status: "processing" })).toBe("pending");
    expect(checkoutOutcome({ status: "failed" })).toBe("failed");
    expect(checkoutOutcome({ status: "canceled" })).toBe("cancelled");
    expect(checkoutOutcome({})).toBe("unknown");
  });
});
