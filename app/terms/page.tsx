import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbLd } from "@/lib/jsonld";
import { pageMeta } from "@/lib/seo";
import { FEATURED_ADDON_USD, FEATURED_PRICE_USD, LISTING_DAYS, STANDARD_PRICE_USD } from "@/lib/site";

export const metadata = pageMeta({
  title: "Terms",
  description: `Terms for posting a job on Design Code Jobs. Standard listings are $${STANDARD_PRICE_USD} for ${LISTING_DAYS} days.`,
  path: "/terms",
  index: true,
});

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      <JsonLd data={breadcrumbLd([{ name: "Jobs", path: "/" }, { name: "Terms", path: "/terms" }])} />
      <h1 className="text-5xl">Terms</h1>
      <div className="mt-8 space-y-4 text-[17px] leading-8 text-muted">
        <p>
          A standard listing is ${STANDARD_PRICE_USD} for {LISTING_DAYS} days. Featured placement is an additional ${FEATURED_ADDON_USD}, for a checkout total of ${FEATURED_PRICE_USD}, and highlights the role for those same {LISTING_DAYS} days.
        </p>
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
          These terms describe how the board works. They are not a substitute for advice from a lawyer. See also the <Link href="/privacy" className="text-fg underline underline-offset-4">privacy page</Link>.
        </p>
      </div>
    </article>
  );
}
