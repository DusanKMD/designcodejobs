import { notFound } from "next/navigation";
import { Listing } from "@/components/listing";
import { getCompany } from "@/lib/companies";
import { companyStats, listingIntro, listingRobots, updatedLabel } from "@/lib/query";
import { pageMeta } from "@/lib/seo";
import { getAllJobs } from "@/lib/store";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const jobs = await getAllJobs();
  const stats = companyStats(jobs, slug);
  const company = getCompany(slug);
  const name = company?.name || stats.open[0]?.companyName;
  if (!name) return {};
  const robots = listingRobots(stats.open.length, `/companies/${slug}`, { company: true });
  return pageMeta({
    title: `${name} design engineer jobs`,
    description: `Open design engineer and UX engineer roles at ${name}, plus how many past roles this board has seen.`,
    path: `/companies/${slug}`,
    index: robots.index,
    canonicalPath: robots.canonicalPath,
  });
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const jobs = await getAllJobs();
  const stats = companyStats(jobs, slug);
  const company = getCompany(slug);
  const name = company?.name || stats.open[0]?.companyName || stats.all[0]?.companyName;
  if (!name) notFound();
  const salaries = stats.all.filter((job) => job.salaryMin != null);
  return (
    <Listing
      h1={`${name} design engineer jobs`}
      path={`/companies/${slug}`}
      jobs={stats.open}
      crumbs={[
        { name: "Companies", path: "/companies" },
        { name, path: `/companies/${slug}` },
      ]}
      intro={listingIntro({
        subject: `${name} design engineer jobs`,
        jobs: stats.open,
        qualifier: `${name} has ${stats.open.length} open software design ${stats.open.length === 1 ? "role" : "roles"} and ${stats.past} past ${stats.past === 1 ? "role" : "roles"} still on record. ${salaries.length ? `${salaries.length} of those postings included a salary range.` : "No salary range is on file for this company yet."} ${company ? `Roles are read from the public ${company.boards.map((board) => board.ats).join(" and ")} board.` : "This company posted directly."}`,
        updated: updatedLabel(stats.open.length ? stats.open : stats.all),
      })}
      related={[
        { href: "/roles/ux-engineer", label: "UX engineer jobs" },
        { href: "/salary", label: "Design engineer salary" },
        { href: "/remote", label: "Remote design engineer jobs" },
      ]}
    />
  );
}
