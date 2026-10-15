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
        { href: "/remote", label: "Remote design engineer jobs" },
        { href: "/skills/framer", label: "Framer jobs" },
      ]}
      alertTitle={role.slug}
    />
  );
}
