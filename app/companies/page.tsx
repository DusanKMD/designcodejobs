import Link from "next/link";
import { CompanyLogo } from "@/components/company-logo";
import { ArrowRight } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { EmployerBand, StatStrip } from "@/components/ui";
import { loadCompanies } from "@/lib/companies";
import { formatSalaryShort } from "@/lib/format";
import { breadcrumbLd } from "@/lib/jsonld";
import { companyStats, listedJobs } from "@/lib/query";
import { pageMeta } from "@/lib/seo";
import { getAllJobs } from "@/lib/store";

export const metadata = pageMeta({
  title: "Companies hiring design engineers",
  description: "Companies hiring design engineers, the product teams with an open software role. Hardware and mechanical employers are left off.",
  path: "/companies",
  index: true,
});

export default async function CompaniesPage() {
  const jobs = await getAllJobs();
  const open = listedJobs(jobs);
  const slugs = [...new Set(open.map((job) => job.companySlug))];
  const known = new Map(loadCompanies().map((company) => [company.slug, company]));
  const rows = slugs
    .map((slug) => {
      const stats = companyStats(jobs, slug);
      const first = stats.open[0];
      const paid = stats.open.find((job) => job.salaryUnit === "YEAR" && job.salaryMin != null);
      return {
        slug,
        name: known.get(slug)?.name || first?.companyName || slug,
        domain: first?.companyDomain,
        open: stats.open.length,
        remote: stats.open.filter((job) => job.workplace === "remote").length,
        titles: [...new Set(stats.open.map((job) => job.title))].slice(0, 2),
        salary: paid ? formatSalaryShort(paid) : null,
      };
    })
    .sort((a, b) => b.open - a.open || a.name.localeCompare(b.name));
  const remoteFriendly = rows.filter((row) => row.remote > 0).length;
  const withPay = rows.filter((row) => row.salary).length;
  const watched = loadCompanies().length;

  return (
    <div>
      <JsonLd data={breadcrumbLd([{ name: "Jobs", path: "/" }, { name: "Companies", path: "/companies" }])} />
      <PageHeader
        crumbs={[{ name: "Jobs", path: "/" }, { name: "Companies", path: "/companies" }]}
        kicker="Companies"
        title="Companies hiring design engineers"
        lede="Companies hiring design engineers are the product teams with an open software role on this board. Hardware and mechanical employers are left off."
      >
        <div className="mt-8 max-w-3xl">
          <StatStrip
            stats={[
              { label: "Hiring now", value: String(rows.length) },
              { label: "Open roles", value: String(open.length) },
              { label: "Hire remotely", value: String(remoteFriendly) },
              { label: "Publish salary", value: String(withPay) },
            ]}
          />
        </div>
      </PageHeader>

      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="mt-10 grid gap-6 text-[15px] leading-7 text-fg-2 lg:grid-cols-2 lg:gap-12">
          <p>
            {rows.length} companies have an open software design role. The board watches {watched} public Greenhouse, Lever, and Ashby career sites and keeps only the roles that match this field: design engineers, UX engineers, UI engineers, design technologists, creative technologists, and design systems engineers.
          </p>
          <p>
            {remoteFriendly} of them have at least one fully remote role, and {withPay} publish a yearly salary range on at least one posting. A company drops off this page when its last matching role closes, and its page stays up with the roles it posted before.
          </p>
        </div>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <li key={row.slug}>
              <Link href={`/companies/${row.slug}`} className="job-card group flex h-full flex-col p-5">
                <span className="flex items-center gap-3">
                  <CompanyLogo name={row.name} domain={row.domain} size={40} className="job-logo" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold tracking-tight text-fg">{row.name}</span>
                    <span className="block text-[13px] text-muted">
                      {row.open} open {row.open === 1 ? "role" : "roles"}
                      {row.remote ? ` · ${row.remote} remote` : ""}
                    </span>
                  </span>
                  <ArrowRight className="arrow text-subtle" />
                </span>
                <span className="mt-4 flex-1 text-[13px] leading-5 text-fg-2">{row.titles.join(" · ")}</span>
                {row.salary ? <span className="chip chip-salary tabular mt-4 self-start">{row.salary}</span> : null}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-20">
          <EmployerBand />
        </div>
      </div>
    </div>
  );
}
