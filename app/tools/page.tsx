import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { Faq } from "@/components/ui";
import { breadcrumbLd, faqLd, itemListLd } from "@/lib/jsonld";
import { pageMeta } from "@/lib/seo";
import { INDEX_FAQS, INDEX_HOW, TOOLS } from "@/lib/tool-copy";

const PATH = "/tools";
const TITLE = "Free design engineer tools";
const DESCRIPTION = "Free design engineer tools. Check a resume, follow a portfolio checklist, write a job description, or estimate pay from ranges employers posted.";

export const metadata = pageMeta({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  index: true,
});

export default function ToolsPage() {
  const crumbs = [
    { name: "Jobs", path: "/" },
    { name: TITLE, path: PATH },
  ];
  return (
    <article>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd data={faqLd(INDEX_FAQS)} />
      <JsonLd data={itemListLd(TOOLS.map((tool) => ({ name: tool.title, path: tool.href, description: tool.summary })))} />
      <PageHeader
        crumbs={crumbs}
        kicker="Free tools"
        title={TITLE}
        lede={
          <p>
            Free design engineer tools for people who design and ship interface code, and for the teams hiring them. They read open listings on this board, or the text you paste, and they stay free to run. Posting a job is the only paid step.
          </p>
        }
      />
      <div className="mx-auto max-w-4xl px-5 sm:px-6">
        <ul className="mt-10 grid gap-3">
          {TOOLS.map((tool) => (
            <li key={tool.href}>
              <Link href={tool.href} className="card block p-5 transition-colors hover:border-line-strong sm:p-6">
                <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.12em] text-accent-text">{tool.audience}</p>
                <h2 className="mt-2 text-[22px] tracking-tight">{tool.title}</h2>
                <p className="mt-2 max-w-2xl text-[15px] leading-7 text-muted">{tool.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
        <section className="mt-14 max-w-3xl" aria-labelledby="tools-how">
          <h2 id="tools-how" className="text-[22px] tracking-tight sm:text-2xl">{INDEX_HOW.q}</h2>
          <p className="mt-3 text-[15.5px] leading-7 text-fg-2">{INDEX_HOW.a}</p>
        </section>
        <div className="mt-14 max-w-3xl">
          <Faq id="tools-faq" kicker="Questions" title="Questions about these tools" items={INDEX_FAQS} />
        </div>
      </div>
    </article>
  );
}
