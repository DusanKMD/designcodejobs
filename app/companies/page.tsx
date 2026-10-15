import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { loadCompanies } from "@/lib/companies";
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
  const slugs = [...new Set(open.map((job) => job.companySlug))].sort();
  const known = new Map(loadCompanies().map((company) => [company.slug, company]));
  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <JsonLd data={breadcrumbLd([{ name: "Jobs", path: "/" }, { name: "Companies", path: "/companies" }])} />
      <p className="text-sm text-muted"><Link href="/" className="hover:text-fg">Jobs</Link> / Companies</p>
      <h1 className="mt-4 text-4xl text-balance sm:text-5xl">Companies hiring design engineers</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-fg">
        Companies hiring design engineers are the product teams with an open software role on this board. Hardware and mechanical employers are left off.
      </p>
      <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted">
        {slugs.length} companies have an open software design role. The board watches {loadCompanies().length} public Greenhouse, Lever, and Ashby career sites and keeps only the roles that match this field.
      </p>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {slugs.map((slug) => {
          const stats = companyStats(jobs, slug);
          const name = known.get(slug)?.name || stats.open[0]?.companyName || slug;
          return (
            <li key={slug}>
              <Link href={`/companies/${slug}`} className="flex items-baseline justify-between py-3 hover:bg-chip">
                <span className="font-medium">{name}</span>
                <span className="text-sm text-muted">{stats.open.length} open</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
