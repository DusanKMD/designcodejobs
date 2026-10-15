import { Listing } from "@/components/listing";
import { REGIONS } from "@/lib/catalog";
import { filterJobs, listingIntro, listingRobots, updatedLabel } from "@/lib/query";
import { pageMeta } from "@/lib/seo";
import { getAllJobs } from "@/lib/store";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const search = await searchParams;
  const jobs = filterJobs(await getAllJobs(), { remote: true });
  const page = Number(search.page || 1) || 1;
  const robots = listingRobots(jobs.length, "/remote", { page, filtered: Boolean(search.q) });
  return pageMeta({
    title: "Remote design engineer jobs",
    description:
      "Remote design engineer jobs in software. Fully remote UX, UI, design systems, and creative technologist roles, with salary when the employer posts it.",
    path: "/remote",
    index: robots.index,
    canonicalPath: robots.canonicalPath,
    page,
  });
}

export default async function RemotePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const search = await searchParams;
  const jobs = filterJobs(await getAllJobs(), { remote: true });
  const page = Number(search.page || 1) || 1;
  return (
    <Listing
      h1="Remote design engineer jobs"
      path="/remote"
      jobs={jobs}
      page={page}
      crumbs={[
        { name: "Jobs", path: "/" },
        { name: "Remote design engineer jobs", path: "/remote" },
      ]}
      intro={listingIntro({
        subject: "Remote design engineer jobs",
        jobs,
        qualifier:
          "Every role on this page is fully remote software work. Hybrid listings, including ones that mention a city office, are excluded so the page matches a remote search.",
        updated: updatedLabel(jobs),
      })}
      related={[
        ...REGIONS.map((region) => ({ href: `/remote/${region.slug}`, label: region.h1 })),
        { href: "/roles/ux-engineer", label: "UX engineer jobs" },
        { href: "/salary", label: "Design engineer salary" },
      ]}
    />
  );
}
