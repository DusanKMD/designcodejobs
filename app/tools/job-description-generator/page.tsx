import Link from "next/link";
import { JobDescriptionForm } from "@/components/job-description-form";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { Faq } from "@/components/ui";
import { breadcrumbLd, faqLd, webApplicationLd } from "@/lib/jsonld";
import { pageMeta } from "@/lib/seo";
import { JD_FAQS, JD_HOW } from "@/lib/tool-copy";

const PATH = "/tools/job-description-generator";
const TITLE = "Design engineer job description generator";
const DESCRIPTION = "Free design engineer job description generator. Draft a software posting from role, level, stack, location, and salary, then post it here.";

export const metadata = pageMeta({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  index: true,
});

export default function JobDescriptionPage() {
  const crumbs = [
    { name: "Jobs", path: "/" },
    { name: "Free design engineer tools", path: "/tools" },
    { name: TITLE, path: PATH },
  ];
  return (
    <article>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd data={faqLd(JD_FAQS)} />
      <JsonLd data={webApplicationLd({ name: TITLE, description: DESCRIPTION, path: PATH })} />
      <PageHeader
        crumbs={crumbs}
        kicker="Free tool"
        title={TITLE}
        narrow
        lede={
          <p>
            A design engineer job description generator writes a software posting you can edit. It names the surface, the stack, the level, and the salary range you choose to publish. It does not fill in a salary you did not type.
          </p>
        }
      />
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <section className="mt-10" aria-labelledby="generator-heading">
          <h2 id="generator-heading" className="sr-only">Generate a job description</h2>
          <JobDescriptionForm />
        </section>
        <section className="mx-auto mt-14 max-w-3xl" aria-labelledby="jd-how">
          <h2 id="jd-how" className="text-[22px] tracking-tight sm:text-2xl">{JD_HOW.q}</h2>
          <p className="mt-3 text-[15.5px] leading-7 text-fg-2">{JD_HOW.a}</p>
          <p className="mt-3 text-[15px] leading-7 text-muted">
            The structure comes from the <Link href="/guides/design-engineer-job-description" className="link">design engineer job description</Link> guide. Ranges employers have already posted are on <Link href="/salary" className="link">design engineer salary</Link>.
          </p>
        </section>
        <div className="mx-auto mt-14 max-w-3xl">
          <Faq id="jd-faq" kicker="Questions" title="Job description questions" items={JD_FAQS} />
        </div>
      </div>
    </article>
  );
}
