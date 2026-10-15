import Link from "next/link";
import { ArrowRight, Check, Eye, Inbox, Layers, Shield } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/ui";
import { loadCompanies } from "@/lib/companies";
import { breadcrumbLd } from "@/lib/jsonld";
import { filterJobs } from "@/lib/query";
import { pageMeta } from "@/lib/seo";
import { FEATURED_ADDON_USD, LISTING_DAYS, STANDARD_PRICE_USD } from "@/lib/site";
import { getAllJobs } from "@/lib/store";

export const metadata = pageMeta({
  title: "About Design Code Jobs",
  description: "Design Code Jobs lists software design engineer jobs for designers who code. Hardware and mechanical roles are filtered out.",
  path: "/about",
  index: true,
});

const PRINCIPLES = [
  { icon: <Eye />, title: "Software roles only", body: "Mechanical, hardware, chip, and AV design jobs share the title. They are filtered out, before and after payment." },
  { icon: <Shield />, title: "Real salary or none", body: "Pay is shown only when the employer published it. No estimates, no crowdsourced averages, no currency conversion." },
  { icon: <Layers />, title: "The description lives here", body: "Every role has its own page with the full text, so you can read it without a login wall and share it." },
  { icon: <Inbox />, title: "Apply at the source", body: "The apply button goes to the employer’s original posting. This site never collects resumes." },
];

export default async function AboutPage() {
  const open = filterJobs(await getAllJobs(), {});
  const companies = new Set(open.map((job) => job.companySlug)).size;
  const watched = loadCompanies().length;
  const facts = [
    ["What it is", "A job board for design engineers: software designers who code."],
    ["Who it lists", "Design engineers, UX engineers, UI engineers, design technologists, creative technologists, and design systems engineers."],
    ["Where roles come from", `${watched} public Greenhouse, Lever, and Ashby boards, plus paid posts.`],
    ["Right now", `${open.length} open roles at ${companies} companies.`],
    ["Price to post", `$${STANDARD_PRICE_USD} for ${LISTING_DAYS} days. Featured placement is $${FEATURED_ADDON_USD} more.`],
  ];

  return (
    <article>
      <JsonLd data={breadcrumbLd([{ name: "Jobs", path: "/" }, { name: "About", path: "/about" }])} />
      <PageHeader
        crumbs={[{ name: "Jobs", path: "/" }, { name: "About", path: "/about" }]}
        kicker="About"
        title="About Design Code Jobs"
        lede="Design Code Jobs is a job board for designers who code. It lists software design engineer, UX engineer, and design technologist roles, and it leaves mechanical work out."
      />

      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5 text-[16.5px] leading-8 text-fg-2">
            <p>
              Design Code Jobs lists software roles for designers who code: design engineers, UX engineers, UI engineers, design technologists, creative technologists, and design systems engineers. The phrase “design engineer” also means mechanical, hardware, chip, and AV work. Those jobs are filtered out.
            </p>
            <h2 className="pt-4 text-2xl tracking-tight text-fg">Who is Design Code Jobs for?</h2>
            <p>
              Hiring managers posting a software interface role, and designers who write production UI. The problems are a title that also means hardware, salary pages full of mechanical averages, and a job description that never names a stack. The board keeps the software listings and shows pay only when the employer published it.
            </p>
            <p>
              Listings are read from public Greenhouse, Lever, and Ashby boards. The full description is hosted here, and the apply link goes to the original posting. Salary is shown only when the employer published it.
            </p>
            <p>
              A standard post is ${STANDARD_PRICE_USD} for {LISTING_DAYS} days. Featured placement is an extra ${FEATURED_ADDON_USD}. Checkout uses Dodo Payments. The board is built to be indexed as job pages, with role, salary, remote, internship, and Framer pages aimed at the searches that actually have volume.
            </p>
            <h2 id="contact" className="scroll-mt-24 pt-4 text-2xl tracking-tight text-fg">Contact</h2>
            {/* TODO: no support email is configured. Publish it here when one exists. */}
            <p>A public support email is not configured yet.</p>
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card overflow-hidden">
              <p className="border-b border-line px-5 py-3 text-[13px] font-semibold">At a glance</p>
              <dl className="divide-y divide-line">
                {facts.map(([label, value]) => (
                  <div key={label} className="px-5 py-3.5">
                    <dt className="text-[12px] font-medium text-muted">{label}</dt>
                    <dd className="mt-0.5 text-sm leading-6 text-fg">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>

        <section className="reveal mt-20" aria-labelledby="principles-heading">
          <SectionHeading id="principles-heading" kicker="How the board works" title="Four rules every listing follows" />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map((item) => (
              <li key={item.title} className="card p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent-text">{item.icon}</span>
                <h3 className="mt-4 text-[15px] font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-6 text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-14 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary btn-lg">
            Browse open roles <ArrowRight className="arrow" />
          </Link>
          <Link href="/post-a-job" className="btn btn-secondary btn-lg">
            Post a job
          </Link>
          <Link href="/guides/what-is-a-design-engineer" className="btn btn-ghost btn-lg">
            <Check /> What is a design engineer?
          </Link>
        </div>
      </div>
    </article>
  );
}
