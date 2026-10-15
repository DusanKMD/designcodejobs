import { CANONICAL_ORIGIN, SITE_DOMAIN, canonicalTarget } from "@/lib/site";

export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
export const INDEXNOW_BATCH = 10_000;
const REPEAT_WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_RETRY_MS = REPEAT_WINDOW_MS;

const recent = new Map<string, number>();

export function indexNowKey() {
  const key = (process.env.INDEXNOW_KEY || "").trim();
  if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) return null;
  return key;
}

export function indexNowKeyLocation(key = indexNowKey()) {
  if (!key) return null;
  return `${CANONICAL_ORIGIN}/${key}.txt`;
}

export function resetIndexNowMemory() {
  recent.clear();
}

function chunk<T>(items: T[], size: number) {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) batches.push(items.slice(i, i + size));
  return batches;
}

/** Keep canonical https URLs, drop duplicates, and drop a slash-only homepage variant. */
export function normalizeIndexNowUrls(urls: string[]) {
  const seen = new Set<string>();
  const kept: string[] = [];
  for (const raw of urls) {
    let url: URL;
    try {
      url = new URL(raw);
    } catch {
      continue;
    }
    if (url.protocol !== "https:") continue;
    const host = url.hostname.toLowerCase();
    const owned = host === SITE_DOMAIN || host === `www.${SITE_DOMAIN}` || host.endsWith(".up.railway.app");
    if (!owned) continue;
    const normalized = canonicalTarget(url.pathname, url.search);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    kept.push(normalized);
  }
  return kept;
}

function retryAfterMs(value: string | null, now: number) {
  if (!value) return DEFAULT_RETRY_MS;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(value);
  if (Number.isFinite(date)) return Math.max(0, date - now);
  return DEFAULT_RETRY_MS;
}

type SubmitOptions = {
  fetchImpl?: typeof fetch;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
  force?: boolean;
  /** In a request, stay under the platform timeout. The one-shot script can wait longer. */
  maxWaitMs?: number;
};

export type IndexNowBatch = { status: number; count: number; ok: boolean; retryAfterMs?: number };

/**
 * POST url lists to api.indexnow.org.
 * Batches are capped at 10,000. A 429 waits for Retry-After when that fits in maxWaitMs, then tries once more.
 * The same URL is not sent again within 10 minutes unless force is set.
 */
export async function submitIndexNow(urls: string[], options: SubmitOptions = {}) {
  const key = indexNowKey();
  if (!key) return { skipped: true as const, submitted: 0, batches: [] as IndexNowBatch[] };
  const fetchImpl = options.fetchImpl || fetch;
  const now = options.now || Date.now;
  const sleep = options.sleep || ((ms: number) => new Promise((resolve) => setTimeout(resolve, ms)));
  const maxWaitMs = options.maxWaitMs ?? 2_000;
  const stamp = now();
  let list = normalizeIndexNowUrls(urls);
  if (!options.force) {
    list = list.filter((url) => {
      const seenAt = recent.get(url);
      return seenAt == null || stamp - seenAt >= REPEAT_WINDOW_MS;
    });
  }
  if (!list.length) return { skipped: false as const, submitted: 0, batches: [] as IndexNowBatch[] };

  const batches: IndexNowBatch[] = [];
  const groups = chunk(list, INDEXNOW_BATCH);
  for (let index = 0; index < groups.length; index += 1) {
    const group = groups[index];
    const result = await postBatch(group, key, { fetchImpl, now, sleep, maxWaitMs });
    batches.push(result);
    if (result.ok) {
      const sentAt = now();
      for (const url of group) recent.set(url, sentAt);
    }
    if (!result.ok) break;
    if (index < groups.length - 1 && maxWaitMs >= 1_000) await sleep(1_000);
  }
  const submitted = batches.filter((batch) => batch.ok).reduce((sum, batch) => sum + batch.count, 0);
  return { skipped: false as const, submitted, batches };
}

async function postBatch(
  urls: string[],
  key: string,
  options: Required<Pick<SubmitOptions, "fetchImpl" | "now" | "sleep" | "maxWaitMs">>,
): Promise<IndexNowBatch> {
  const body = JSON.stringify({
    host: SITE_DOMAIN,
    key,
    keyLocation: indexNowKeyLocation(key),
    urlList: urls,
  });
  let attempt = 0;
  while (attempt < 2) {
    const response = await options.fetchImpl(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body,
    });
    if (response.status !== 429) {
      const ok = response.status === 200 || response.status === 202;
      if (!ok) console.error(`[indexnow] ${response.status} for ${urls.length} urls`);
      return { status: response.status, count: urls.length, ok };
    }
    const wait = retryAfterMs(response.headers.get("retry-after"), options.now());
    attempt += 1;
    if (attempt >= 2 || wait > options.maxWaitMs) {
      console.error(`[indexnow] 429 for ${urls.length} urls, retry after ${wait}ms`);
      return { status: 429, count: urls.length, ok: false, retryAfterMs: wait };
    }
    await options.sleep(wait);
  }
  return { status: 429, count: urls.length, ok: false };
}
