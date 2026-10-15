import Link from "next/link";
import { CompanyLogo } from "@/components/company-logo";
import { ArrowRight, Bolt, Check, Eye, Globe, Inbox, Layers, Lock, Shield, Sparkle } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { PostJobForm } from "@/components/post-job-form";
import { Breadcrumbs, CompanyMarquee, Eyebrow, Faq, SectionHeading } from "@/components/ui";
import { breadcrumbLd, faqLd } from "@/lib/jsonld";
import { filterJobs } from "@/lib/query";
import { pageMeta } from "@/lib/seo";
import { FEATURED_ADDON_USD, FEATURED_PRICE_USD, LISTING_DAYS, STANDARD_PRICE_USD } from "@/lib/site";
import { getAllJobs } from "@/lib/store";

export const metadata = pageMeta({
  title: "Post a design engineer job",
  description: `Post a design engineer job for $${STANDARD_PRICE_USD} for ${LISTING_DAYS} days. Featured placement adds $${FEATURED_ADDON_USD}. The listing goes live when payment is confirmed.`,
  path: "/post-a-job",
  index: true,
});

const FAQS = [
  {
    q: "Where should I post a design engineer job?",
    a: `Post it where designers who code actually look. Design Code Jobs lists only software design roles (design engineer, UX engineer, design technologist, design systems), so the post is not buried under mechanical engineering results. It costs $${STANDARD_PRICE_USD} for ${LISTING_DAYS} days, and cross-posting to LinkedIn or your own careers page works fine alongside it.`,
  },
  {
    q: "When does the role go live?",
    a: `The role goes live after Dodo Payments confirms the charge. Returning from checkout does not publish it. A webhook receives the succeeded payment and sets the listing active, usually within a minute. Until that event arrives the draft stays unpublished, including when payments are not configured and the form only saves a pending draft.`,
  },
  {
    q: "What does the featured add-on change?",
    a: `A standard post is $${STANDARD_PRICE_USD} for ${LISTING_DAYS} days and includes the description, the apply link, and a place in search. Featured is an extra $${FEATURED_ADDON_USD}, so checkout is $${FEATURED_PRICE_USD}. The role is highlighted above the open list for those same ${LISTING_DAYS} days. It does not extend the listing past that window.`,
  },
  {
    q: "What is hosted here?",
    a: "Design Code Jobs hosts the description, company name, workplace, location, and salary you submit. Candidates read that copy on this site. The apply button still sends them to your URL, with a short tracking parameter so you can see the referral. This site does not collect applications or resumes.",
  },
  {
    q: "What if the payment fails or I cancel?",
    a: "A failed or cancelled checkout leaves the listing unpublished. The form keeps what you typed, so you can correct a field and start checkout again. If a payment later succeeds and is then refunded, the published role expires. The confirmation page shows paid, pending, failed, cancelled, or not charged.",
  },
  {
    q: "Will a hardware role be listed?",
    a: "Mechanical, hardware, chip, and audiovisual titles can be paid and still stay unpublished. This board is for software design engineers, people who design and ship interface code. A title that matches a physical design job is filtered out even after payment. The charge is not a guarantee that a mismatched role will appear.",
  },
];

const VALUE = [
  {
    icon: <Eye />,
    title: "In front of the right people",
    body: "Only software design roles are listed, so your post is read by designers who code, not mechanical engineers searching the same words.",
  },
  {
    icon: <Shield />,
    title: "A job page Google can read",
    body: "Each role gets its own page with JobPosting markup, so it is eligible for Google for Jobs. New URLs are pinged to IndexNow on publish.",
  },
  {
    icon: <Layers />,
    title: "Shown wherever it matches",
    body: "Your role appears on the home list and on matching role, skill, remote, seniority, salary, and company pages, plus RSS.",
  },
  {
    icon: <Inbox />,
    title: "Applicants go to you",
    body: "The apply button opens your ATS or careers page with a UTM tag. No resume database, no middleman, no per-applicant fee.",
  },
];

const STEPS = [
  { title: "Write the post", body: "Paste the description you already have. The live preview shows the card candidates will see." },
  { title: "Pay once", body: `$${STANDARD_PRICE_USD}, or $${FEATURED_PRICE_USD} with featured placement. Secure checkout by Dodo Payments.` },
  { title: "Live in a minute", body: `The payment webhook publishes the role for ${LISTING_DAYS} days and notifies search engines.` },
];

export default async function PostJobPage() {
  const open = filterJobs(await getAllJobs(), {});
  const companies = [...new Map(open.map((job) => [job.companySlug, { slug: job.companySlug, name: job.companyName, domain: job.companyDomain }])).values()]
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <JsonLd data={breadcrumbLd([{ name: "Jobs", path: "/" }, { name: "Post a job", path: "/post-a-job" }])} />
      <JsonLd data={faqLd(FAQS)} />

      <section className="relative overflow-hidden border-b border-line">
        <div className="canvas canvas-fade absolute inset-0 -z-10" aria-hidden />
        <div className="glow absolute inset-0 -z-10" aria-hidden />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-14 pt-8 sm:px-6 sm:pt-10 lg:grid-cols-[1.15fr_1fr] lg:pb-20">
          <div>
            <Breadcrumbs crumbs={[{ name: "Jobs", path: "/" }, { name: "Post a job", path: "/post-a-job" }]} />
            <div className="mt-8">
              <Eyebrow live>{`${open.length} live roles from ${companies.length} companies`}</Eyebrow>
            </div>
            <h1 className="mt-5 text-[44px] leading-[1.02] sm:text-[64px]">
              Post a design engineer job
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-7 text-fg-2 sm:text-lg sm:leading-8">
              Reach{" "}
              <span className="font-serif text-[1.15em] italic text-fg">designers who code</span>: design engineers, UX engineers, design technologists, and design systems engineers. ${STANDARD_PRICE_USD} for {LISTING_DAYS} days, and featured placement is ${FEATURED_ADDON_USD} more. It goes live when payment is confirmed, not when you return from checkout.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#post-form" className="btn btn-primary btn-lg">
                Start your listing
                <ArrowRight className="arrow" />
              </a>
              <a href="#pricing" className="btn btn-secondary btn-lg">
                See pricing
              </a>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted">
              <li className="flex items-center gap-1.5"><Lock size={14} /> Secure checkout</li>
              <li className="flex items-center gap-1.5"><Bolt size={14} /> Live in about a minute</li>
              <li className="flex items-center gap-1.5"><Globe size={14} /> Google for Jobs-ready</li>
            </ul>
          </div>
          <HeroPreview />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <section className="reveal mt-20" aria-labelledby="value-heading">
          <SectionHeading id="value-heading" kicker="What you get" title="Built to put one role in front of the right people" />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE.map((item) => (
              <li key={item.title} className="card p-5 transition-transform duration-300 hover:-translate-y-0.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent-text">{item.icon}</span>
                <h3 className="mt-4 text-[15px] font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-6 text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="pricing" className="reveal mt-24 scroll-mt-24" aria-labelledby="pricing-heading">
          <SectionHeading id="pricing-heading" kicker="Pricing" title="One price, no subscription" description="Pay per role. Nothing renews, and nothing is charged until you finish checkout." />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <PriceCard
              name="Standard"
              price={STANDARD_PRICE_USD}
              blurb={`Everything a role needs for ${LISTING_DAYS} days.`}
              href="#plan-standard"
              cta="Choose Standard"
              points={[
                `${LISTING_DAYS} days on the board`,
                "Full description hosted on its own job page",
                "JobPosting markup, eligible for Google for Jobs",
                "Listed on matching role, skill, remote, and salary pages",
                "Apply link to your ATS, with UTM tracking",
              ]}
            />
            <PriceCard
              featured
              name="Featured"
              price={FEATURED_PRICE_USD}
              blurb={`Standard plus $${FEATURED_ADDON_USD} to stay on top.`}
              href="#plan-featured"
              cta="Choose Featured"
              points={[
                "Everything in Standard",
                "Pinned in Featured above every matching list",
                "Highlighted card that stands out in the feed",
                `Same ${LISTING_DAYS} days, not an extension`,
              ]}
            />
          </div>
        </section>

        <section className="reveal mt-24" aria-labelledby="how-heading">
          <SectionHeading id="how-heading" kicker="How it works" title="From draft to live in three steps" />
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative rounded-2xl border border-dashed border-line-strong p-5">
                <span className="font-mono text-[12px] text-accent-text">0{index + 1}</span>
                <h3 className="mt-2 text-[15px] font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-6 text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="post-form" className="mt-24 scroll-mt-24" aria-labelledby="form-heading">
          <SectionHeading id="form-heading" kicker="Your listing" title="Write your listing" description="Required fields are marked with an asterisk. Your answers stay in the form if checkout fails." />
          <div className="mt-8">
            <PostJobForm />
          </div>
        </section>
      </div>

      <div className="mt-24">
        <CompanyMarquee companies={companies} label="Your role is listed next to open roles from" />
      </div>

      <div className="mx-auto mt-24 max-w-3xl px-5 sm:px-6">
        <Faq id="post-faq" kicker="FAQ" items={FAQS} />
        <p className="mt-8 text-center text-sm text-muted">
          Questions before you pay? Read the <Link href="/terms" className="link">terms</Link> or <Link href="/about" className="link">how the board works</Link>.
        </p>
      </div>
    </div>
  );
}

function PriceCard({
  name,
  price,
  blurb,
  points,
  href,
  cta,
  featured,
}: {
  name: string;
  price: number;
  blurb: string;
  points: string[];
  href: string;
  cta: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[22px] p-6 sm:p-7 ${
        featured ? "bg-[#0b0b0f] text-white shadow-[var(--shadow-lg)] ring-1 ring-white/10" : "card"
      }`}
    >
      {featured ? (
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(91,124,240,0.45),transparent_65%)]" aria-hidden />
      ) : null}
      <div className="relative flex items-center justify-between gap-3">
        <p className="text-[15px] font-semibold">{name}</p>
        {featured ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11.5px] font-medium text-white/85">
            <Sparkle size={12} /> Most visible
          </span>
        ) : null}
      </div>
      <p className="relative mt-4 flex items-baseline gap-1.5">
        <span className="text-5xl font-semibold tracking-[-0.04em] tabular">${price}</span>
        <span className={`text-sm ${featured ? "text-white/55" : "text-muted"}`}>one-time</span>
      </p>
      <p className={`relative mt-1 text-sm ${featured ? "text-white/65" : "text-muted"}`}>{blurb}</p>
      <ul className="relative mt-6 grid gap-2.5 text-[14px]">
        {points.map((point) => (
          <li key={point} className="flex gap-2.5">
            <Check size={15} className={`mt-0.5 ${featured ? "text-[#8fa6ff]" : "text-accent-text"}`} />
            <span className={featured ? "text-white/85" : "text-fg-2"}>{point}</span>
          </li>
        ))}
      </ul>
      <a href={href} className={`btn btn-lg relative mt-7 w-full ${featured ? "bg-white text-[#0b0b0f] hover:bg-white/90" : "btn-primary"}`}>
        {cta}
        <ArrowRight className="arrow" />
      </a>
    </div>
  );
}

/** A sample featured card in a design-tool selection, to show what the buyer gets. */
function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-hidden>
      <div className="absolute -inset-6 -z-10 rounded-[32px] bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--accent)_16%,transparent),transparent)]" />
      <div className="rotate-[-1.5deg] rounded-2xl border border-line bg-card/70 p-3 shadow-[var(--shadow-md)]">
        <GhostCard />
      </div>
      <div className="sel rise relative z-10 -mt-6 ml-4 block sm:ml-8" style={{ animationDelay: "200ms" }}>
        <div className="rounded-2xl bg-card p-0 shadow-[var(--shadow-lg)]">
          <SampleCard featured company="Your company" title="Senior Design Engineer" place="Remote · US" salary="$180k–220k/yr" />
        </div>
        <span className="sel-frame" data-label="Featured · 30 days" style={{ inset: "-6px" }}>
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="sel-cursor block" data-label="you" style={{ right: "-1.2rem", bottom: "-2.6rem" }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M2 1.5 15.5 7l-6 1.6-2.4 6.2L2 1.5Z" fill="currentColor" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      <div className="mt-12 rotate-[1deg] rounded-2xl border border-line bg-card/70 p-3 shadow-[var(--shadow-md)]">
        <GhostCard wide />
      </div>
    </div>
  );
}

/** A placeholder listing: shapes only, so the selected card is the one that reads. */
function GhostCard({ wide }: { wide?: boolean }) {
  return (
    <div className="job-card px-4 py-4">
      <div className="flex items-center gap-3">
        <span className="h-10 w-10 shrink-0 rounded-[10px] bg-chip" />
        <div className="min-w-0 flex-1">
          <span className="block h-2.5 w-24 rounded-full bg-chip" />
          <span className={`mt-2.5 block h-3.5 rounded-full bg-line-strong/70 ${wide ? "w-56" : "w-44"}`} />
          <span className="mt-3 flex gap-1.5">
            <span className="h-5 w-16 rounded-full bg-chip" />
            <span className="h-5 w-20 rounded-full bg-salary" />
          </span>
        </div>
      </div>
    </div>
  );
}

function SampleCard({ company, title, place, salary, featured }: { company: string; title: string; place: string; salary: string; featured?: boolean }) {
  return (
    <div className={`job-card px-4 py-4 ${featured ? "is-featured" : ""}`}>
      <div className="flex items-center gap-3">
        <CompanyLogo name={company} size={40} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[12.5px]">
            <span className="font-medium text-fg-2">{company}</span>
            {featured ? <span className="chip chip-featured h-5 px-2 text-[10.5px]">Featured</span> : null}
            <span className="text-muted">· Today</span>
          </p>
          <p className="mt-0.5 truncate text-[15px] font-semibold tracking-tight">{title}</p>
          <p className="mt-2 flex flex-wrap gap-1.5">
            <span className="chip">{place}</span>
            <span className="chip chip-salary tabular">{salary}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
