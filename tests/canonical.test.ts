import { afterEach, describe, expect, it } from "vitest";
import { absoluteUrl, canonicalTarget, publicHostFrom, shouldCanonicalRedirect, siteUrl } from "@/lib/site";

describe("canonical host", () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    if (previous == null) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previous;
  });

  it("redirects www and railway hosts, and keeps the apex", () => {
    expect(shouldCanonicalRedirect("www.designcodejobs.com")).toBe(true);
    expect(shouldCanonicalRedirect("WWW.designcodejobs.com:443")).toBe(true);
    expect(shouldCanonicalRedirect("designcodejobs-production.up.railway.app")).toBe(true);
    expect(shouldCanonicalRedirect("designcodejobs.com")).toBe(false);
    expect(shouldCanonicalRedirect("localhost:3000")).toBe(false);
  });

  it("preserves path and query and drops the trailing slash", () => {
    expect(canonicalTarget("/salary/", "?page=2")).toBe("https://designcodejobs.com/salary?page=2");
    expect(canonicalTarget("/", "")).toBe("https://designcodejobs.com");
    expect(canonicalTarget("/jobs/acme-design-engineer-abc", "?utm=1")).toBe(
      "https://designcodejobs.com/jobs/acme-design-engineer-abc?utm=1",
    );
  });

  it("reads the public host from x-forwarded-host first", () => {
    const headers = new Headers({
      "x-forwarded-host": "www.designcodejobs.com",
      host: "internal.railway.internal",
    });
    expect(publicHostFrom(headers)).toBe("www.designcodejobs.com");
  });

  it("forces sitemap and JSON-LD origins onto https://designcodejobs.com", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://app.up.railway.app/";
    expect(siteUrl()).toBe("https://designcodejobs.com");
    expect(absoluteUrl("/")).toBe("https://designcodejobs.com");
    expect(absoluteUrl("/salary/")).toBe("https://designcodejobs.com/salary");
    expect(absoluteUrl("https://www.designcodejobs.com/remote/")).toBe("https://designcodejobs.com/remote");
  });

  it("keeps localhost origins for local requests", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000/";
    expect(siteUrl()).toBe("http://localhost:3000");
    expect(absoluteUrl("/salary")).toBe("http://localhost:3000/salary");
  });
});
