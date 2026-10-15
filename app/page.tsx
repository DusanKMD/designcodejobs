import Link from "next/link";
import { Check, Search } from "@/components/icons";
import { Listing, listingStats } from "@/components/listing";
import { JsonLd } from "@/components/json-ld";
import { SearchShortcut } from "@/components/search-shortcut";
import { CompanyMarquee, Eyebrow, StatStrip } from "@/components/ui";
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
  return value ? `/?${value}#open-roles-heading` : "/";
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
    page,
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
  const updated = updatedLabel(open);

  const header = (
    <section className="relative overflow-hidden border-b border-line">
      <div className="canvas canvas-fade absolute inset-0 -z-10" aria-hidden />
      <div className="glow absolute inset-0 -z-10" aria-hidden />
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-12 text-center sm:px-6 sm:pb-14 sm:pt-20">
        <div className="rise flex justify-center">
          <Eyebrow live>
            <span className="tabular">{`${open.length} open roles · updated ${updated}`}</span>
          </Eyebrow>
        </div>

        <div className="relative mx-auto mt-8 max-w-5xl">
          <h1 className="text-[50px] leading-[0.98] tracking-[-0.05em] sm:text-[76px] lg:text-[92px]">
            <span className="sel">
              Design
              <span className="sel-frame" data-label="Hug × Hug" aria-hidden>
                <i />
                <i />
                <i />
                <i />
              </span>
              <span className="sel-cursor hidden lg:block" data-label="you" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path d="M2 1.5 15.5 7l-6 1.6-2.4 6.2L2 1.5Z" fill="currentColor" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
              </span>
            </span>{" "}
            engineer jobs
            <span className="caret" aria-hidden />
          </h1>
        </div>

        <p className="rise mx-auto mt-9 max-w-2xl text-[17px] leading-7 text-fg-2 sm:text-[19px] sm:leading-8" style={{ animationDelay: "90ms" }}>
          Design Code Jobs is the job board for{" "}
          <span className="font-serif text-[1.18em] italic text-fg">designers who code</span>: design engineers, UX engineers, design technologists, and design systems engineers. Software roles only, with the full description and real salary ranges.
        </p>

        <form action="/" role="search" className="rise mx-auto mt-9 max-w-2xl" style={{ animationDelay: "160ms" }}>
          <div className="search-shell flex items-center gap-2 rounded-2xl border border-line bg-card p-1.5 pl-4 shadow-[var(--shadow-md)]">
            <Search size={18} className="text-muted" />
            <label htmlFor="q" className="sr-only">
              Search roles
            </label>
            <input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Search title, company, or skill"
              autoComplete="off"
              className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-fg outline-none placeholder:text-subtle"
            />
            <span className="kbd mr-1 hidden sm:inline-flex" aria-hidden>
              /
            </span>
            {workplace ? <input type="hidden" name="workplace" value={workplace} /> : null}
            {role ? <input type="hidden" name="role" value={role} /> : null}
            {pay ? <input type="hidden" name="pay" value="1" /> : null}
            <button className="btn btn-primary h-11 rounded-xl px-5" type="submit">
              Search
            </button>
          </div>
          <SearchShortcut target="q" />
        </form>

        <ul className="rise -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0" style={{ animationDelay: "220ms" }}>
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
          {filtered ? (
            <li>
              <Link href="/" className="filter-chip border-dashed text-muted">
                Clear all
              </Link>
            </li>
          ) : null}
        </ul>
        {saved ? <p className="mt-4 text-sm text-salary-fg" role="status">Alert saved. You will hear about new roles once sending is switched on.</p> : null}
        {invalid ? <p className="field-error mt-4 text-sm" role="alert">Enter a valid email to save an alert.</p> : null}

        <div className="rise mx-auto mt-10 max-w-3xl text-left" style={{ animationDelay: "280ms" }}>
          <StatStrip stats={listingStats(open)} />
        </div>
      </div>
      <div className="pb-10">
        <CompanyMarquee companies={companies} label="Open roles right now at" />
      </div>
    </section>
  );

  return (
    <>
      <JsonLd data={websiteLd()} />
      <Listing
        hero
        header={header}
        h1="Design engineer jobs"
        path="/"
        jobs={rest}
        featuredJobs={featured}
        openCount={filtered ? jobs.length : open.length}
        page={page}
        query={params.toString() || undefined}
        listHeading={filtered ? "Matching roles" : "Latest jobs"}
        crumbs={[{ name: "Design engineer jobs", path: "/" }]}
        intro={listingIntro({
          subject: "Design engineer jobs",
          jobs,
          qualifier:
            "These are software roles for designers who code: product UI, brand and web, and design systems. That phrase also means mechanical and hardware work elsewhere, so this list stays on interface, prototyping, and frontend engineering.",
          updated: updatedLabel(jobs),
        })}
        related={LINKS}
      />
    </>
  );
}

function FilterChip({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} aria-current={active ? "true" : undefined} className="filter-chip">
      <Check size={13} className="check" />
      {children}
    </Link>
  );
}
