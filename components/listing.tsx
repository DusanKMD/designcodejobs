import Image from "next/image";
import Link from "next/link";
import { JobList } from "@/components/job-list";
import { JsonLd } from "@/components/json-ld";
import { subscribeAction } from "@/app/actions";
import { breadcrumbLd, faqLd } from "@/lib/jsonld";
import { listingFaqs, paginate } from "@/lib/query";
import { PAGE_SIZE } from "@/lib/site";
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
  companies?: { slug: string; name: string }[];
  featuredJobs?: Job[];
  openCount?: number;
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
    <div className="pb-8">
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd data={faqLd(faqs)} />
      {hero ? (
        <section className="relative overflow-hidden border-b border-line">
          <div className="blueprint pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative mx-auto max-w-5xl px-5 pb-12 pt-10 sm:pt-14">
            <nav className="flex flex-wrap gap-x-2 text-sm text-muted">
              <Crumbs crumbs={crumbs} />
            </nav>
            <p className="mt-8 text-xs font-medium uppercase tracking-[0.16em] text-accent">Design Code Jobs</p>
            <h1 className="mt-3 max-w-3xl text-5xl text-balance sm:text-6xl">{h1}</h1>
            {value ? <p className="mt-5 max-w-xl text-lg leading-8 text-fg">{value}</p> : null}
            <p className="mt-4 text-sm text-muted">
              <span className="tabular-nums font-medium text-fg">{count}</span> open {count === 1 ? "role" : "roles"} on the board
            </p>
            {children}
            {companies?.length ? <TrustStrip companies={companies} /> : null}
          </div>
        </section>
      ) : (
        <div className="mx-auto max-w-5xl px-5">
          <nav className="flex flex-wrap gap-x-2 pt-8 text-sm text-muted">
            <Crumbs crumbs={crumbs} />
          </nav>
          <h1 className="mt-6 max-w-3xl text-4xl text-balance sm:text-5xl">{h1}</h1>
          {children}
        </div>
      )}

      <div className="mx-auto max-w-5xl px-5">
        <p className="mt-8 max-w-2xl text-[15px] leading-7 text-muted">{intro}</p>
        {featured.length ? (
          <section className="mt-10" aria-labelledby="featured-heading">
            <h2 id="featured-heading" className="text-lg font-medium tracking-tight">Featured</h2>
            <p className="mt-1 text-sm text-muted">Paid featured posts stay highlighted for the same 30 days as a standard listing.</p>
            <div className="mt-4">
              <JobList jobs={featured} />
            </div>
          </section>
        ) : null}
        <section className="mt-10" aria-labelledby="open-roles-heading">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="open-roles-heading" className="text-lg font-medium tracking-tight">Open roles</h2>
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
            <nav className="mt-5 flex items-center gap-4 text-sm" aria-label="Pagination">
              {paged.page > 1 ? <Link href={pageHref(paged.page - 1)} className="underline underline-offset-4">Previous</Link> : <span />}
              <span className="text-muted">Page {paged.page} of {paged.pages}</span>
              {paged.page < paged.pages ? <Link href={pageHref(paged.page + 1)} className="underline underline-offset-4">Next</Link> : null}
            </nav>
          ) : null}
        </section>
        <section className="mt-14" aria-labelledby="questions-heading">
          <h2 id="questions-heading" className="text-lg font-medium tracking-tight">Questions</h2>
          <dl className="mt-4 divide-y divide-line border-y border-line">
            {faqs.map((faq) => (
              <div key={faq.q} className="py-4">
                <dt className="font-medium">{faq.q}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </section>
        {related.length ? (
          <section className="mt-12" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-lg font-medium tracking-tight">Related</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {related.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-flex rounded-full border border-line px-3 py-1 text-sm hover:bg-chip">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <section className="mt-14" aria-labelledby="alerts-heading">
          <h2 id="alerts-heading" className="text-lg font-medium tracking-tight">Email alerts</h2>
          <form action={subscribeAction} className="mt-4 flex max-w-md flex-col gap-2 sm:flex-row">
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
              className="h-11 flex-1 rounded-full border border-line bg-bg px-4 text-sm"
            />
            <button type="submit" className="h-11 rounded-full bg-fg px-4 text-sm font-medium text-bg">
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
      {index > 0 ? <span className="mr-2">/</span> : null}
      {index === crumbs.length - 1 ? (
        <span className="text-fg">{crumb.name}</span>
      ) : (
        <Link href={crumb.path} className="hover:text-fg">{crumb.name}</Link>
      )}
    </span>
  ));
}

function TrustStrip({ companies }: { companies: { slug: string; name: string }[] }) {
  const shown = companies.slice(0, 16);
  const rest = companies.length - shown.length;
  return (
    <section className="mt-10" aria-labelledby="hiring-heading">
      <h2 id="hiring-heading" className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
        Companies on the board
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {shown.map((company) => (
          <li key={company.slug}>
            <Link
              href={`/companies/${company.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-bg/80 px-2.5 py-1 text-sm hover:bg-chip"
            >
              <Image src={`/logo/${company.slug}`} alt="" width={20} height={20} className="h-5 w-5 rounded-md" unoptimized />
              {company.name}
            </Link>
          </li>
        ))}
        {rest > 0 ? (
          <li>
            <Link href="/companies" className="inline-flex h-8 items-center rounded-full px-2 text-sm text-muted hover:text-fg">
              and {rest} more
            </Link>
          </li>
        ) : null}
      </ul>
    </section>
  );
}
