import { describe, expect, it } from "vitest";
import { buildJobPosting } from "@/lib/jsonld";
import { buildJob, type JobDraft } from "@/lib/model";
import { parseLocation } from "@/lib/location";
import type { Job } from "@/lib/types";

const html = `<p>${"Ship interface work in React and Figma, including prototypes and the design system. ".repeat(4)}</p>`;

function make(overrides: Partial<JobDraft> = {}) {
  const draft: JobDraft = {
    source: "ashby",
    externalId: "abc12345",
    boardToken: "acme",
    companySlug: "vercel",
    title: "Design Engineer",
    descriptionHtml: html,
    applyUrl: "https://example.com/jobs/1",
    datePosted: "2026-09-01T00:00:00.000Z",
    location: { text: "Remote - US", workplace: "remote" },
    ...overrides,
  };
  return buildJob(draft);
}

describe("JobPosting mapping", () => {
  it("maps Remote - US to TELECOMMUTE and USA, without a jobLocation", () => {
    const place = parseLocation({ text: "Remote - US", workplace: "remote" });
    expect(place.applicantCountries).toEqual(["US"]);
    expect(place.workplace).toBe("remote");
    const schema = buildJobPosting(make({ location: { text: "Remote - US", workplace: "remote" } }));
    expect(schema?.jobLocationType).toBe("TELECOMMUTE");
    expect(schema?.jobLocation).toBeUndefined();
    expect(schema?.applicantLocationRequirements).toMatchObject({ "@type": "Country", name: "USA" });
    expect(schema?.directApply).toBe(false);
    expect(schema?.title).toBe("Design Engineer");
    expect(String(schema?.description)).toContain("<p>");
  });

  it("maps Remote (Europe) to a list of EU countries", () => {
    const schema = buildJobPosting(make({ location: { text: "Remote (Europe)", workplace: "remote" } }));
    const countries = schema?.applicantLocationRequirements as { name: string }[];
    expect(schema?.jobLocationType).toBe("TELECOMMUTE");
    expect(schema?.jobLocation).toBeUndefined();
    expect(countries.map((country) => country.name)).toEqual(expect.arrayContaining(["Germany", "France", "Netherlands", "Portugal"]));
  });

  it("maps a hybrid San Francisco role to jobLocation only", () => {
    const schema = buildJobPosting(
      make({
        location: { text: "Hybrid - San Francisco, California", workplace: "hybrid" },
        salary: { min: 175000, max: 225000, currency: "USD", unit: "YEAR", note: "Employer-posted range" },
      }),
    );
    expect(schema?.jobLocationType).toBeUndefined();
    const location = schema?.jobLocation as { address: { addressCountry: string; addressLocality: string } };
    expect(location.address.addressCountry).toBe("US");
    expect(location.address.addressLocality).toBe("San Francisco");
    const salary = schema?.baseSalary as { currency: string; value: { unitText: string; minValue: number; maxValue: number } };
    expect(salary.currency).toBe("USD");
    expect(salary.value.unitText).toBe("YEAR");
    expect(salary.value.minValue).toBe(175000);
    expect(salary.value.maxValue).toBe(225000);
  });

  it("omits salary markup when the employer did not post a base range", () => {
    const schema = buildJobPosting(make({ salary: null }));
    expect(schema?.baseSalary).toBeUndefined();
  });

  it("drops JobPosting markup once the role is expired", () => {
    const job: Job = { ...make({}), status: "expired", expiredAt: "2026-10-01T00:00:00.000Z" };
    expect(buildJobPosting(job, new Date("2026-10-15T00:00:00.000Z"))).toBeNull();
  });

  it("omits markup when the description is too thin to be the real posting", () => {
    const job = make({ descriptionHtml: "<p>Short.</p>" });
    expect(buildJobPosting(job)).toBeNull();
  });

  it("includes hiringOrganization name, sameAs, and a square logo", () => {
    const schema = buildJobPosting(make({}));
    const org = schema?.hiringOrganization as { name: string; sameAs: string; logo: string };
    expect(org.name).toBe("Vercel");
    expect(org.sameAs).toBe("https://vercel.com");
    expect(org.logo).toMatch(/\/logo\/vercel$/);
  });
});
