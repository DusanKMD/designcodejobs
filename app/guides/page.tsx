import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { GUIDES } from "@/lib/catalog";
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
    <div className="mx-auto max-w-3xl px-5 py-10">
      <JsonLd data={breadcrumbLd([{ name: "Jobs", path: "/" }, { name: "Guides", path: "/guides" }])} />
      <p className="text-sm text-muted"><Link href="/" className="hover:text-fg">Jobs</Link> / Guides</p>
      <h1 className="mt-4 text-5xl text-balance">Guides for design engineers who code</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-fg">
        Guides for design engineers who code cover the role, the posted salary, and the job description. Figures in the salary guide come from the same open listings as the salary pages.
      </p>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {GUIDES.map((guide) => (
          <li key={guide.slug} className="py-4">
            <Link href={`/guides/${guide.slug}`} className="font-medium hover:underline">{guide.h1}</Link>
            <p className="mt-1 text-sm text-muted">{guide.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
