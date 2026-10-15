import Link from "next/link";
import { BrowseByRole, Explore } from "@/components/explore";
import { ArrowRight } from "@/components/icons";
import { JobList } from "@/components/job-list";
import { JsonLd } from "@/components/json-ld";
import { AlertsCard, Breadcrumbs, EmployerBand, EmployerCard, Faq, LinkPills, SectionHeading, StatStrip } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import { breadcrumbLd, faqLd } from "@/lib/jsonld";
import { listingFaqs, medianSalary, paginate } from "@/lib/query";
import { LISTING_DAYS, PAGE_SIZE } from "@/lib/site";
import type { Job } from "@/lib/types";

export function listingStats(jobs: Job[]) {
  const companies = new Set(jobs.map((job) => job.companySlug)).size;
  const remote = jobs.filter((job) => job.workplace === "remote").length;
  const salary = medianSalary(jobs);
  const withPay = jobs.filter((job) => job.salaryMin != null || job.salaryMax != null).length;
  return [
    { label: "Open roles", value: String(jobs.length) },
    { label: "Companies hiring", value: String(companies) },
    {
      label: salary ? `Median posted pay (${salary.currency})` : "Roles with salary",
      value: salary ? `${formatMoney(salary.value, salary.currency).replace(/,\d{3}$/, "k")}` : String(withPay),
    },
    { label: "Fully remote", value: jobs.length ? `${Math.round((remote / jobs.length) * 100)}%` : "0%" },
  ];
}

export function Listing({
  h1,
  path,
  jobs,
  crumbs,
  intro,
  related,
  page = 1,
  alertTitle,
  query,
  children,
  hero,
  header,
  value,
  featuredJobs,
  openCount,
  listHeading = "Open roles",
}: {
  h1: string;
  path: string;
  jobs: Job[];
  crumbs: { name: string; path: string }[];
  intro: string;
  related: { href: string; label: string }[];
  page?: number;
  alertTitle?: string;
  query?: string;
  children?: React.ReactNode;
  /** Home layout: custom header, company strip, and the employer band. */
  hero?: boolean;
  header?: React.ReactNode;
  value?: string;
  companies?: { slug: string; name: string; domain?: string }[];
  featuredJobs?: Job[];
  openCount?: number;
  listHeading?: string;
}) {
  const paged = paginate(jobs, page, PAGE_SIZE);
  const featured = featuredJobs || [];
  const all = featured.length ? [...featured, ...jobs] : jobs;
  const faqs = listingFaqs(h1, all);
  const count = openCount ?? jobs.length + featured.length;
  const pageHref = (n: number) => {
    const params = new URLSearchParams(query || "");
    if (n > 1) params.set("page", String(n));
    else params.delete("page");
    const value = params.toString();
    return value ? `${path}?${value}` : path;
  };

  return (
    <div className="pb-8">
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd data={faqLd(faqs)} />

      {header ?? (
        <section className="relative overflow-hidden border-b border-line">
          <div className="canvas canvas-fade absolute inset-0 -z-10" aria-hidden />
          <div className="glow absolute inset-0 -z-10" aria-hidden />
          <div className="mx-auto max-w-6xl px-5 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10">
            <Breadcrumbs crumbs={crumbs} />
            <h1 className="mt-6 max-w-3xl text-[40px] sm:text-[56px]">{h1}</h1>
            <p className="mt-4 max-w-2xl text-[17px] leading-7 text-fg-2">
              {value || `${h1}: open software roles for designers who code. Hardware and mechanical postings stay off the list.`}
            </p>
            {children}
            <div className="mt-8 max-w-3xl">
              <StatStrip stats={listingStats(all)} />
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            {featured.length ? (
              <section className="mb-10" aria-labelledby="featured-heading">
                <SectionHeading
                  id="featured-heading"
                  title="Featured roles"
                  description={`Paid featured posts stay pinned for the same ${LISTING_DAYS} days as a standard listing.`}
                />
                <div className="mt-4">
                  <JobList jobs={featured} />
                </div>
              </section>
            ) : null}

            <section aria-labelledby="open-roles-heading">
              <SectionHeading
                id="open-roles-heading"
                title={listHeading}
                action={
                  <p className="font-mono text-[12px] text-muted tabular">
                    {count} {count === 1 ? "role" : "roles"}
                    {paged.pages > 1 ? ` · page ${paged.page}/${paged.pages}` : ""}
                  </p>
                }
              />
              <div className="mt-4">
                {paged.total === 0 && featured.length > 0 ? (
                  <p className="text-sm text-muted">Every matching role is in Featured.</p>
                ) : (
                  <JobList jobs={paged.items} />
                )}
              </div>
              {paged.pages > 1 ? (
                <nav className="mt-6 flex items-center justify-between gap-3 text-sm" aria-label="Pagination">
                  {paged.page > 1 ? (
                    <Link href={pageHref(paged.page - 1)} className="btn btn-secondary">
                      <ArrowRight className="rotate-180" /> Previous
                    </Link>
                  ) : (
                    <span />
                  )}
                  <span className="font-mono text-[12px] text-muted">
                    Page {paged.page} of {paged.pages}
                  </span>
                  {paged.page < paged.pages ? (
                    <Link href={pageHref(paged.page + 1)} className="btn btn-secondary">
                      Next <ArrowRight className="arrow" />
                    </Link>
                  ) : (
                    <span />
                  )}
                </nav>
              ) : null}
            </section>
          </div>

          <aside className="grid gap-4 lg:sticky lg:top-24" aria-label="More">
            <EmployerCard />
            <AlertsCard alertTitle={alertTitle} compact />
            <BrowseByRole current={path} />
          </aside>
        </div>

        <div className="mt-20 grid gap-20">
          {hero ? <EmployerBand /> : null}

          <section className="reveal grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-14" aria-labelledby="about-list-heading">
            <div>
              <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-accent-text">About this list</p>
              <h2 id="about-list-heading" className="mt-1 text-[22px] tracking-tight sm:text-2xl">
                How this list is built
              </h2>
            </div>
            <p className="text-[15px] leading-7 text-fg-2">{intro}</p>
          </section>

          <Explore />

          <Faq id="questions-heading" kicker="FAQ" items={faqs} />

          {related.length ? (
            <section className="reveal" aria-labelledby="related-heading">
              <SectionHeading id="related-heading" kicker="Keep looking" title="Related" />
              <div className="mt-5">
                <LinkPills links={related} />
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
