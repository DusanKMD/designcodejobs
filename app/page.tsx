import Link from "next/link";
import { Listing } from "@/components/listing";
import { JsonLd } from "@/components/json-ld";
import { ROLES } from "@/lib/catalog";
import { websiteLd } from "@/lib/jsonld";
import { filterJobs, listingIntro, listingRobots, updatedLabel } from "@/lib/query";
import { pageMeta } from "@/lib/seo";
import { getAllJobs } from "@/lib/store";

const LINKS = [
  ...ROLES.filter((role) => role.priority).map((role) => ({ href: `/roles/${role.slug}`, label: role.h1 })),
  { href: "/remote", label: "Remote design engineer jobs" },
  { href: "/seniority/internship", label: "Design engineer internship" },
  { href: "/skills/framer", label: "Framer jobs" },
  { href: "/salary", label: "Design engineer salary" },
];

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const search = await searchParams;
  const jobs = filterJobs(await getAllJobs(), { q: typeof search.q === "string" ? search.q : undefined });
  const page = Number(search.page || 1) || 1;
  const robots = listingRobots(jobs.length, "/", { page, filtered: Boolean(search.q || search.seniority) });
  return pageMeta({
    title: "Design engineer jobs",
    description:
      "Design engineer jobs for designers who code. Open software roles — UX engineers, UI engineers, design technologists, and creative technologists — with the full description hosted here.",
    path: "/",
    index: robots.index,
    canonicalPath: robots.canonicalPath,
  });
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const search = await searchParams;
  const q = typeof search.q === "string" ? search.q : undefined;
  const jobs = filterJobs(await getAllJobs(), { q });
  const page = Number(search.page || 1) || 1;
  const saved = search.alert === "saved";

  return (
    <>
      <JsonLd data={websiteLd()} />
      <Listing
        h1="Design engineer jobs"
        path="/"
        jobs={jobs}
        page={page}
        query={q ? `q=${encodeURIComponent(q)}` : undefined}
        crumbs={[{ name: "Design engineer jobs", path: "/" }]}
        intro={listingIntro({
          subject: "Design engineer jobs",
          jobs,
          qualifier:
            "These are software roles for designers who code: product UI, brand and web, and design systems. That phrase also means mechanical and hardware work elsewhere, so this list stays on interface, prototyping, and frontend engineering.",
          updated: updatedLabel(jobs),
        })}
        related={LINKS}
      >
        <ul className="mt-6 flex gap-2 overflow-x-auto pb-1 text-sm">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="inline-flex whitespace-nowrap rounded-full border border-line px-3 py-1 hover:bg-chip">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <form action="/" className="mt-4 flex max-w-md gap-2">
          <input name="q" defaultValue={q} placeholder="Search titles and companies" className="h-10 flex-1 rounded-full border border-line bg-bg px-4 text-sm" />
          <button className="h-10 rounded-full border border-line px-4 text-sm" type="submit">Search</button>
        </form>
        {saved ? <p className="mt-3 text-sm text-muted">Alert saved. Nothing is emailed yet.</p> : null}
      </Listing>
    </>
  );
}
