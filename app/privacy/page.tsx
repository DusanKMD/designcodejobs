import { JsonLd } from "@/components/json-ld";
import { breadcrumbLd } from "@/lib/jsonld";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Privacy policy for Design Code Jobs",
  description: "Privacy policy for what Design Code Jobs stores: public job posts, paid listing details, and alert emails. Card numbers stay with the payment processor.",
  path: "/privacy",
  index: true,
});

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      <JsonLd data={breadcrumbLd([{ name: "Jobs", path: "/" }, { name: "Privacy", path: "/privacy" }])} />
      <h1 className="text-5xl text-balance">Privacy policy for Design Code Jobs</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-fg">
        Design Code Jobs reads public Greenhouse, Lever, and Ashby job posts and hosts the description on this site. Those posts were already public. Salary is shown only when the employer published it.
      </p>
      <div className="mt-8 space-y-4 text-[17px] leading-8 text-muted">
        <p>
          A paid listing stores the work email, company, job text, apply URL, and salary you submit, so the role can be published after payment. Card numbers are handled by Dodo Payments. This site stores the payment id that Dodo sends, not the card.
        </p>
        <p>
          The email alert form stores the address you enter. No message is sent until an email provider is connected. The form includes a hidden field that is ignored when filled in.
        </p>
        <p>
          The review queue is private and gated by a server secret. It is not indexed.
        </p>
        <p>
          This site does not sell personal information. It does not run a third-party advertising pixel.
        </p>
        {/* TODO: no support email is configured. Replace this sentence when one exists. */}
        <p id="contact">
          A public support email is not configured yet. Questions about a listing can wait until that address is published on the about page.
        </p>
      </div>
    </article>
  );
}
