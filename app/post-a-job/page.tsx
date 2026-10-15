import { PostJobForm } from "@/components/post-job-form";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbLd, faqLd } from "@/lib/jsonld";
import { pageMeta } from "@/lib/seo";
import { FEATURED_ADDON_USD, FEATURED_PRICE_USD, LISTING_DAYS, STANDARD_PRICE_USD } from "@/lib/site";

export const metadata = pageMeta({
  title: "Post a design engineer job",
  description: `Post a software design engineer role for $${STANDARD_PRICE_USD} for ${LISTING_DAYS} days. Featured placement adds $${FEATURED_ADDON_USD}.`,
  path: "/post-a-job",
  index: true,
});

const FAQS = [
  {
    q: "When does the role go live?",
    a: "After Dodo Payments confirms the payment. The return page does not publish the listing. A webhook does, usually within a minute.",
  },
  {
    q: "What does the featured add-on change?",
    a: `A standard post is $${STANDARD_PRICE_USD} for ${LISTING_DAYS} days. Featured is an extra $${FEATURED_ADDON_USD} ($${FEATURED_PRICE_USD} total) and highlights the role at the top of the board for those same ${LISTING_DAYS} days.`,
  },
  {
    q: "What is hosted here?",
    a: "The description, company, location, and salary you submit. The apply button still sends candidates to your URL.",
  },
  {
    q: "What if the payment fails or I cancel?",
    a: "The listing stays unpublished. You can return to this form and check out again. A refund after publication expires the role.",
  },
  {
    q: "Will a hardware role be listed?",
    a: "Mechanical, hardware, chip, and audiovisual titles can be paid and still stay unpublished. This board is for software design engineers.",
  },
];

export default function PostJobPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <JsonLd data={breadcrumbLd([{ name: "Jobs", path: "/" }, { name: "Post a job", path: "/post-a-job" }])} />
      <JsonLd data={faqLd(FAQS)} />
      <p className="text-sm text-muted">Jobs / Post a job</p>
      <h1 className="mt-4 max-w-2xl text-5xl text-balance">Post a design engineer job</h1>
      <p className="mt-4 max-w-2xl text-[17px] leading-8 text-muted">
        ${STANDARD_PRICE_USD} puts a software role on the board for {LISTING_DAYS} days. Featured placement is ${FEATURED_ADDON_USD} more. The listing goes live when payment is confirmed.
      </p>
      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <aside className="rounded-2xl border border-line bg-chip/60 p-5 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1">
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
        <dl className="mt-4 divide-y divide-line border-y border-line">
          {FAQS.map((faq) => (
            <div key={faq.q} className="py-4">
              <dt className="font-medium">{faq.q}</dt>
              <dd className="mt-1 text-sm leading-6 text-muted">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
