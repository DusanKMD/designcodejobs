import { notFound } from "next/navigation";
import { Listing } from "@/components/listing";
import { roleBySlug, ROLES } from "@/lib/catalog";
import { filterJobs, listingIntro, listingRobots, updatedLabel } from "@/lib/query";
import { pageMeta } from "@/lib/seo";
import { getAllJobs } from "@/lib/store";

export function generateStaticParams() {
  return ROLES.map((role) => ({ slug: role.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const role = roleBySlug(slug);
  if (!role) return {};
  const jobs = filterJobs(await getAllJobs(), { title: role.slug, remote: true });
  const robots = listingRobots(jobs.length, `/roles/${slug}/remote`, {});
  const title = `Remote ${role.h1.charAt(0).toLowerCase()}${role.h1.slice(1)}`;
  return pageMeta({
    title,
    description: `Remote ${role.label.toLowerCase()} jobs. Fully remote software roles only — hybrid weeks are listed on the main ${role.label.toLowerCase()} page.`,
    path: `/roles/${slug}/remote`,
    index: robots.index,
    canonicalPath: robots.canonicalPath,
  });
}

export default async function RemoteRolePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const role = roleBySlug(slug);
  if (!role) notFound();
  const jobs = filterJobs(await getAllJobs(), { title: role.slug, remote: true });
  const h1 = `Remote ${role.h1.charAt(0).toLowerCase()}${role.h1.slice(1)}`;
  return (
    <Listing
      h1={h1}
      path={`/roles/${slug}/remote`}
      jobs={jobs}
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
