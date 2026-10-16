import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { ResumeChecker } from "@/components/resume-checker";
import { Faq } from "@/components/ui";
import { listingKeywords } from "@/lib/listing-keywords";
import { breadcrumbLd, faqLd, webApplicationLd } from "@/lib/jsonld";
import { listedJobs } from "@/lib/query";
import { pageMeta } from "@/lib/seo";
import { getAllJobs } from "@/lib/store";
import { RESUME_FAQS, RESUME_HOW } from "@/lib/tool-copy";

const PATH = "/tools/design-engineer-resume-checker";
const TITLE = "Design engineer resume checker";
const DESCRIPTION = "Free design engineer resume checker. Score pasted text from 0 to 100 on shipped UI, stack, impact, links, length, and ATS safety.";

export const metadata = pageMeta({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  index: true,
});

export default async function ResumeCheckerPage() {
  const jobs = listedJobs(await getAllJobs());
  const keywords = listingKeywords(jobs.map((job) => `${job.title}\n${job.descriptionText}`));
  const crumbs = [
    { name: "Jobs", path: "/" },
    { name: "Free design engineer tools", path: "/tools" },
    { name: TITLE, path: PATH },
  ];
  return (
    <article>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd data={faqLd(RESUME_FAQS)} />
      <JsonLd data={webApplicationLd({ name: TITLE, description: DESCRIPTION, path: PATH })} />
      <PageHeader
        crumbs={crumbs}
        kicker="Free tool"
        title={TITLE}
        lede={
          <p>
            A design engineer resume checker scores the text you paste from 0 to 100. The rubric looks for shipped interface work, a front-end stack, a number that says what changed, and a portfolio or GitHub link. Keywords come from open listings on this board.
          </p>
        }
      />
      <div className="mx-auto max-w-4xl px-5 sm:px-6">
        <section className="mt-10" aria-labelledby="checker-heading">
          <h2 id="checker-heading" className="sr-only">Score a resume</h2>
          <ResumeChecker keywords={keywords} />
        </section>
        <section className="mt-10" aria-labelledby="keyword-heading">
          <h2 id="keyword-heading" className="text-[22px] tracking-tight sm:text-2xl">Keywords from live listings</h2>
          {keywords.length ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {keywords.slice(0, 12).map((item) => (
                <li key={item.term} className="rounded-full border border-line bg-card px-3 py-1 text-[13px] text-fg-2">
                  {item.term}
                  <span className="ml-2 font-mono text-[11px] tabular text-muted">{item.listings}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">No open listing has description text yet, so there are no keywords to count.</p>
          )}
          <p className="mt-3 max-w-3xl text-[14.5px] leading-7 text-muted">
            The number is how many open listings mention the term. Frequency inside those descriptions breaks ties. The list updates with the board.
          </p>
        </section>
        <section className="mt-14 max-w-3xl" aria-labelledby="resume-how">
          <h2 id="resume-how" className="text-[22px] tracking-tight sm:text-2xl">{RESUME_HOW.q}</h2>
          <p className="mt-3 text-[15.5px] leading-7 text-fg-2">{RESUME_HOW.a}</p>
          <p className="mt-3 text-[15px] leading-7 text-muted">
            When the score shows a missing portfolio link, the <Link href="/tools/design-engineer-portfolio-checklist" className="link">design engineer portfolio checklist</Link> is the next pass.
          </p>
        </section>
        <div className="mt-14 max-w-3xl">
          <Faq id="resume-faq" kicker="Questions" title="Resume checker questions" items={RESUME_FAQS} />
        </div>
      </div>
    </article>
  );
}
