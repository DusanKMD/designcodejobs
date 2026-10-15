import { indexablePagePaths } from "@/lib/sitemap-data";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

export async function GET() {
  const paths = await indexablePagePaths();
  const urls = paths.map((path) => `<url><loc>${absoluteUrl(path)}</loc></url>`).join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { "content-type": "application/xml; charset=utf-8" } },
  );
}
