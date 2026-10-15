import { notFound } from "next/navigation";
import { Listing } from "@/components/listing";
import { REGIONS } from "@/lib/catalog";
import { filterJobs, listingIntro, listingRobots, updatedLabel } from "@/lib/query";
import { pageMeta } from "@/lib/seo";
import { getAllJobs } from "@/lib/store";
import type { RegionSlug } from "@/lib/types";

export function generateStaticParams() {
  return REGIONS.map((region) => ({ region: region.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }) {
  const { region: slug } = await params;
  const region = REGIONS.find((item) => item.slug === slug);
  if (!region) return {};
  const jobs = filterJobs(await getAllJobs(), { remote: true, region: region.slug });
  const robots = listingRobots(jobs.length, `/remote/${slug}`, {});
  return pageMeta({
    title: region.title,
    description: `${region.h1}. Fully remote software design roles open to applicants in ${region.label}.`,
    path: `/remote/${slug}`,
    index: robots.index,
    canonicalPath: robots.canonicalPath,
  });
}

export default async function RemoteRegionPage({ params }: { params: Promise<{ region: string }> }) {
  const { region: slug } = await params;
  const region = REGIONS.find((item) => item.slug === slug);
  if (!region) notFound();
  const jobs = filterJobs(await getAllJobs(), { remote: true, region: region.slug as RegionSlug });
  return (
    <Listing
      h1={region.h1}
      path={`/remote/${slug}`}
      jobs={jobs}
      crumbs={[
        { name: "Jobs", path: "/" },
        { name: "Remote", path: "/remote" },
        { name: region.label, path: `/remote/${slug}` },
      ]}
      intro={listingIntro({
        subject: region.h1,
        jobs,
        qualifier: `Applicants are limited to ${region.label}. These are software design roles, not mechanical or hardware openings in the same geography.`,
        updated: updatedLabel(jobs),
      })}
      related={[
        { href: "/remote", label: "Remote design engineer jobs" },
        { href: "/roles/ux-engineer", label: "UX engineer jobs" },
      ]}
    />
  );
}
