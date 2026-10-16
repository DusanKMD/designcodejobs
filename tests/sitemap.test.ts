import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import { GET as pagesSitemap } from "@/app/sitemap-pages.xml/route";
import { GET as sitemapIndex } from "@/app/sitemap.xml/route";
import { GET as jobsSitemap } from "@/app/sitemap-jobs.xml/route";
import { isListed } from "@/lib/model";
import { indexablePagePaths } from "@/lib/sitemap-data";
import { absoluteUrl } from "@/lib/site";
import { getAllJobs } from "@/lib/store";

function locs(xml: string) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
}

describe("sitemap", () => {
  it("lists every indexable page and job on the apex, and robots points at the index", async () => {
    const paths = await indexablePagePaths();
    const pages = locs(await (await pagesSitemap()).text());
    const jobs = locs(await (await jobsSitemap()).text());
    const index = locs(await (await sitemapIndex()).text());
    const listed = (await getAllJobs()).filter((job) => isListed(job));

    expect(robots().sitemap).toBe("https://designcodejobs.com/sitemap.xml");
    expect(index).toEqual([
      "https://designcodejobs.com/sitemap-pages.xml",
      "https://designcodejobs.com/sitemap-jobs.xml",
    ]);
    expect(pages).toEqual(paths.map((path) => absoluteUrl(path)));
    expect(jobs).toHaveLength(listed.length);
    expect(pages).toEqual(expect.arrayContaining([
      "https://designcodejobs.com",
      "https://designcodejobs.com/salary",
      "https://designcodejobs.com/tools",
      "https://designcodejobs.com/tools/design-engineer-salary-calculator",
      "https://designcodejobs.com/tools/design-engineer-resume-checker",
      "https://designcodejobs.com/tools/design-engineer-portfolio-checklist",
      "https://designcodejobs.com/tools/job-description-generator",
      "https://designcodejobs.com/salary/ux-engineer",
      "https://designcodejobs.com/about",
      "https://designcodejobs.com/post-a-job",
      "https://designcodejobs.com/companies",
      "https://designcodejobs.com/guides",
      "https://designcodejobs.com/guides/what-is-a-design-engineer",
      "https://designcodejobs.com/guides/design-engineer-salary",
      "https://designcodejobs.com/guides/design-engineer-job-description",
      "https://designcodejobs.com/remote",
      "https://designcodejobs.com/roles/design-engineer",
    ]));
    expect(pages).not.toContain("https://designcodejobs.com/roles/ux-engineer");
    expect(pages).not.toContain("https://designcodejobs.com/skills/framer");
    expect(pages).not.toContain("https://designcodejobs.com/seniority/internship");
    for (const url of [...pages, ...jobs, ...index]) {
      expect(url.startsWith("https://designcodejobs.com")).toBe(true);
      expect(url.includes("www.")).toBe(false);
      expect(url.includes("railway.app")).toBe(false);
      expect(url.endsWith("/")).toBe(false);
    }
  });
});
