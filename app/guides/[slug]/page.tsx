import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { GUIDES, guideBySlug } from "@/lib/catalog";
import { breadcrumbLd } from "@/lib/jsonld";
import { pageMeta } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

const loaders = {
  "what-is-a-design-engineer": () => import("@/content/guides/what-is-a-design-engineer.mdx"),
  "design-engineer-salary": () => import("@/content/guides/design-engineer-salary.mdx"),
  "design-engineer-job-description": () => import("@/content/guides/design-engineer-job-description.mdx"),
} as const;

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
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.h1,
    description: guide.description,
    author: { "@type": "Organization", name: "Design Code Jobs" },
    image: absoluteUrl(`/guides/${slug}/opengraph-image`),
    mainEntityOfPage: absoluteUrl(`/guides/${slug}`),
  };
  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      <JsonLd data={breadcrumbLd([{ name: "Jobs", path: "/" }, { name: "Guides", path: "/guides" }, { name: guide.title, path: `/guides/${slug}` }])} />
      <JsonLd data={article} />
      <p className="text-sm text-muted">
        <Link href="/guides" className="hover:text-fg">Guides</Link>
      </p>
      <div className="mt-4">
        <Content />
      </div>
    </article>
  );
}
