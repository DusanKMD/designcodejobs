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
}) {
  const paged = paginate(jobs, page, PAGE_SIZE);
  const faqs = listingFaqs(h1, jobs);
  const pageHref = (n: number) => {
    const params = new URLSearchParams(query || "");
    if (n > 1) params.set("page", String(n));
    else params.delete("page");
    const value = params.toString();
    return value ? `${path}?${value}` : path;
  };

  return (
    <div className="mx-auto max-w-5xl px-5 pb-8">
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd data={faqLd(faqs)} />
      <nav className="flex flex-wrap gap-x-2 pt-6 text-sm text-muted">
        {crumbs.map((crumb, index) => (
          <span key={crumb.path}>
            {index > 0 ? <span className="mr-2">/</span> : null}
            {index === crumbs.length - 1 ? (
              <span className="text-fg">{crumb.name}</span>
            ) : (
              <Link href={crumb.path} className="hover:text-fg">{crumb.name}</Link>
            )}
          </span>
        ))}
      </nav>
      <h1 className="mt-6 max-w-3xl text-4xl font-medium tracking-tight text-balance sm:text-5xl">{h1}</h1>
      <p className="mt-5 max-w-2xl text-[15px] leading-7 text-muted">{intro}</p>
      {children}
      <p className="mt-4 text-sm text-muted">
        {jobs.length} open {jobs.length === 1 ? "role" : "roles"}
      </p>
      <div className="mt-6">
        <JobList jobs={paged.items} />
      </div>
      {paged.pages > 1 ? (
        <nav className="mt-4 flex items-center gap-4 text-sm" aria-label="Pagination">
          {paged.page > 1 ? <Link href={pageHref(paged.page - 1)} className="underline underline-offset-4">Previous</Link> : <span />}
          <span className="text-muted">Page {paged.page} of {paged.pages}</span>
          {paged.page < paged.pages ? <Link href={pageHref(paged.page + 1)} className="underline underline-offset-4">Next</Link> : null}
        </nav>
      ) : null}
      <section className="mt-12">
        <h2 className="text-lg font-medium tracking-tight">Questions</h2>
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
        <section className="mt-10">
          <h2 className="text-lg font-medium tracking-tight">Related</h2>
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
      <form action={subscribeAction} className="mt-12 flex max-w-md flex-col gap-2 sm:flex-row">
        <input type="text" name="company_website" className="hidden" tabIndex={-1} autoComplete="off" />
        {alertTitle ? <input type="hidden" name="title" value={alertTitle} /> : null}
        <label className="sr-only" htmlFor="alert-email">Email</label>
        <input
          id="alert-email"
          name="email"
          type="email"
          required
          placeholder="Email for new roles"
          className="h-10 flex-1 rounded-full border border-line bg-bg px-4 text-sm"
        />
        <button type="submit" className="h-10 rounded-full bg-fg px-4 text-sm font-medium text-bg">
          Get alerts
        </button>
      </form>
      <p className="mt-2 text-xs text-muted">Saved for later. No email is sent until a provider is connected.</p>
    </div>
  );
}
