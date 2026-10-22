import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumbs } from "@/components/ui";
import { GUIDES, guideBySlug } from "@/lib/catalog";
import { formatDate } from "@/lib/format";
import { breadcrumbLd, faqLd } from "@/lib/jsonld";
import { guideFaqs } from "@/lib/guide-faqs";
import { pageMeta } from "@/lib/seo";
import { absoluteUrl, LISTING_DAYS, STANDARD_PRICE_USD } from "@/lib/site";

const loaders = {
  "what-is-a-design-engineer": () => import("@/content/guides/what-is-a-design-engineer.mdx"),
  "design-engineer-salary": () => import("@/content/guides/design-engineer-salary.mdx"),
  "design-engineer-job-description": () => import("@/content/guides/design-engineer-job-description.mdx"),
  "design-technologist": () => import("@/content/guides/design-technologist.mdx"),
  "ux-engineer": () => import("@/content/guides/ux-engineer.mdx"),
} as const;

function readingMinutes(slug: string) {
  try {
    const words = readFileSync(join(process.cwd(), "content/guides", `${slug}.mdx`), "utf8").split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 230));
  } catch {
    return null;
  }
}

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) return {};
  return pageMeta({
    title: guide.title,
    description: guide.description,
    path: `/guides/${slug}`,
    index: true,
    ogType: "article",
    image: `/guides/${slug}/opengraph-image`,
  });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  const load = loaders[slug as keyof typeof loaders];
  if (!guide || !load) notFound();
  const Content = (await load()).default;
  const minutes = readingMinutes(slug);
  const organization = { "@type": "Organization", name: "Design Code Jobs", url: absoluteUrl("/"), logo: absoluteUrl("/logo/designcodejobs") };
  const article = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: guide.h1,
    description: guide.description,
    datePublished: guide.published,
    dateModified: guide.updated,
    author: organization,
    publisher: organization,
    image: absoluteUrl(`/guides/${slug}/opengraph-image`),
    mainEntityOfPage: absoluteUrl(`/guides/${slug}`),
    inLanguage: "en",
  };
  const others = GUIDES.filter((item) => item.slug !== slug);

  return (
    <article>
      <JsonLd data={breadcrumbLd([{ name: "Jobs", path: "/" }, { name: "Guides", path: "/guides" }, { name: guide.title, path: `/guides/${slug}` }])} />
      <JsonLd data={article} />
      {guideFaqs[slug as keyof typeof guideFaqs] ? <JsonLd data={faqLd([...guideFaqs[slug as keyof typeof guideFaqs]])} /> : null}

      <div className="relative overflow-hidden border-b border-line">
        <div className="canvas canvas-fade absolute inset-0 -z-10" aria-hidden />
        <div className="glow absolute inset-0 -z-10" aria-hidden />
        <div className="mx-auto max-w-3xl px-5 pb-2 pt-8 sm:px-6 sm:pt-10">
          <Breadcrumbs crumbs={[{ name: "Jobs", path: "/" }, { name: "Guides", path: "/guides" }, { name: guide.title, path: `/guides/${slug}` }]} />
          <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
            <span className="chip chip-accent">Guide</span>
            {minutes ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={13} /> {minutes} min read
              </span>
            ) : null}
            <span>
              Updated <time dateTime={guide.updated}>{formatDate(guide.updated)}</time> by the Design Code Jobs editors
            </span>
          </p>
        </div>
        <div className="guide mx-auto max-w-3xl px-5 pb-16 sm:px-6">
          <Content />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          <Link href="/" className="group card p-5 transition-colors hover:border-line-strong">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent-text">For candidates</p>
            <p className="mt-2 font-semibold tracking-tight">Browse design engineer jobs</p>
            <p className="mt-1 text-sm text-muted">Software roles only, with the description hosted here.</p>
            <ArrowRight className="arrow mt-4 text-muted" />
          </Link>
          <Link href="/post-a-job" className="group card p-5 transition-colors hover:border-line-strong">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent-text">For hiring teams</p>
            <p className="mt-2 font-semibold tracking-tight">Post a design engineer job</p>
            <p className="mt-1 text-sm text-muted">
              ${STANDARD_PRICE_USD} for {LISTING_DAYS} days, live within a minute of payment.
            </p>
            <ArrowRight className="arrow mt-4 text-muted" />
          </Link>
        </div>
        {others.length ? (
          <nav className="mt-12" aria-label="More guides">
            <p className="text-[13px] font-semibold">More guides</p>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {others.map((item) => (
                <li key={item.slug}>
                  <Link href={`/guides/${item.slug}`} className="group flex items-center justify-between gap-4 py-4">
                    <span>
                      <span className="block font-medium text-fg">{item.h1}</span>
                      <span className="mt-0.5 block text-sm text-muted">{item.description}</span>
                    </span>
                    <ArrowRight className="arrow shrink-0 text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </article>
  );
}
