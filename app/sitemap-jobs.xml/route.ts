import { isListed } from "@/lib/model";
import { absoluteUrl } from "@/lib/site";
import { getAllJobs } from "@/lib/store";

export const revalidate = 3600;

export async function GET() {
  const jobs = (await getAllJobs()).filter((job) => isListed(job));
  const urls = jobs
    .map(
      (job) =>
        `<url><loc>${absoluteUrl(`/jobs/${job.slug}`)}</loc><lastmod>${job.updatedAt.slice(0, 10)}</lastmod></url>`,
    )
    .join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { "content-type": "application/xml; charset=utf-8" } },
  );
}
