import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { LinkPills, SectionHeading } from "@/components/ui";
import { REGIONS, ROLES, SENIORITIES, SKILLS } from "@/lib/catalog";
import { filterJobs } from "@/lib/query";
import { getAllJobs } from "@/lib/store";

/** Sidebar list of role hubs with live counts. */
export async function BrowseByRole({ current }: { current?: string }) {
  const jobs = await getAllJobs();
  const rows = ROLES.map((role) => ({ role, count: filterJobs(jobs, { title: role.slug }).length }))
    .filter((row) => row.count > 0 || row.role.priority)
    .sort((a, b) => b.count - a.count);
  return (
    <section className="card p-2" aria-labelledby="browse-roles-heading">
      <h2 id="browse-roles-heading" className="px-3 pb-1 pt-3 text-[13px] font-semibold text-fg">
        Browse by role
      </h2>
      <ul>
        {rows.map(({ role, count }) => {
          const href = `/roles/${role.slug}`;
          const active = current === href;
          return (
            <li key={role.slug}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="group flex h-10 items-center justify-between gap-3 rounded-xl px-3 text-[13.5px] text-fg-2 transition-colors hover:bg-chip hover:text-fg aria-[current=page]:bg-chip aria-[current=page]:font-medium aria-[current=page]:text-fg"
              >
                <span className="truncate">{role.h1}</span>
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[11.5px] text-subtle tabular">{count}</span>
                  <ArrowRight size={13} className="arrow -ml-1 text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Skill, level, and region hubs. Keeps every facet page in the crawl path. */
export async function Explore() {
  const jobs = await getAllJobs();
  const skills = SKILLS.map((skill) => ({
    href: `/skills/${skill.slug}`,
    label: skill.label,
    count: filterJobs(jobs, { skill: skill.slug }).length,
  }));
  const levels = SENIORITIES.map((level) => ({
    href: `/seniority/${level.slug}`,
    label: level.label,
    count: filterJobs(jobs, { seniority: level.slug }).length,
  }));
  const regions = REGIONS.map((region) => ({
    href: `/remote/${region.slug}`,
    label: `Remote · ${region.label}`,
    count: filterJobs(jobs, { remote: true, region: region.slug }).length,
  }));
  return (
    <section className="reveal" aria-labelledby="explore-heading">
      <SectionHeading id="explore-heading" kicker="Explore" title="Find your corner of the craft" />
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div>
          <h3 className="text-[13px] font-semibold text-fg">By skill</h3>
          <div className="mt-3">
            <LinkPills links={skills} />
          </div>
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-fg">By level</h3>
          <div className="mt-3">
            <LinkPills links={levels} />
          </div>
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-fg">Remote by region</h3>
          <div className="mt-3">
            <LinkPills links={regions} />
          </div>
        </div>
      </div>
    </section>
  );
}
