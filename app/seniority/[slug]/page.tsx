import { notFound } from "next/navigation";
import { Listing } from "@/components/listing";
import { seniorityBySlug, SENIORITIES } from "@/lib/catalog";
import { filterJobs, listingIntro, listingRobots, pageParam, updatedLabel } from "@/lib/query";
import { pageMeta } from "@/lib/seo";
import { getAllJobs } from "@/lib/store";

export function generateStaticParams() {
  return SENIORITIES.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const page = pageParam(await searchParams);
  const level = seniorityBySlug(slug);
  if (!level) return {};
  const jobs = filterJobs(await getAllJobs(), { seniority: level.slug });
  const robots = listingRobots(jobs.length, `/seniority/${slug}`, { page });
  return pageMeta({
    title: level.title,
    description: level.description,
    path: `/seniority/${slug}`,
    index: robots.index,
    canonicalPath: robots.canonicalPath,
    page,
  });
}

export default async function SeniorityPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const page = pageParam(await searchParams);
  const level = seniorityBySlug(slug);
  if (!level) notFound();
  const jobs = filterJobs(await getAllJobs(), { seniority: level.slug });
  return (
    <Listing
      h1={level.h1}
      path={`/seniority/${slug}`}
      jobs={jobs}
      page={page}
      crumbs={[
        { name: "Jobs", path: "/" },
        { name: level.h1, path: `/seniority/${slug}` },
      ]}
      intro={listingIntro({
        subject: level.h1,
        jobs,
        qualifier: level.description,
        updated: updatedLabel(jobs),
      })}
      related={[
        { href: "/remote", label: "Remote design engineer jobs" },
        { href: "/salary", label: "Design engineer salary" },
        { href: "/roles/ux-engineer", label: "UX engineer jobs" },
        ...(slug === "junior" || slug === "internship"
          ? [{ href: "/guides/how-to-become-a-design-engineer", label: "How to become a design engineer" }]
          : []),
      ]}
    />
  );
}
