import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { JobList } from "@/components/job-list";
import { PageHeader } from "@/components/page-header";
import { Faq, LinkPills, SectionHeading, StatStrip } from "@/components/ui";
import { roleBySlug, salaryRoleBySlug, SALARY_ROLES } from "@/lib/catalog";
import { formatMoney, formatSalary } from "@/lib/format";
import { breadcrumbLd, datasetLd, faqLd } from "@/lib/jsonld";
import { listedJobs, medianSalary, salaryBands } from "@/lib/query";
import { pageMeta } from "@/lib/seo";
import { getAllJobs } from "@/lib/store";

export function generateStaticParams() {
  return SALARY_ROLES.map((role) => ({ slug: role.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const role = salaryRoleBySlug(slug);
  if (!role) return {};
  const jobs = listedJobs(await getAllJobs()).filter((job) => job.titleFamily === role.family && job.salaryUnit === "YEAR");
  return pageMeta({
    title: role.title,
    description: role.description,
    path: `/salary/${slug}`,
    index: jobs.length >= 1,
  });
}

export default async function RoleSalaryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const role = salaryRoleBySlug(slug);
  if (!role) notFound();
  const jobs = listedJobs(await getAllJobs()).filter((job) => job.titleFamily === role.family);
  const paid = jobs.filter((job) => job.salaryUnit === "YEAR" && job.salaryMin != null);
  const unpaid = jobs.filter((job) => !paid.includes(job));
  const mid = medianSalary(paid);
  const bands = salaryBands(paid);
  const label = role.h1.replace(" salary", "");
  const lower = label.charAt(1) === label.charAt(1).toUpperCase() ? label : label.charAt(0).toLowerCase() + label.slice(1);
  const jobsHub = role.family !== "all" ? roleBySlug(role.family) : null;
  const share = jobs.length ? Math.round((paid.length / jobs.length) * 100) : 0;
  const money = (value: number, currency: string) => formatMoney(value, currency);

  const faqs = [
    {
      q: `What does a ${lower} earn?`,
      a: paid.length && mid
        ? `Across ${paid.length} open ${paid.length === 1 ? "posting" : "postings"} that publish yearly base pay, the median midpoint is ${money(mid.value, mid.currency)}. ${bands.map((band) => `${band.currency} ranges run ${money(band.min, band.currency)} to ${money(band.max, band.currency)}`).join("; ")}. These are employer-posted ranges for software roles, not survey averages.`
        : `No open ${lower} posting on this board publishes a yearly base yet. The range appears here as soon as an employer includes one. Until then, the design engineer salary page has the wider dataset across related software titles.`,
    },
    {
      q: `How often do ${lower} postings include salary?`,
      a: `${paid.length} of ${jobs.length} open ${lower} ${jobs.length === 1 ? "role" : "roles"} on the board ${paid.length === 1 ? "publishes" : "publish"} a yearly range, about ${share}%. Pay transparency laws in states like New York, California, Colorado, and Washington require a range on many US postings, so US roles publish pay more often.`,
    },
    {
      q: "Why not use a salary site average?",
      a: `Salary sites mix this title with mechanical, hardware, and civil design jobs, because the words overlap. This page counts only software postings with a published base, so the number reflects interface work. Equity, bonus, and total compensation are left out because few employers publish them.`,
    },
  ];

  return (
    <article>
      <JsonLd data={breadcrumbLd([{ name: "Jobs", path: "/" }, { name: "Design engineer salary", path: "/salary" }, { name: role.h1, path: `/salary/${slug}` }])} />
      <JsonLd data={datasetLd({ name: role.h1, description: role.description, path: `/salary/${slug}` })} />
      <JsonLd data={faqLd(faqs)} />
      <PageHeader
        crumbs={[{ name: "Jobs", path: "/" }, { name: "Salary", path: "/salary" }, { name: role.h1, path: `/salary/${slug}` }]}
        kicker="Salary data"
        title={role.h1}
        lede={role.description}
      >
        <div className="mt-8 max-w-3xl">
          <StatStrip
            stats={[
              { label: "Median posted midpoint", value: mid ? money(mid.value, mid.currency) : "—" },
              { label: "Ranges counted", value: String(paid.length) },
              { label: `Open ${lower} roles`, value: String(jobs.length) },
              { label: "Share with salary", value: `${share}%` },
            ]}
          />
        </div>
      </PageHeader>

      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <div className="mt-10 space-y-4 text-[15.5px] leading-7 text-fg-2">
          <p>
            {paid.length
              ? `${paid.length} open ${paid.length === 1 ? "posting publishes" : "postings publish"} yearly base pay${mid ? `. The median midpoint is ${money(mid.value, mid.currency)}` : ""}. Figures below are copied from the employer, and the same numbers are the only ones eligible for salary markup on the job page.`
              : `No open ${lower} posting includes a base salary yet. This page stays up so the range can appear as soon as an employer publishes one. It is not filled with estimates.`}
          </p>
          {jobsHub ? <p>{jobsHub.description}</p> : null}
          <p>
            Each range is the yearly base the employer wrote on a software posting, kept in its original currency. Equity, bonus, and on-target earnings are not added in, and nothing is converted between currencies. When a role closes, its range leaves this page at the next board sync.
          </p>
        </div>

        <section className="reveal mt-12" aria-labelledby="ranges-heading">
          <SectionHeading id="ranges-heading" kicker="Posted ranges" title={`${label} postings with pay`} />
          <ul className="card mt-5 divide-y divide-line">
            {paid.length ? (
              paid.map((job) => (
                <li key={job.id}>
                  <Link href={`/jobs/${job.slug}`} className="flex flex-col gap-1 px-5 py-3.5 transition-colors hover:bg-chip/50 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      <span className="block font-medium">{job.title}</span>
                      <span className="text-[13px] text-muted">{job.companyName}</span>
                    </span>
                    <span className="chip chip-salary tabular">{formatSalary(job)}</span>
                  </Link>
                </li>
              ))
            ) : (
              <li className="px-5 py-6 text-sm text-muted">No posted ranges yet.</li>
            )}
          </ul>
        </section>

        {unpaid.length ? (
          <section className="reveal mt-12" aria-labelledby="open-heading">
            <SectionHeading id="open-heading" kicker="Also open" title={`${label} roles without a posted range`} />
            <div className="mt-5">
              <JobList jobs={unpaid.slice(0, 6)} />
            </div>
          </section>
        ) : null}

        <div className="mt-16">
          <Faq id="salary-faq" kicker="FAQ" items={faqs} />
        </div>

        <section className="mt-12" aria-labelledby="salary-more-heading">
          <h2 id="salary-more-heading" className="text-[13px] font-semibold">Related</h2>
          <div className="mt-3">
            <LinkPills
              links={[
                ...(jobsHub ? [{ href: `/roles/${jobsHub.slug}`, label: jobsHub.h1 }] : []),
                { href: "/salary", label: "Design engineer salary" },
                ...SALARY_ROLES.filter((item) => item.slug !== slug).map((item) => ({ href: `/salary/${item.slug}`, label: item.h1 })),
                { href: "/guides/design-engineer-salary", label: "Salary guide" },
                ...(slug === "design-technologist"
                  ? [{ href: "/guides/design-technologist", label: "What is a design technologist?" }]
                  : []),
              ]}
            />
          </div>
        </section>
      </div>
    </article>
  );
}
