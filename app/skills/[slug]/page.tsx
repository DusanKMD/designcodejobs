import { notFound } from "next/navigation";
import { Listing } from "@/components/listing";
import { skillBySlug, SKILLS } from "@/lib/catalog";
import { filterJobs, listingIntro, listingRobots, pageParam, updatedLabel } from "@/lib/query";
import { pageMeta } from "@/lib/seo";
import { getAllJobs } from "@/lib/store";

export function generateStaticParams() {
  return SKILLS.map((skill) => ({ slug: skill.slug }));
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
  const skill = skillBySlug(slug);
  if (!skill) return {};
  const jobs = filterJobs(await getAllJobs(), { skill: skill.slug });
  const robots = listingRobots(jobs.length, `/skills/${slug}`, { page });
  return pageMeta({
    title: skill.title,
    description: skill.description,
    path: `/skills/${slug}`,
    index: robots.index,
    canonicalPath: robots.canonicalPath,
    page,
  });
}

export default async function SkillPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const page = pageParam(await searchParams);
  const skill = skillBySlug(slug);
  if (!skill) notFound();
  const jobs = filterJobs(await getAllJobs(), { skill: skill.slug });
  return (
    <Listing
      h1={skill.h1}
      path={`/skills/${slug}`}
      jobs={jobs}
      page={page}
      crumbs={[
        { name: "Jobs", path: "/" },
        { name: skill.h1, path: `/skills/${slug}` },
      ]}
      intro={listingIntro({
        subject: skill.h1,
        jobs,
        qualifier: skill.description,
        updated: updatedLabel(jobs),
      })}
      related={[
        { href: "/roles/design-engineer", label: "Software design engineer jobs" },
        { href: "/roles/creative-technologist", label: "Creative technologist jobs" },
        { href: "/salary", label: "Design engineer salary" },
      ]}
    />
  );
}
