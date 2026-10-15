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
      <p className="text-sm text-muted">Jobs / Post a job</p>
      <h1 className="mt-4 max-w-2xl text-5xl text-balance">Post a design engineer job</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-fg">
        Post a design engineer job for ${STANDARD_PRICE_USD}. The listing stays up for {LISTING_DAYS} days, and featured placement is ${FEATURED_ADDON_USD} more. It goes live when payment is confirmed, not when you return from checkout.
      </p>
      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <aside className="rounded-md border border-line bg-chip/60 p-5 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1">
          <h2 className="text-lg font-medium tracking-tight">Pricing</h2>
          <div className="mt-4 border-b border-line pb-4">
            <p className="text-sm text-muted">Standard</p>
            <p className="mt-1 text-3xl tabular-nums">${STANDARD_PRICE_USD}</p>
            <ul className="mt-3 space-y-1.5 text-sm leading-6 text-muted">
              <li>{LISTING_DAYS} days on the board</li>
              <li>Full description hosted here</li>
              <li>Apply link to your posting</li>
              <li>Included in search, role, and salary pages when it matches</li>
            </ul>
          </div>
          <div className="pt-4">
            <p className="text-sm text-muted">Featured add-on</p>
            <p className="mt-1 text-3xl tabular-nums">+${FEATURED_ADDON_USD}</p>
            <p className="mt-3 text-sm leading-6 text-muted">
              Highlighted above the open list for the same {LISTING_DAYS} days. Checkout total ${FEATURED_PRICE_USD}.
            </p>
          </div>
        </aside>
        <div className="lg:col-start-1 lg:row-start-1">
          <PostJobForm />
        </div>
      </div>
      <section className="mt-16 max-w-2xl" aria-labelledby="post-faq">
        <h2 id="post-faq" className="text-lg font-medium tracking-tight">Questions</h2>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {FAQS.map((faq) => (
            <div key={faq.q} className="py-4">
              <h3 className="font-medium">{faq.q}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
