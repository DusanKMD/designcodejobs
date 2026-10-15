import Link from "next/link";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "About",
  description: "Design Code Jobs is a niche board for software design engineers, UX engineers, and designers who code.",
  path: "/about",
  index: true,
});

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="text-4xl font-medium tracking-tight">About</h1>
      <div className="mt-6 space-y-4 text-[15px] leading-7 text-muted">
        <p>
          Design Code Jobs lists software roles for designers who code: design engineers, UX engineers, UI engineers, design technologists, creative technologists, and design systems engineers. The phrase “design engineer” also means mechanical, hardware, chip, and AV work. Those jobs are filtered out.
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
        </p>
      </div>
    </article>
  );
}
