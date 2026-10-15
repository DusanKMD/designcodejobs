export const SITE_NAME = "Design Code Jobs";
export const SITE_DOMAIN = "designcodejobs.com";
export const CANONICAL_ORIGIN = "https://designcodejobs.com";

export function normalizeHost(value: string) {
  return value.split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");
}

/** www and Railway default hostnames redirect. The apex and localhost do not. */
export function shouldCanonicalRedirect(host: string) {
  const name = normalizeHost(host);
  if (!name || name === "localhost" || name === "127.0.0.1") return false;
  if (name === SITE_DOMAIN) return false;
  if (name === `www.${SITE_DOMAIN}`) return true;
  return name.endsWith(".up.railway.app");
}

/** Absolute URL on the canonical origin, with no trailing slash. */
export function canonicalTarget(pathname: string, search = "") {
  const path = pathname.replace(/\/+$/, "");
  return `${CANONICAL_ORIGIN}${path}${search}`;
}

export function publicHostFrom(headers: { get(name: string): string | null }, fallback = "") {
  return normalizeHost(headers.get("x-forwarded-host") || headers.get("host") || fallback);
}

export function siteUrl() {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || CANONICAL_ORIGIN).trim();
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") return url.origin;
  } catch {
    return CANONICAL_ORIGIN;
  }
  return CANONICAL_ORIGIN;
}

export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    try {
      const url = new URL(path);
      const host = url.hostname.toLowerCase();
      if (host === SITE_DOMAIN || host === `www.${SITE_DOMAIN}` || host.endsWith(".up.railway.app")) {
        return canonicalTarget(url.pathname, url.search);
      }
    } catch {
      return path;
    }
    return path;
  }
  const origin = siteUrl();
  const pathname = path.startsWith("/") ? path : `/${path}`;
  if (origin === CANONICAL_ORIGIN) return canonicalTarget(pathname);
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed ? `${origin}${trimmed}` : origin;
}

export const LISTING_DAYS = 30;
export const STANDARD_PRICE_USD = 129;
export const FEATURED_ADDON_USD = 99;
export const FEATURED_PRICE_USD = STANDARD_PRICE_USD + FEATURED_ADDON_USD;

export const INDEX_THRESHOLD = 5;
export const COMPANY_INDEX_THRESHOLD = 3;
export const PAGE_SIZE = 25;
export const GONE_AFTER_DAYS = 90;
