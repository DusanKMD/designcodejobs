import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { salaryRoleBySlug, SALARY_ROLES } from "@/lib/catalog";
import { formatSalary } from "@/lib/format";
import { breadcrumbLd, datasetLd } from "@/lib/jsonld";
import { listedJobs, medianSalary } from "@/lib/query";
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
  const mid = medianSalary(paid);

  return (
    <article className="mx-auto max-w-3xl px-5 py-10">
      <JsonLd data={breadcrumbLd([{ name: "Jobs", path: "/" }, { name: "Design engineer salary", path: "/salary" }, { name: role.h1, path: `/salary/${slug}` }])} />
      <JsonLd data={datasetLd({ name: role.h1, description: role.description, path: `/salary/${slug}` })} />
      <p className="text-sm text-muted">
        <Link href="/salary" className="hover:text-fg">Design engineer salary</Link> / {role.h1}
      </p>
      <h1 className="mt-4 text-4xl font-medium tracking-tight sm:text-5xl">{role.h1}</h1>
      <p className="mt-5 text-[15px] leading-7 text-muted">{role.description}</p>
      <p className="mt-3 text-[15px] leading-7 text-muted">
        {paid.length
          ? `${paid.length} open ${paid.length === 1 ? "posting publishes" : "postings publish"} yearly base pay${mid ? `. The median midpoint is ${new Intl.NumberFormat("en-US", { style: "currency", currency: mid.currency, maximumFractionDigits: 0 }).format(mid.value)}` : ""}. Figures below are copied from the employer, and the same numbers are the only ones eligible for salary markup on the job page.`
          : `No open ${role.h1.replace(" salary", "").toLowerCase()} posting includes a base salary yet. This page stays up so the range can appear as soon as an employer publishes one. It is not filled with estimates.`}
      </p>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {paid.map((job) => (
          <li key={job.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between">
            <Link href={`/jobs/${job.slug}`} className="font-medium hover:underline">{job.title}</Link>
            <span className="text-sm text-muted">{job.companyName} · {formatSalary(job)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-muted">
        All roles: <Link href={`/roles/${role.slug}`} className="text-fg underline underline-offset-4">{role.h1.replace(" salary", " jobs")}</Link>.
        Full table: <Link href="/salary" className="text-fg underline underline-offset-4">design engineer salary</Link>.
      </p>
    </article>
  );
}
