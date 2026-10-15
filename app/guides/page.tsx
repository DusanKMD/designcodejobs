import Link from "next/link";
import { GUIDES } from "@/lib/catalog";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Guides",
  description: "What a design engineer is, how software design engineer salary is counted, and how to write the job description.",
  path: "/guides",
  index: true,
});

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="text-5xl">Guides</h1>
      <p className="mt-4 text-[15px] leading-7 text-muted">
        What the role is, how posted salary is counted, and how to write the job description. Pay figures in the salary guide are rendered from the same open listings as the salary pages.
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
