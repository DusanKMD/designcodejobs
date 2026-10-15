import Link from "next/link";
import { CompanyLogo } from "@/components/company-logo";
import { ArrowRight, Bell, Bolt, Check, Inbox, Plus, Shield } from "@/components/icons";
import { Spotlight } from "@/components/spotlight";
import { subscribeAction } from "@/app/actions";
import { LISTING_DAYS, STANDARD_PRICE_USD, FEATURED_ADDON_USD } from "@/lib/site";

/* ── Breadcrumbs ─────────────────────────────────────────── */

export function Breadcrumbs({ crumbs }: { crumbs: { name: string; path: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[13px] text-muted">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {crumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center gap-1.5">
            {index > 0 ? (
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="text-subtle">
                <path d="m4.5 3 3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
            {index === crumbs.length - 1 ? (
              <span className="text-fg-2" aria-current="page">{crumb.name}</span>
            ) : (
              <Link href={crumb.path} className="transition-colors hover:text-fg">
                {crumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ── Eyebrow ─────────────────────────────────────────────── */

export function Eyebrow({ children, live }: { children: React.ReactNode; live?: boolean }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-line bg-card/80 py-1 pl-2.5 pr-3 text-[12.5px] font-medium text-fg-2 shadow-[var(--shadow-sm)] backdrop-blur">
      {live ? <span className="live-dot" aria-hidden /> : null}
      {children}
    </p>
  );
}

/* ── Stats ───────────────────────────────────────────────── */

export function StatStrip({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-line bg-card shadow-[var(--shadow-sm)] sm:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={`px-4 py-3.5 sm:px-5 ${index % 2 ? "border-l border-line" : ""} ${index > 1 ? "border-t border-line sm:border-t-0" : ""} ${index === 2 ? "sm:border-l" : ""}`}
        >
          <dt className="text-[12px] font-medium text-muted">{stat.label}</dt>
          <dd className="mt-0.5 font-mono text-[19px] font-medium tracking-tight text-fg tabular">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ── Section heading ─────────────────────────────────────── */

export function SectionHeading({
  id,
  title,
  kicker,
  action,
  description,
}: {
  id: string;
  title: string;
  kicker?: string;
  action?: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {kicker ? <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-accent-text">{kicker}</p> : null}
        <h2 id={id} className="mt-1 text-[22px] tracking-tight sm:text-2xl">
          {title}
        </h2>
        {description ? <p className="mt-1.5 max-w-xl text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

/* ── FAQ accordion ───────────────────────────────────────── */

export function Faq({ id, title = "Questions", items, kicker }: { id: string; title?: string; kicker?: string; items: { q: string; a: string }[] }) {
  return (
    <section className="reveal" aria-labelledby={id}>
      <SectionHeading id={id} title={title} kicker={kicker} />
      <div className="faq card mt-5 px-5 sm:px-6">
        {items.map((faq, index) => (
          <details key={faq.q} open={index === 0}>
            <summary className="group flex items-center justify-between gap-4 py-4.5 text-[15px] font-medium text-fg">
              <h3 className="text-[15px] font-medium tracking-[-0.01em]">{faq.q}</h3>
              <span className="plus flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-colors group-hover:border-line-strong group-hover:text-fg">
                <Plus size={14} />
              </span>
            </summary>
            <p className="max-w-3xl pb-5 pr-10 text-[14.5px] leading-7 text-muted">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ── Employer card (sidebar) ─────────────────────────────── */

export function EmployerCard() {
  return (
    <Spotlight className="overflow-hidden rounded-2xl bg-[#0b0b0f] p-5 text-white shadow-[var(--shadow-lg)] ring-1 ring-white/10">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/55">For employers</p>
      <p className="mt-2 text-lg font-semibold leading-snug tracking-tight">Reach designers who ship production UI.</p>
      <ul className="mt-4 space-y-2 text-[13px] text-white/75">
        <li className="flex gap-2"><Check size={14} className="mt-0.5 text-[#8fa6ff]" /> Live within a minute of payment</li>
        <li className="flex gap-2"><Check size={14} className="mt-0.5 text-[#8fa6ff]" /> Google for Jobs-ready job page</li>
        <li className="flex gap-2"><Check size={14} className="mt-0.5 text-[#8fa6ff]" /> Applicants go straight to your ATS</li>
      </ul>
      <div className="mt-5 flex items-end justify-between gap-3">
        <p>
          <span className="font-mono text-2xl font-medium tracking-tight">${STANDARD_PRICE_USD}</span>
          <span className="ml-1 text-xs text-white/55">/ {LISTING_DAYS} days</span>
        </p>
        <Link href="/post-a-job" className="btn btn-sm bg-white text-[#0b0b0f] hover:bg-white/90">
          Post a job
          <ArrowRight size={14} className="arrow" />
        </Link>
      </div>
    </Spotlight>
  );
}

/* ── Job alerts ──────────────────────────────────────────── */

export function AlertsCard({ alertTitle, compact }: { alertTitle?: string; compact?: boolean }) {
  return (
    <section className={`card p-5 ${compact ? "" : "sm:p-6"}`} aria-labelledby="alerts-heading">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent-text">
          <Bell />
        </span>
        <h2 id="alerts-heading" className="text-base font-semibold tracking-tight">Job alerts</h2>
      </div>
      <p className="mt-2 text-[13px] leading-5 text-muted">A note when a role on this list is posted. One email, no spam.</p>
      <form action={subscribeAction} className="mt-4 flex flex-col gap-2">
        <input type="text" name="company_website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
        {alertTitle ? <input type="hidden" name="title" value={alertTitle} /> : null}
        <label className="sr-only" htmlFor="alert-email">Email</label>
        <input id="alert-email" name="email" type="email" required autoComplete="email" placeholder="you@studio.com" className="field" />
        <button type="submit" className="btn btn-secondary w-full">
          Get alerts
        </button>
      </form>
      <p className="mt-2.5 text-[11.5px] leading-4 text-subtle">Saved now. Emails start once sending is switched on.</p>
    </section>
  );
}

/* ── Employer band (full width) ──────────────────────────── */

export function EmployerBand() {
  return (
    <Spotlight className="reveal overflow-hidden rounded-[28px] bg-[#0b0b0f] text-white shadow-[var(--shadow-lg)] ring-1 ring-white/10">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:22px_22px]" />
      <div className="grid gap-10 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <p className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-[#8fa6ff]">For hiring teams</p>
          <h2 className="mt-3 text-3xl leading-[1.08] tracking-[-0.035em] sm:text-[42px]">
            Hire a design engineer <span className="font-serif text-[1.08em] font-normal italic tracking-normal text-white/80">who actually ships.</span>
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-7 text-white/70">
            Your role lands on a board built only for designers who code, plus the matching role, skill, remote, and salary pages. ${STANDARD_PRICE_USD} for {LISTING_DAYS} days, no subscription.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/post-a-job" className="btn btn-lg bg-white text-[#0b0b0f] hover:bg-white/90">
              Post a job for ${STANDARD_PRICE_USD}
              <ArrowRight className="arrow" />
            </Link>
            <Link href="/post-a-job#pricing" className="btn btn-lg text-white/80 hover:bg-white/10 hover:text-white">
              Featured +${FEATURED_ADDON_USD}
            </Link>
          </div>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: <Bolt />, title: "Live in a minute", body: "Published by the payment webhook. No review queue for software roles." },
            { icon: <Shield />, title: "Indexable job page", body: "JobPosting markup, so the role is eligible for Google for Jobs." },
            { icon: <Inbox />, title: "No middleman", body: "Apply goes to your ATS or careers page, tagged so you see the referral." },
            { icon: <Check />, title: "Only software roles", body: "Hardware and mechanical design jobs are filtered out of the board." },
          ].map((item) => (
            <li key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-[#b7c6ff]">{item.icon}</span>
              <p className="mt-3 text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-[13px] leading-5 text-white/60">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </Spotlight>
  );
}

/* ── Company marquee ─────────────────────────────────────── */

export function CompanyMarquee({ companies, label }: { companies: { slug: string; name: string; domain?: string }[]; label: string }) {
  if (companies.length < 4) return null;
  const row = (dup: boolean) => (
    <ul className={`flex shrink-0 items-center gap-2.5 pr-2.5 ${dup ? "marquee-dup" : ""}`} aria-hidden={dup || undefined}>
      {companies.map((company) => (
        <li key={company.slug}>
          <Link
            href={`/companies/${company.slug}`}
            tabIndex={dup ? -1 : undefined}
            className="flex h-11 items-center gap-2.5 rounded-xl border border-line bg-card px-3.5 text-sm font-medium text-fg-2 shadow-[var(--shadow-sm)] transition-colors hover:border-line-strong hover:text-fg"
          >
            <CompanyLogo name={company.name} domain={company.domain} size={22} />
            {company.name}
          </Link>
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label={label}>
      <p className="text-center text-[12.5px] font-medium text-muted">{label}</p>
      <div className="marquee mt-4 overflow-hidden" style={{ ["--marquee-duration" as string]: `${Math.max(30, companies.length * 3.2)}s` }}>
        <div className="marquee-track">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  );
}

/* ── Link pills ──────────────────────────────────────────── */

export function LinkPills({ links }: { links: { href: string; label: string; count?: number }[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="group inline-flex h-9 items-center gap-2 rounded-full border border-line bg-card px-3.5 text-[13px] font-medium text-fg-2 shadow-[var(--shadow-sm)] transition-colors hover:border-line-strong hover:text-fg"
          >
            {link.label}
            {link.count != null ? <span className="font-mono text-[11px] text-subtle tabular">{link.count}</span> : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
