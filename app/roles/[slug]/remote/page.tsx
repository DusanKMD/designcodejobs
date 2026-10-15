import { notFound } from "next/navigation";
import { Listing } from "@/components/listing";
import { roleBySlug, ROLES } from "@/lib/catalog";
import { filterJobs, listingIntro, listingRobots, pageParam, updatedLabel } from "@/lib/query";
import { pageMeta, remoteRoleDescription, remoteRoleTitle } from "@/lib/seo";
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
  const page = pageParam(await searchParams);
  const role = roleBySlug(slug);
  if (!role) return {};
  const jobs = filterJobs(await getAllJobs(), { title: role.slug, remote: true });
  const robots = listingRobots(jobs.length, `/roles/${slug}/remote`, { page });
  const title = remoteRoleTitle(role.h1);
  return pageMeta({
    title,
    description: remoteRoleDescription(role.label),
    path: `/roles/${slug}/remote`,
    index: robots.index,
    canonicalPath: robots.canonicalPath,
    page,
  });
}

export default async function RemoteRolePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const page = pageParam(await searchParams);
  const role = roleBySlug(slug);
  if (!role) notFound();
  const jobs = filterJobs(await getAllJobs(), { title: role.slug, remote: true });
  const h1 = remoteRoleTitle(role.h1);
  return (
    <Listing
      h1={h1}
      path={`/roles/${slug}/remote`}
      jobs={jobs}
      page={page}
      crumbs={[
        { name: "Jobs", path: "/" },
        { name: role.h1, path: `/roles/${slug}` },
        { name: "Remote", path: `/roles/${slug}/remote` },
      ]}
      intro={listingIntro({
        subject: h1,
        jobs,
        qualifier: `Only roles marked fully remote. A hybrid ${role.label.toLowerCase()} role stays on the main page.`,
        updated: updatedLabel(jobs),
      })}
      related={[
        { href: `/roles/${slug}`, label: role.h1 },
        { href: "/remote", label: "Remote design engineer jobs" },
      ]}
      alertTitle={role.slug}
    />
  );
}
