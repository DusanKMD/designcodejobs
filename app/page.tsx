import Link from "next/link";
import { Listing } from "@/components/listing";
import { JsonLd } from "@/components/json-ld";
import { ROLES } from "@/lib/catalog";
import { websiteLd } from "@/lib/jsonld";
import { filterJobs, listingIntro, listingRobots, updatedLabel } from "@/lib/query";
import { pageMeta } from "@/lib/seo";
import { getAllJobs } from "@/lib/store";
import type { Workplace } from "@/lib/types";

const LINKS = [
  ...ROLES.filter((role) => role.priority).map((role) => ({ href: `/roles/${role.slug}`, label: role.h1 })),
  { href: "/remote", label: "Remote design engineer jobs" },
  { href: "/seniority/internship", label: "Design engineer internship" },
  { href: "/skills/framer", label: "Framer jobs" },
  { href: "/salary", label: "Design engineer salary" },
];

function workplaceParam(value: string | string[] | undefined): Workplace | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "remote" || raw === "hybrid" || raw === "onsite") return raw;
  return undefined;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const search = await searchParams;
  const q = typeof search.q === "string" ? search.q : undefined;
  const workplace = workplaceParam(search.workplace);
  let jobs = filterJobs(await getAllJobs(), { q });
  if (workplace) jobs = jobs.filter((job) => job.workplace === workplace);
  const page = Number(search.page || 1) || 1;
  const robots = listingRobots(jobs.length, "/", { page, filtered: Boolean(q || search.seniority || workplace) });
  return pageMeta({
    title: "Design engineer jobs — Design Code Jobs",
    description:
      "Design engineer jobs for designers who code. UX engineer, UI engineer, and design technologist roles, with the description hosted here.",
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
  const workplace = workplaceParam(search.workplace);
  const all = await getAllJobs();
  const open = filterJobs(all, {});
  let jobs = filterJobs(all, { q });
  if (workplace) jobs = jobs.filter((job) => job.workplace === workplace);
  const page = Number(search.page || 1) || 1;
  const saved = search.alert === "saved";
  const invalid = search.alert === "invalid";
  const featured = jobs.filter((job) => job.featured);
  const rest = featured.length ? jobs.filter((job) => !job.featured) : jobs;
  const companies = [...new Map(open.map((job) => [job.companySlug, job.companyName])).entries()]
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (workplace) params.set("workplace", workplace);

  return (
    <>
      <JsonLd data={websiteLd()} />
      <Listing
        hero
        h1="Design engineer jobs"
        value="Design engineer jobs are open software roles for designers who code. The description stays on this site. You apply on the employer’s original posting."
        path="/"
        jobs={rest}
        featuredJobs={featured}
        openCount={open.length}
        companies={companies}
        page={page}
        query={params.toString() || undefined}
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
              <Link href={link.href} className="inline-flex whitespace-nowrap rounded-md border border-line bg-bg/80 px-3 py-1 hover:bg-chip">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <form action="/" className="mt-4 grid max-w-2xl gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div>
            <label htmlFor="q" className="text-sm font-medium">Search</label>
            <input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Titles and companies"
              className="mt-1 h-11 w-full rounded-md border border-line bg-bg px-4 text-sm"
            />
          </div>
          <div>
            <label htmlFor="workplace" className="text-sm font-medium">Workplace</label>
            <select
              id="workplace"
              name="workplace"
              defaultValue={workplace || ""}
              className="mt-1 h-11 w-full rounded-md border border-line bg-bg px-4 text-sm"
            >
              <option value="">Any</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>
          <button className="h-11 self-end rounded-md bg-fg px-5 text-sm font-medium text-bg" type="submit">
            Search
          </button>
        </form>
        {saved ? <p className="mt-3 text-sm text-muted" role="status">Alert saved. Nothing is emailed yet.</p> : null}
        {invalid ? <p className="mt-3 text-sm text-fg" role="alert">Enter a valid email to save an alert.</p> : null}
      </Listing>
    </>
  );
}
