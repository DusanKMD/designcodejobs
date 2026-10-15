import { GUIDES, ROLES, SALARY_ROLES } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
import { filterJobs, medianSalary } from "@/lib/query";
import { absoluteUrl, FEATURED_ADDON_USD, LISTING_DAYS, SITE_NAME, STANDARD_PRICE_USD } from "@/lib/site";
import { getAllJobs } from "@/lib/store";

export const revalidate = 3600;

/**
 * llms.txt (https://llmstxt.org): a plain summary for answer engines and AI assistants,
 * with live counts so a quoted figure matches the site.
 */
export async function GET() {
  const open = filterJobs(await getAllJobs(), {});
  const companies = new Set(open.map((job) => job.companyName));
  const remote = open.filter((job) => job.workplace === "remote").length;
  const salary = medianSalary(open);
  const roleCounts = ROLES.map((role) => ({ role, count: filterJobs(open, { title: role.slug }).length }));

  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_NAME} (designcodejobs.com) is a job board for design engineers: software designers who code. It lists design engineer, UX engineer, UI engineer, design technologist, creative technologist, and design systems engineer roles at product companies. Mechanical, hardware, chip, and audiovisual "design engineer" jobs are filtered out.`,
    "",
    "Key facts:",
    `- ${open.length} open roles at ${companies.size} companies right now; ${open.length ? Math.round((remote / open.length) * 100) : 0}% are fully remote.`,
    salary
      ? `- Median employer-posted salary midpoint: ${formatMoney(salary.value, salary.currency)} a year (${salary.currency}, ${salary.count} postings with a published yearly base range). Salary is shown only when the employer published it; nothing is estimated or converted.`
      : "- Salary is shown only when the employer published it; nothing is estimated or converted.",
    "- Roles are read from public Greenhouse, Lever, and Ashby boards, plus paid posts. Each role has its own page with the full description; active roles with a mappable location carry JobPosting structured data. Applications happen on the employer's original posting.",
    `- Employers can post a role for $${STANDARD_PRICE_USD} for ${LISTING_DAYS} days (one-time, no subscription). Featured placement is $${FEATURED_ADDON_USD} more. Listings go live within about a minute of payment.`,
    "",
    "## Jobs",
    `- [Design engineer jobs](${absoluteUrl("/")}): all open software design engineering roles, newest first`,
    `- [Remote design engineer jobs](${absoluteUrl("/remote")}): fully remote roles only (hybrid excluded)`,
    ...roleCounts.map(({ role, count }) => `- [${role.h1}](${absoluteUrl(`/roles/${role.slug}`)}): ${count} open`),
    `- [Companies hiring design engineers](${absoluteUrl("/companies")})`,
    "",
    "## Salary data",
    `- [Design engineer salary](${absoluteUrl("/salary")}): employer-posted yearly base ranges for software design roles`,
    ...SALARY_ROLES.map((role) => `- [${role.h1}](${absoluteUrl(`/salary/${role.slug}`)})`),
    "",
    "## Guides",
    ...GUIDES.map((guide) => `- [${guide.h1}](${absoluteUrl(`/guides/${guide.slug}`)}): ${guide.description}`),
    "",
    "## For employers",
    `- [Post a design engineer job](${absoluteUrl("/post-a-job")}): pricing, what is included, and the posting form`,
    "",
    "## Optional",
    `- [About](${absoluteUrl("/about")})`,
    `- [RSS feed of new roles](${absoluteUrl("/feed.xml")})`,
    `- [JSON feed of open roles](${absoluteUrl("/api/jobs")})`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
