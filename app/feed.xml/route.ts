import { isListed } from "@/lib/model";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import { getAllJobs } from "@/lib/store";

export const revalidate = 1800;

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET() {
  const jobs = (await getAllJobs()).filter((job) => isListed(job)).slice(0, 50);
  const items = jobs
    .map((job) => {
      const link = absoluteUrl(`/jobs/${job.slug}`);
      return `<item><title>${escapeXml(`${job.title} — ${job.companyName}`)}</title><link>${link}</link><guid>${link}</guid><pubDate>${new Date(job.datePosted).toUTCString()}</pubDate><description>${escapeXml(job.descriptionText.slice(0, 400))}</description></item>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${SITE_NAME}</title><link>${absoluteUrl("/")}</link><description>Software design engineer jobs</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
