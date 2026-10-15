import { notFound } from "next/navigation";
import { Listing } from "@/components/listing";
import { REGIONS } from "@/lib/catalog";
import { filterJobs, listingIntro, listingRobots, pageParam, updatedLabel } from "@/lib/query";
import { pageMeta } from "@/lib/seo";
import { getAllJobs } from "@/lib/store";
import type { RegionSlug } from "@/lib/types";

export function generateStaticParams() {
  return REGIONS.map((region) => ({ region: region.slug }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ region: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { region: slug } = await params;
  const page = pageParam(await searchParams);
  const region = REGIONS.find((item) => item.slug === slug);
  if (!region) return {};
  const jobs = filterJobs(await getAllJobs(), { remote: true, region: region.slug });
  const robots = listingRobots(jobs.length, `/remote/${slug}`, { page });
  const place =
    region.slug === "worldwide" ? "any country the employer accepts" : region.slug === "us" || region.slug === "uk" ? `the ${region.label}` : region.label;
  return pageMeta({
    title: region.title,
    description: `${region.h1}. Fully remote software roles open to applicants in ${place}. Hybrid weeks are not included.`,
    path: `/remote/${slug}`,
    index: robots.index,
    canonicalPath: robots.canonicalPath,
    page,
  });
}

export default async function RemoteRegionPage({
  params,
  searchParams,
}: {
  params: Promise<{ region: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { region: slug } = await params;
  const page = pageParam(await searchParams);
  const region = REGIONS.find((item) => item.slug === slug);
  if (!region) notFound();
  const jobs = filterJobs(await getAllJobs(), { remote: true, region: region.slug as RegionSlug });
  return (
    <Listing
      h1={region.h1}
      path={`/remote/${slug}`}
      jobs={jobs}
      page={page}
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
