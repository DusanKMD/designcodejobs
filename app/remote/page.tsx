import Link from "next/link";
import { Listing } from "@/components/listing";
import { LinkPills, SectionHeading } from "@/components/ui";
import { REGIONS, roleBySlug } from "@/lib/catalog";
import { filterJobs, listedJobs, listingIntro, listingRobots, updatedLabel } from "@/lib/query";
import {
  formatRemotePay,
  guideLink,
  remoteFaqs,
  remoteGuideLinks,
  remoteHeroText,
  remoteMetaDescription,
  remoteMetaTitle,
  remoteRegionShort,
  remoteSummary,
  type RemoteFamily,
  type RemoteSummary,
} from "@/lib/remote";
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
  const summary = remoteSummary(jobs);
  return pageMeta({
    title: remoteMetaTitle(summary),
    description: remoteMetaDescription(summary),
    path: "/remote",
    index: robots.index,
    canonicalPath: robots.canonicalPath,
    page,
  });
}

function familyHref(family: RemoteFamily) {
  if (!family.slug) return null;
  return roleBySlug(family.slug) ? `/roles/${family.slug}/remote` : `/roles/${family.slug}`;
}

function RemoteSections({ summary }: { summary: RemoteSummary }) {
  const guides = remoteGuideLinks();
  return (
    <div className="grid gap-20">
      <section className="reveal" aria-labelledby="remote-regions-heading">
        <SectionHeading
          id="remote-regions-heading"
          kicker="Regions"
          title="Remote design engineer jobs by region"
          description="A role open to both the US and Canada counts in each."
        />
        <div className="card mt-5 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <caption className="caption-bottom border-t border-line px-5 py-3 text-left text-[13px] leading-6 text-muted">
              Pay is the employer-posted base range; currencies are not converted. A role open in two regions counts in both.
            </caption>
            <thead className="border-b border-line bg-chip/60 text-[12px] text-muted">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">Region</th>
                <th scope="col" className="px-5 py-3 font-medium">Open roles</th>
                <th scope="col" className="px-5 py-3 font-medium">Companies</th>
                <th scope="col" className="px-5 py-3 font-medium">Posted yearly pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {summary.regions.map((region) => (
                <tr key={region.slug} className="transition-colors hover:bg-chip/50">
                  <th scope="row" className="px-5 py-3.5 font-medium">
                    <Link href={`/remote/${region.slug}`} className="hover:text-accent-text">
                      {region.label}
                    </Link>
                  </th>
                  <td className="px-5 py-3.5 font-mono text-[13px] tabular">{region.count}</td>
                  <td className="px-5 py-3.5 text-fg-2">{region.count === 0 ? "—" : region.companies.join(", ")}</td>
                  <td className="px-5 py-3.5 tabular text-fg-2">
                    {region.count === 0 ? "—" : region.pay.length ? region.pay.map((band) => formatRemotePay(band)).join(", ") : "Not posted"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="reveal" aria-labelledby="remote-companies-heading">
        <SectionHeading id="remote-companies-heading" kicker="Companies" title="Who is hiring remote design engineers" />
        <div className="mt-5">
          <LinkPills
            links={summary.companies.map((company) => ({
              href: `/companies/${company.slug}`,
              label: company.name,
              count: company.count,
            }))}
          />
        </div>
      </section>

      <section className="reveal" aria-labelledby="remote-types-heading">
        <SectionHeading id="remote-types-heading" kicker="Roles" title="Remote roles by type" />
        <div className="mt-5">
          <LinkPills
            links={summary.families.flatMap((family) => {
              const href = familyHref(family);
              return href ? [{ href, label: family.label, count: family.count }] : [];
            })}
          />
          {summary.families.some((family) => !familyHref(family)) ? (
            <p className="mt-3 text-sm text-muted">
              {summary.families
                .filter((family) => !familyHref(family))
                .map((family) => `${family.label} (${family.count})`)
                .join(", ")}
            </p>
          ) : null}
        </div>
      </section>

      {guides.length ? (
        <section className="reveal" aria-labelledby="remote-guides-heading">
          <SectionHeading id="remote-guides-heading" kicker="Guides" title="Guides for remote design engineers" />
          <div className="mt-5">
            <LinkPills links={guides} />
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default async function RemotePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const search = await searchParams;
  const all = await getAllJobs();
  const jobs = filterJobs(all, { remote: true });
  const page = Number(search.page || 1) || 1;
  const summary = remoteSummary(jobs);
  const boardTotal = listedJobs(all).length;
  const salaryGuide = guideLink("design-engineer-salary");
  const whatGuide = guideLink("what-is-a-design-engineer");
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
      value={
        summary.total > 0 ? (
          remoteHeroText(summary)
        ) : (
          <>
            No fully remote design engineer role is open right now. New remote roles appear here after the next board sync; set a job alert below or browse{" "}
            <Link href="/" className="link">
              all design engineer jobs
            </Link>
            .
          </>
        )
      }
      intro={listingIntro({
        subject: "Remote design engineer jobs",
        jobs,
        qualifier:
          "Every role on this page is fully remote software work. Hybrid listings, including ones that mention a city office, are excluded so the page matches a remote search.",
        updated: updatedLabel(jobs),
      })}
      faqs={remoteFaqs(summary, boardTotal)}
      sections={summary.total > 0 ? <RemoteSections summary={summary} /> : undefined}
      related={[
        ...REGIONS.map((region) => ({ href: `/remote/${region.slug}`, label: region.h1 })),
        { href: "/roles/ux-engineer", label: "UX engineer jobs" },
        { href: "/salary", label: "Design engineer salary" },
        ...(salaryGuide ? [salaryGuide] : []),
        ...(whatGuide ? [whatGuide] : []),
      ]}
    >
      <div className="mt-6">
        <LinkPills
          links={[
            ...summary.regions
              .filter((region) => region.count > 0)
              .map((region) => ({
                href: `/remote/${region.slug}`,
                label: `${remoteRegionShort(region.slug)} · ${region.count}`,
              })),
            { href: "#alerts-heading", label: "Get job alerts" },
          ]}
        />
      </div>
    </Listing>
  );
}
