import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbLd } from "@/lib/jsonld";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "About Design Code Jobs",
  description: "Design Code Jobs lists software design engineer jobs for designers who code. Hardware and mechanical roles are filtered out.",
  path: "/about",
  index: true,
});

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-10">
      <JsonLd data={breadcrumbLd([{ name: "Jobs", path: "/" }, { name: "About", path: "/about" }])} />
      <p className="text-sm text-muted"><Link href="/" className="hover:text-fg">Jobs</Link> / About</p>
      <h1 className="mt-4 text-5xl text-balance">About Design Code Jobs</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-fg">
        Design Code Jobs is a job board for designers who code. It lists software design engineer, UX engineer, and design technologist roles, and it leaves mechanical work out.
      </p>
      <div className="mt-6 space-y-4 text-[17px] leading-8 text-muted">
        <p>
          Design Code Jobs lists software roles for designers who code: design engineers, UX engineers, UI engineers, design technologists, creative technologists, and design systems engineers. The phrase “design engineer” also means mechanical, hardware, chip, and AV work. Those jobs are filtered out.
        </p>
        <h2 className="pt-4 text-xl font-medium tracking-tight text-fg">Who is Design Code Jobs for?</h2>
        <p>
          Hiring managers posting a software interface role, and designers who write production UI. The problems are a title that also means hardware, salary pages full of mechanical averages, and a job description that never names a stack. The board keeps the software listings and shows pay only when the employer published it.
        </p>
        <p>
          Listings are read from public Greenhouse, Lever, and Ashby boards. The full description is hosted here, and the apply link goes to the original posting. Salary is shown only when the employer published it.
        </p>
        <p>
          A standard post is $129 for 30 days. Featured placement is an extra $99. Checkout uses Dodo Payments. The board is built to be indexed as job pages, with role, salary, remote, internship, and Framer pages aimed at the searches that actually have volume.
        </p>
        <p>
          <Link href="/post-a-job" className="text-fg underline underline-offset-4">Post a job</Link>
          {" · "}
          <Link href="/guides/what-is-a-design-engineer" className="text-fg underline underline-offset-4">What is a design engineer?</Link>
          {" · "}
          <Link href="/privacy" className="text-fg underline underline-offset-4">Privacy</Link>
          {" · "}
          <Link href="/terms" className="text-fg underline underline-offset-4">Terms</Link>
        </p>
        <h2 id="contact" className="pt-4 text-xl font-medium tracking-tight text-fg">Contact</h2>
        {/* TODO: no support email is configured. Publish it here when one exists. */}
        <p>A public support email is not configured yet.</p>
      </div>
    </article>
  );
}
