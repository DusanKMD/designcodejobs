import Link from "next/link";
import { notFound } from "next/navigation";
import { formatSalary } from "@/lib/format";
import { listedJobs, medianSalary } from "@/lib/query";
import { pageMeta } from "@/lib/seo";
import { getAllJobs } from "@/lib/store";

function currentMonth() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function generateMetadata({ params }: { params: Promise<{ month: string }> }) {
  const { month } = await params;
  const live = month === currentMonth();
  return pageMeta({
    title: `Design engineering jobs report ${month}`,
    description: `Design engineering jobs report for ${month}. Open software roles, the fully remote share, and employer-posted salary. Hardware listings are excluded.`,
    path: `/reports/${month}`,
    index: live,
  });
}

export default async function ReportPage({ params }: { params: Promise<{ month: string }> }) {
  const { month } = await params;
  if (!/^\d{4}-\d{2}$/.test(month)) notFound();
  const live = month === currentMonth();
  const jobs = listedJobs(await getAllJobs());
  const remote = jobs.filter((job) => job.workplace === "remote").length;
  const salary = medianSalary(jobs);
  const skills = new Map<string, number>();
  for (const job of jobs) for (const skill of job.skills) skills.set(skill, (skills.get(skill) || 0) + 1);
  const topSkills = [...skills.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <article className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="text-4xl text-balance sm:text-5xl">Design engineering jobs report {month}</h1>
      {!live ? <p className="mt-4 text-sm text-muted">Historical snapshots are not stored yet. This URL stays noindex until a month is archived.</p> : null}
      <p className="mt-5 text-[15px] leading-7 text-muted">
        {live
          ? `This month’s report is the live board: ${jobs.length} open software roles, ${jobs.length ? Math.round((remote / jobs.length) * 100) : 0}% fully remote${salary ? `, median posted midpoint ${new Intl.NumberFormat("en-US", { style: "currency", currency: salary.currency, maximumFractionDigits: 0 }).format(salary.value)}` : ""}.`
          : "No archived snapshot for this month."}
      </p>
      {live ? (
        <>
          <h2 className="mt-8 text-xl font-medium">Skills mentioned</h2>
          <ul className="mt-3 text-sm text-muted">
            {topSkills.length ? topSkills.map(([skill, count]) => <li key={skill}>{skill}: {count}</li>) : <li>No skill mentions yet.</li>}
          </ul>
          <h2 className="mt-8 text-xl font-medium">Notable open roles</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {jobs.slice(0, 8).map((job) => (
              <li key={job.id}>
                <Link href={`/jobs/${job.slug}`} className="underline underline-offset-4">{job.title}</Link>
                <span className="text-muted"> — {job.companyName}{formatSalary(job) ? ` · ${formatSalary(job)}` : ""}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </article>
  );
}
