import { notFound } from "next/navigation";
import { Listing } from "@/components/listing";
import { roleBySlug, ROLES } from "@/lib/catalog";
import { filterJobs, listingIntro, listingRobots, updatedLabel } from "@/lib/query";
import { pageMeta } from "@/lib/seo";
import { getAllJobs } from "@/lib/store";

export function generateStaticParams() {
  return ROLES.map((role) => ({ slug: role.slug }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const role = roleBySlug(slug);
  if (!role) return {};
  const search = await searchParams;
  const jobs = filterJobs(await getAllJobs(), { title: role.slug });
  const page = Number(search.page || 1) || 1;
  const robots = listingRobots(jobs.length, `/roles/${slug}`, { page, filtered: Boolean(search.q) });
  return pageMeta({
    title: role.title,
    description: role.description,
    path: `/roles/${slug}`,
    index: robots.index,
    canonicalPath: robots.canonicalPath,
    page,
  });
}

export default async function RolePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const role = roleBySlug(slug);
  if (!role) notFound();
  const search = await searchParams;
  const jobs = filterJobs(await getAllJobs(), { title: role.slug });
  const page = Number(search.page || 1) || 1;
  return (
    <Listing
      h1={role.h1}
      path={`/roles/${slug}`}
      jobs={jobs}
      page={page}
      crumbs={[
        { name: "Jobs", path: "/" },
        { name: role.h1, path: `/roles/${slug}` },
      ]}
      intro={listingIntro({
        subject: role.h1,
        jobs,
        qualifier: role.description,
        updated: updatedLabel(jobs),
      })}
      related={[
        { href: `/roles/${slug}/remote`, label: `Remote ${role.label.toLowerCase()} jobs` },
        { href: `/salary/${slug === "design-engineer" ? "" : slug}`.replace(/\/$/, "") || "/salary", label: `${role.label} salary` },
        ...(slug === "design-technologist"
          ? [{ href: "/guides/design-technologist", label: "What is a design technologist?" }]
          : []),
        ...(slug === "ux-engineer"
          ? [{ href: "/guides/ux-engineer", label: "What is a UX engineer?" }]
          : []),
        ...(slug === "design-systems-engineer"
          ? [{ href: "/guides/design-systems-engineer", label: "What is a design systems engineer?" }]
          : []),
        ...(slug === "design-engineer"
          ? [{ href: "/guides/how-to-become-a-design-engineer", label: "How to become a design engineer" }]
          : []),
        ...(slug === "ux-engineer" || slug === "creative-technologist" || slug === "prototyper"
          ? [{
              href: "/guides/design-technologist#how-does-a-design-technologist-compare-with-nearby-titles",
              label: "Design technologist vs nearby titles",
            }]
          : []),
        { href: "/remote", label: "Remote design engineer jobs" },
        { href: "/skills/framer", label: "Framer jobs" },
      ]}
      alertTitle={role.slug}
    />
  );
}
