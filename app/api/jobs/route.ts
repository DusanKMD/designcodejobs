import { NextResponse } from "next/server";
import { formatSalary } from "@/lib/format";
import { isListed } from "@/lib/model";
import { absoluteUrl } from "@/lib/site";
import { getAllJobs } from "@/lib/store";

export const revalidate = 1800;

export async function GET() {
  const jobs = (await getAllJobs()).filter((job) => isListed(job)).map((job) => ({
    id: job.id,
    title: job.title,
    company: job.companyName,
    url: absoluteUrl(`/jobs/${job.slug}`),
    applyUrl: job.applyUrl,
    workplace: job.workplace,
    location: job.locationRaw,
    salary: formatSalary(job),
    datePosted: job.datePosted,
    titleFamily: job.titleFamily,
  }));
  return NextResponse.json({ jobs }, { headers: { "x-robots-tag": "noindex" } });
}
