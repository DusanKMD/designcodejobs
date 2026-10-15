import Link from "next/link";
import { Listing } from "@/components/listing";
import { JsonLd } from "@/components/json-ld";
import { ROLES } from "@/lib/catalog";
import { formatSalary } from "@/lib/format";
import { websiteLd } from "@/lib/jsonld";
import { filterJobs, listingIntro, listingRobots, updatedLabel } from "@/lib/query";
import { pageMeta } from "@/lib/seo";
import { getAllJobs } from "@/lib/store";
import type { TitleFamily, Workplace } from "@/lib/types";

const LINKS = [
  ...ROLES.filter((role) => role.priority).map((role) => ({ href: `/roles/${role.slug}`, label: role.h1 })),
  { href: "/remote", label: "Remote design engineer jobs" },
  { href: "/seniority/internship", label: "Design engineer internship" },
  { href: "/skills/framer", label: "Framer jobs" },
  { href: "/salary", label: "Design engineer salary" },
];

const ROLE_CHIPS = ROLES.filter((role) => role.priority);

function workplaceParam(value: string | string[] | undefined): Workplace | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "remote" || raw === "hybrid" || raw === "onsite") return raw;
  return undefined;
}

function roleParam(value: string | string[] | undefined): TitleFamily | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return ROLES.some((role) => role.slug === raw) ? (raw as TitleFamily) : undefined;
}

function payParam(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "1";
}

function readSearch(search: Record<string, string | string[] | undefined>) {
  return {
    q: typeof search.q === "string" ? search.q : undefined,
    workplace: workplaceParam(search.workplace),
    role: roleParam(search.role),
    pay: payParam(search.pay),
  };
}

function chipHref(current: URLSearchParams, patch: Record<string, string | null>) {
  const next = new URLSearchParams(current);
  next.delete("page");
  for (const [key, value] of Object.entries(patch)) {
    if (!value) next.delete(key);
    else next.set(key, value);
  }
  const value = next.toString();
  return value ? `/?${value}` : "/";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const search = await searchParams;
  const { q, workplace, role, pay } = readSearch(search);
  let jobs = filterJobs(await getAllJobs(), { q, title: role });
  if (workplace) jobs = jobs.filter((job) => job.workplace === workplace);
  if (pay) jobs = jobs.filter((job) => formatSalary(job));
  const page = Number(search.page || 1) || 1;
  const robots = listingRobots(jobs.length, "/", {
    page,
    filtered: Boolean(q || search.seniority || workplace || role || pay),
  });
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
  const { q, workplace, role, pay } = readSearch(search);
  const all = await getAllJobs();
  const open = filterJobs(all, {});
  let jobs = filterJobs(all, { q, title: role });
  if (workplace) jobs = jobs.filter((job) => job.workplace === workplace);
  if (pay) jobs = jobs.filter((job) => formatSalary(job));
  const filtered = Boolean(q || search.seniority || workplace || role || pay);
  const page = Number(search.page || 1) || 1;
  const saved = search.alert === "saved";
  const invalid = search.alert === "invalid";
  const featured = jobs.filter((job) => job.featured);
  const rest = featured.length ? jobs.filter((job) => !job.featured) : jobs;
  const companies = [...new Map(open.map((job) => [job.companySlug, { slug: job.companySlug, name: job.companyName, domain: job.companyDomain }])).values()]
    .sort((a, b) => a.name.localeCompare(b.name));
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (workplace) params.set("workplace", workplace);
  if (role) params.set("role", role);
  if (pay) params.set("pay", "1");

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
        openCount={filtered ? jobs.length : open.length}
        companies={companies}
        page={page}
        query={params.toString() || undefined}
        listHeading="Latest jobs"
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
        <form action="/" className="mt-6">
          <div className="flex flex-col gap-2 rounded-2xl border border-line bg-bg p-2 shadow-sm sm:flex-row sm:items-center">
            <label htmlFor="q" className="sr-only">Search roles</label>
            <input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Search by title or company"
              className="h-12 w-full flex-1 rounded-xl bg-transparent px-3 text-base outline-none"
            />
            {workplace ? <input type="hidden" name="workplace" value={workplace} /> : null}
            {role ? <input type="hidden" name="role" value={role} /> : null}
            {pay ? <input type="hidden" name="pay" value="1" /> : null}
            <button className="h-12 rounded-xl bg-accent px-6 text-sm font-semibold text-accent-fg hover:opacity-90" type="submit">
              Search
            </button>
          </div>
        </form>
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <li>
            <FilterChip href={chipHref(params, { workplace: workplace === "remote" ? null : "remote" })} active={workplace === "remote"}>
              Remote
            </FilterChip>
          </li>
          {ROLE_CHIPS.map((item) => (
            <li key={item.slug}>
              <FilterChip href={chipHref(params, { role: role === item.slug ? null : item.slug })} active={role === item.slug}>
                {item.label}
              </FilterChip>
            </li>
          ))}
          <li>
            <FilterChip href={chipHref(params, { pay: pay ? null : "1" })} active={pay}>
              Salary posted
            </FilterChip>
          </li>
        </ul>
        {saved ? <p className="mt-3 text-sm text-muted" role="status">Alert saved. Nothing is emailed yet.</p> : null}
        {invalid ? <p className="mt-3 text-sm text-fg" role="alert">Enter a valid email to save an alert.</p> : null}
      </Listing>
    </>
  );
}

function FilterChip({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`inline-flex h-9 shrink-0 items-center rounded-full px-3.5 text-sm font-semibold ${active ? "bg-accent text-accent-fg" : "border border-line bg-bg text-fg hover:border-accent"}`}
    >
      {children}
    </Link>
  );
}
