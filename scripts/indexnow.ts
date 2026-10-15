import { submitSitemapToIndexNow } from "@/lib/sitemap-urls";

async function main() {
  if (!process.env.INDEXNOW_KEY) {
    console.error("INDEXNOW_KEY is not set");
    process.exit(1);
  }
  const result = await submitSitemapToIndexNow({ force: true, maxWaitMs: 15 * 60 * 1000 });
  console.log(JSON.stringify(result, null, 2));
  const failed = result.batches.some((batch) => !batch.ok);
  if (result.skipped || failed) process.exit(1);
}

main();
