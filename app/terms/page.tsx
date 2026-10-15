import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { breadcrumbLd } from "@/lib/jsonld";
import { pageMeta } from "@/lib/seo";
import { FEATURED_ADDON_USD, FEATURED_PRICE_USD, LISTING_DAYS, STANDARD_PRICE_USD } from "@/lib/site";

export const metadata = pageMeta({
  title: "Terms for posting a design engineer job",
  description: `Terms for posting a design engineer job. A standard listing is $${STANDARD_PRICE_USD} for ${LISTING_DAYS} days. Featured placement is $${FEATURED_ADDON_USD} more.`,
  path: "/terms",
  index: true,
});

export default function TermsPage() {
  return (
    <article>
      <JsonLd data={breadcrumbLd([{ name: "Jobs", path: "/" }, { name: "Terms", path: "/terms" }])} />
      <PageHeader
        narrow
        crumbs={[{ name: "Jobs", path: "/" }, { name: "Terms", path: "/terms" }]}
        kicker="Legal"
        title="Terms for posting a design engineer job"
        lede={<>Posting a design engineer job costs ${STANDARD_PRICE_USD} for {LISTING_DAYS} days. Featured placement is ${FEATURED_ADDON_USD} more, ${FEATURED_PRICE_USD} at checkout. The role goes live when payment is confirmed.</>}
      />
      <div className="mx-auto mt-10 max-w-3xl space-y-5 px-5 text-[16.5px] leading-8 text-fg-2 sm:px-6">
        <p>
          The role is published when Dodo Payments confirms the payment. Closing the checkout, a failed payment, or a missing payment status does not publish it. A refund expires the listing.
        </p>
        <p>
          You are responsible for the title, description, salary, and apply URL you submit. The apply link should be the original application. Mechanical, hardware, chip, and audiovisual roles can be paid and still stay unpublished.
        </p>
        <p>
          Ingested posts come from public employer boards. Design Code Jobs can correct or remove a listing that is closed, miscategorized, or not a software design role.
        </p>
        <p>
          The salary pages repeat employer-posted ranges. They are not an offer of pay and they are not converted between currencies.
        </p>
        <p>
          These terms describe how the board works. They are not a substitute for advice from a lawyer. See also the <Link href="/privacy" className="link">privacy page</Link>.
        </p>
      </div>
    </article>
  );
}
