export const SITE_NAME = "Design Code Jobs";
export const SITE_DOMAIN = "designcodejobs.com";

export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || `https://${SITE_DOMAIN}`;
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path: string) {
  if (path.startsWith("http")) return path;
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export const LISTING_DAYS = 30;
export const STANDARD_PRICE_USD = 129;
export const FEATURED_ADDON_USD = 99;
export const FEATURED_PRICE_USD = STANDARD_PRICE_USD + FEATURED_ADDON_USD;

export const INDEX_THRESHOLD = 5;
export const COMPANY_INDEX_THRESHOLD = 3;
export const PAGE_SIZE = 25;
export const GONE_AFTER_DAYS = 90;
