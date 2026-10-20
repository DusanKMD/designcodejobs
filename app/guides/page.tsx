import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { GUIDES } from "@/lib/catalog";
import { formatDate } from "@/lib/format";
import { breadcrumbLd } from "@/lib/jsonld";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Guides for design engineers who code",
  description: "What a design engineer is, how software design engineer salary is counted, and how to write the job description.",
  path: "/guides",
  index: true,
});

export default function GuidesPage() {
  return (
    <div>
      <JsonLd data={breadcrumbLd([{ name: "Jobs", path: "/" }, { name: "Guides", path: "/guides" }])} />
      <PageHeader
        crumbs={[{ name: "Jobs", path: "/" }, { name: "Guides", path: "/guides" }]}
        kicker="Guides"
        title="Guides for design engineers who code"
        lede="Guides for design engineers who code cover the role, the posted salary, and the job description. Figures in the salary guide come from the same open listings as the salary pages."
      />
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {GUIDES.map((guide, index) => (
            <li key={guide.slug}>
              <Link href={`/guides/${guide.slug}`} className="group job-card flex h-full flex-col p-6">
                <span className="font-mono text-[12px] text-accent-text">0{index + 1}</span>
                <span className="mt-3 text-xl font-semibold leading-snug tracking-tight text-fg">{guide.h1}</span>
                <span className="mt-2 flex-1 text-sm leading-6 text-muted">{guide.description}</span>
                <span className="mt-6 flex items-center justify-between text-[13px] text-muted">
                  <span>Updated {formatDate(guide.updated)}</span>
                  <ArrowRight className="arrow" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
