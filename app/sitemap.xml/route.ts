import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

export function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${absoluteUrl("/sitemap-pages.xml")}</loc></sitemap>
  <sitemap><loc>${absoluteUrl("/sitemap-jobs.xml")}</loc></sitemap>
</sitemapindex>`;
  return xml(body);
}

function xml(body: string) {
  return new Response(body, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
