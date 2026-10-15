import Link from "next/link";
import { PostJobForm } from "@/components/post-job-form";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbLd, faqLd } from "@/lib/jsonld";
import { pageMeta } from "@/lib/seo";
import { FEATURED_ADDON_USD, FEATURED_PRICE_USD, LISTING_DAYS, STANDARD_PRICE_USD } from "@/lib/site";

export const metadata = pageMeta({
  title: "Post a design engineer job",
  description: `Post a design engineer job for $${STANDARD_PRICE_USD} for ${LISTING_DAYS} days. Featured placement adds $${FEATURED_ADDON_USD}. The listing goes live when payment is confirmed.`,
  path: "/post-a-job",
  index: true,
});

const FAQS = [
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

export default function PostJobPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <JsonLd data={breadcrumbLd([{ name: "Jobs", path: "/" }, { name: "Post a job", path: "/post-a-job" }])} />
      <JsonLd data={faqLd(FAQS)} />
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-fg">Jobs</Link>
        <span className="mx-2 text-line">/</span>
        <span className="text-fg">Post a job</span>
      </nav>
      <h1 className="mt-4 max-w-2xl text-4xl text-balance sm:text-5xl">Post a design engineer job</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-fg">
        Post a design engineer job for ${STANDARD_PRICE_USD}. The listing stays up for {LISTING_DAYS} days, and featured placement is ${FEATURED_ADDON_USD} more. It goes live when payment is confirmed, not when you return from checkout.
      </p>
      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <aside className="card p-6 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1">
          <h2 className="text-2xl font-bold tracking-tight">Pricing</h2>
          <p className="mt-4 text-sm font-medium text-muted">Standard post</p>
          <p className="mt-1 text-5xl font-bold tracking-tight tabular-nums">${STANDARD_PRICE_USD}</p>
          <p className="mt-1 text-sm text-muted">for {LISTING_DAYS} days</p>
          <ul className="mt-5 space-y-2.5 text-sm">
            <Check>{LISTING_DAYS} days on the board</Check>
            <Check>Full description hosted here</Check>
            <Check>Apply link to your original posting</Check>
            <Check>Included in search, role, and salary pages when it matches</Check>
          </ul>
          <div className="mt-5 rounded-2xl bg-chip px-4 py-4">
            <p className="font-semibold">Featured <span className="text-accent">+${FEATURED_ADDON_USD}</span></p>
            <ul className="mt-3 space-y-2 text-sm">
              <Check>Highlighted above the open list</Check>
              <Check>Same {LISTING_DAYS} days, not an extension</Check>
              <Check>Checkout total ${FEATURED_PRICE_USD}</Check>
            </ul>
          </div>
          <p className="mt-5 text-xs leading-5 text-muted">
            Secure checkout via Dodo Payments. Card numbers are handled by Dodo and are not stored here. A refund after the listing is published expires the role. A failed or cancelled checkout leaves it unpublished.
          </p>
        </aside>
        <div className="lg:col-start-1 lg:row-start-1">
          <PostJobForm />
        </div>
      </div>
      <section className="mt-16 max-w-2xl" aria-labelledby="post-faq">
        <h2 id="post-faq" className="text-2xl font-bold tracking-tight">Questions</h2>
        <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-card px-5">
          {FAQS.map((faq) => (
            <div key={faq.q} className="py-4">
              <h3 className="font-semibold">{faq.q}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden>
        <path fill="currentColor" d="M6.2 11.6 2.8 8.2l1.1-1.1 2.3 2.3 5-5 1.1 1.1-6.1 6.1z" />
      </svg>
      <span>{children}</span>
    </li>
  );
}
