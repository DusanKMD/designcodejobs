import { isListed } from "@/lib/model";
import { indexablePagePaths } from "@/lib/sitemap-data";
import { absoluteUrl } from "@/lib/site";
import { submitIndexNow } from "@/lib/indexnow";
import { getAllJobs } from "@/lib/store";

/** Every URL currently listed in the page and job sitemaps. */
export async function collectSitemapUrls() {
  const paths = await indexablePagePaths();
  const jobs = (await getAllJobs()).filter((job) => isListed(job));
  return [...paths.map((path) => absoluteUrl(path)), ...jobs.map((job) => absoluteUrl(`/jobs/${job.slug}`))];
}

export async function submitSitemapToIndexNow(options?: { force?: boolean; maxWaitMs?: number }) {
  const urls = await collectSitemapUrls();
  return submitIndexNow(urls, { force: options?.force ?? true, maxWaitMs: options?.maxWaitMs });
}
