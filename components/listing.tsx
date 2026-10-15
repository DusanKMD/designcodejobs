import Image from "next/image";
import Link from "next/link";
import { CompanyLogo } from "@/components/company-logo";
import { JobList } from "@/components/job-list";
import { JsonLd } from "@/components/json-ld";
import { subscribeAction } from "@/app/actions";
import { breadcrumbLd, faqLd } from "@/lib/jsonld";
import { listingFaqs, paginate } from "@/lib/query";
import { LISTING_DAYS, PAGE_SIZE, STANDARD_PRICE_USD } from "@/lib/site";
import type { Job } from "@/lib/types";

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
  value,
  companies,
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
  hero?: boolean;
  value?: string;
  companies?: { slug: string; name: string; domain?: string }[];
  featuredJobs?: Job[];
  openCount?: number;
  listHeading?: string;
}) {
  const paged = paginate(jobs, page, PAGE_SIZE);
  const faqs = listingFaqs(h1, featuredJobs?.length ? [...featuredJobs, ...jobs] : jobs);
  const featured = featuredJobs || [];
  const pageHref = (n: number) => {
    const params = new URLSearchParams(query || "");
    if (n > 1) params.set("page", String(n));
    else params.delete("page");
    const value = params.toString();
    return value ? `${path}?${value}` : path;
  };
  const count = openCount ?? jobs.length + featured.length;

  return (
    <div className="pb-16">
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd data={faqLd(faqs)} />
      {hero ? (
        <section className="border-b border-line bg-card">
          <div className="mx-auto max-w-6xl px-5 pb-8 pt-8 sm:pb-10 sm:pt-12">
            <nav className="flex flex-wrap gap-x-2 text-sm text-muted" aria-label="Breadcrumb">
              <Crumbs crumbs={crumbs} />
            </nav>
            <div className="mt-6 flex items-center gap-3">
              <Image src="/mark.svg" alt={h1} width={44} height={44} className="h-11 w-11 rounded-xl" unoptimized />
              <p className="text-sm font-semibold text-accent">For designers who code</p>
            </div>
            <h1 className="mt-3 max-w-3xl text-4xl text-balance sm:text-6xl">{h1}</h1>
            {value ? <p className="mt-4 max-w-2xl text-lg leading-8 text-fg">{value}</p> : null}
            {children}
            <p className="mt-4 text-sm font-medium text-muted">
              {count} open {count === 1 ? "role" : "roles"}
            </p>
          </div>
        </section>
      ) : (
        <div className="mx-auto max-w-6xl px-5">
          <nav className="flex flex-wrap gap-x-2 pt-8 text-sm text-muted" aria-label="Breadcrumb">
            <Crumbs crumbs={crumbs} />
          </nav>
          <h1 className="mt-5 max-w-3xl text-4xl text-balance sm:text-5xl">{h1}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-fg">{value || `${h1}. These are open software roles. Hardware and mechanical postings stay off the list.`}</p>
          {children}
        </div>
      )}

      <div className="mx-auto max-w-6xl px-5">
        <p className="mt-8 max-w-2xl text-[15px] leading-7 text-muted">{intro}</p>
        {featured.length ? (
          <section className="mt-10" aria-labelledby="featured-heading">
            <h2 id="featured-heading" className="text-2xl font-bold tracking-tight">Featured</h2>
            <p className="mt-1 text-sm text-muted">Paid featured posts stay highlighted for the same {LISTING_DAYS} days as a standard listing.</p>
            <div className="mt-4">
              <JobList jobs={featured} />
            </div>
          </section>
        ) : null}
        <section className="mt-10" aria-labelledby="open-roles-heading">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="open-roles-heading" className="text-2xl font-bold tracking-tight">{listHeading}</h2>
            <p className="text-sm text-muted">
              {jobs.length} {jobs.length === 1 ? "role" : "roles"}
            </p>
          </div>
          <div className="mt-4">
            {paged.total === 0 && featured.length > 0 ? (
              <p className="text-sm text-muted">Every matching role is in Featured.</p>
            ) : (
              <JobList jobs={paged.items} />
            )}
          </div>
          {paged.pages > 1 ? (
            <nav className="mt-5 flex items-center gap-3 text-sm" aria-label="Pagination">
              {paged.page > 1 ? (
                <Link href={pageHref(paged.page - 1)} className="inline-flex h-10 items-center rounded-xl border border-line bg-card px-4 font-semibold hover:border-accent">Previous</Link>
              ) : <span />}
              <span className="text-muted">Page {paged.page} of {paged.pages}</span>
              {paged.page < paged.pages ? (
                <Link href={pageHref(paged.page + 1)} className="inline-flex h-10 items-center rounded-xl border border-line bg-card px-4 font-semibold hover:border-accent">Next</Link>
              ) : null}
            </nav>
          ) : null}
        </section>
        {hero && companies?.length ? <TrustStrip companies={companies} /> : null}
        {hero ? <EmployerBand /> : null}
        <section className="mt-14" aria-labelledby="questions-heading">
          <h2 id="questions-heading" className="text-2xl font-bold tracking-tight">Questions</h2>
          <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-card px-5">
            {faqs.map((faq) => (
              <div key={faq.q} className="py-4">
                <h3 className="text-base font-semibold">{faq.q}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
        {related.length ? (
          <section className="mt-12" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-2xl font-bold tracking-tight">Related</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {related.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-flex rounded-full border border-line bg-card px-3.5 py-1.5 text-sm font-medium hover:border-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <section className="card mt-14 px-5 py-6 sm:px-6" aria-labelledby="alerts-heading">
          <h2 id="alerts-heading" className="text-2xl font-bold tracking-tight">Job alerts</h2>
          <p className="mt-1 max-w-xl text-sm text-muted">A note when a role on this list is posted.</p>
          <form action={subscribeAction} className="mt-4 flex max-w-lg flex-col gap-2 sm:flex-row">
            <input type="text" name="company_website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
            {alertTitle ? <input type="hidden" name="title" value={alertTitle} /> : null}
            <label className="sr-only" htmlFor="alert-email">Email</label>
            <input
              id="alert-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              className="h-12 flex-1 rounded-xl border border-line bg-bg px-4 text-sm"
            />
            <button type="submit" className="h-12 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-fg hover:opacity-90">
              Get alerts
            </button>
          </form>
          <p className="mt-2 text-xs text-muted">Saved for later. No email is sent until a provider is connected.</p>
        </section>
      </div>
    </div>
  );
}

function Crumbs({ crumbs }: { crumbs: { name: string; path: string }[] }) {
  return crumbs.map((crumb, index) => (
    <span key={crumb.path}>
      {index > 0 ? <span className="mr-2 text-line">/</span> : null}
      {index === crumbs.length - 1 ? (
        <span className="text-fg">{crumb.name}</span>
      ) : (
        <Link href={crumb.path} className="hover:text-fg">{crumb.name}</Link>
      )}
    </span>
  ));
}

function TrustStrip({ companies }: { companies: { slug: string; name: string; domain?: string }[] }) {
  const shown = companies.slice(0, 16);
  const rest = companies.length - shown.length;
  return (
    <section className="mt-14" aria-labelledby="hiring-heading">
      <h2 id="hiring-heading" className="text-2xl font-bold tracking-tight">Companies on the board</h2>
      <ul className="mt-4 flex gap-3 overflow-x-auto pb-2">
        {shown.map((company) => (
          <li key={company.slug} className="shrink-0">
            <Link
              href={`/companies/${company.slug}`}
              className="lift flex h-full w-28 flex-col items-center gap-2 rounded-2xl border border-line bg-card px-3 py-4 text-center text-xs font-semibold shadow-sm"
            >
              <CompanyLogo name={company.name} domain={company.domain} size={40} />
              <span className="line-clamp-2">{company.name}</span>
            </Link>
          </li>
        ))}
        {rest > 0 ? (
          <li className="shrink-0">
            <Link href="/companies" className="flex h-full w-28 items-center justify-center rounded-2xl border border-dashed border-line px-3 text-center text-sm font-semibold text-muted hover:text-fg">
              and {rest} more
            </Link>
          </li>
        ) : null}
      </ul>
    </section>
  );
}

function EmployerBand() {
  return (
    <section className="mt-14 rounded-3xl bg-accent px-6 py-8 text-accent-fg sm:px-10" aria-labelledby="employers-heading">
      <h2 id="employers-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">Hiring a design engineer?</h2>
      <p className="mt-2 max-w-xl text-base leading-7">
        A standard post is ${STANDARD_PRICE_USD} for {LISTING_DAYS} days. The description stays on this site, and candidates apply on your original posting.
      </p>
      <Link href="/post-a-job" className="mt-5 inline-flex h-11 items-center rounded-xl bg-card px-5 text-sm font-semibold text-fg hover:opacity-90">
        Post a job
      </Link>
    </section>
  );
}
