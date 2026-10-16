import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { PortfolioChecklist } from "@/components/portfolio-checklist";
import { Faq } from "@/components/ui";
import { breadcrumbLd, faqLd, webApplicationLd } from "@/lib/jsonld";
import { checklistCounts } from "@/lib/portfolio-checklist";
import { listedJobs } from "@/lib/query";
import { pageMeta } from "@/lib/seo";
import { getAllJobs } from "@/lib/store";
import { PORTFOLIO_FAQS, PORTFOLIO_HOW } from "@/lib/tool-copy";

const PATH = "/tools/design-engineer-portfolio-checklist";
const TITLE = "Design engineer portfolio checklist";
const DESCRIPTION = "Free design engineer portfolio checklist. Track what open listings ask for, save progress in this browser, and share or print the list.";

export const metadata = pageMeta({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  index: true,
});

export default async function PortfolioChecklistPage() {
  const jobs = listedJobs(await getAllJobs());
  const counts = checklistCounts(jobs.map((job) => `${job.title}\n${job.descriptionText}`));
  const crumbs = [
    { name: "Jobs", path: "/" },
    { name: "Free design engineer tools", path: "/tools" },
    { name: TITLE, path: PATH },
  ];
  return (
    <article>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd data={faqLd(PORTFOLIO_FAQS)} />
      <JsonLd data={webApplicationLd({ name: TITLE, description: DESCRIPTION, path: PATH })} />
      <PageHeader
        crumbs={crumbs}
        kicker="Free tool"
        title={TITLE}
        lede={
          <p>
            A design engineer portfolio checklist tracks the proof open listings ask to see: shipped UI, a prototype, a design system, and code a reviewer can run. Check an item when that proof is in your work. Progress stays in this browser.
          </p>
        }
      />
      <div className="mx-auto max-w-4xl px-5 sm:px-6">
        <section className="mt-10" aria-labelledby="checklist-heading">
          <h2 id="checklist-heading" className="sr-only">Portfolio checklist</h2>
          <PortfolioChecklist counts={counts} />
        </section>
        <section className="mt-14 max-w-3xl" aria-labelledby="portfolio-how">
          <h2 id="portfolio-how" className="text-[22px] tracking-tight sm:text-2xl">{PORTFOLIO_HOW.q}</h2>
          <p className="mt-3 text-[15.5px] leading-7 text-fg-2">{PORTFOLIO_HOW.a}</p>
          <p className="mt-3 text-[15px] leading-7 text-muted">
            Pair the list with the <Link href="/tools/design-engineer-resume-checker" className="link">design engineer resume checker</Link>. Open roles that ask for this work are on <Link href="/roles/design-engineer" className="link">software design engineer jobs</Link>.
          </p>
        </section>
        <div className="mt-14 max-w-3xl">
          <Faq id="portfolio-faq" kicker="Questions" title="Portfolio checklist questions" items={PORTFOLIO_FAQS} />
        </div>
      </div>
    </article>
  );
}
