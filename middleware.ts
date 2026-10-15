import { NextResponse, type NextRequest } from "next/server";
import gone from "./data/seed/gone.json";
import { indexNowKey } from "./lib/indexnow";
import { canonicalTarget, publicHostFrom, shouldCanonicalRedirect } from "./lib/site";

export async function middleware(request: NextRequest) {
  const host = publicHostFrom(request.headers, request.nextUrl.host);
  if (shouldCanonicalRedirect(host)) {
    const location = canonicalTarget(request.nextUrl.pathname, request.nextUrl.search);
    return new NextResponse(null, { status: 301, headers: { location } });
  }

  const key = indexNowKey();
  if (key && request.nextUrl.pathname === `/${key}.txt`) {
    return new NextResponse(key, {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    });
  }

  const match = request.nextUrl.pathname.match(/^\/jobs\/([^/]+)$/);
  if (!match) return NextResponse.next();
  const slug = decodeURIComponent(match[1]);
  if ((gone as string[]).includes(slug) || (await expiredInDatabase(slug))) {
    const url = request.nextUrl.clone();
    url.pathname = "/gone";
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

async function expiredInDatabase(slug: string) {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) return false;
  try {
    const response = await fetch(
      `${base}/rest/v1/jobs?slug=eq.${encodeURIComponent(slug)}&select=status,expired_at,valid_through`,
      { headers: { apikey: key, authorization: `Bearer ${key}` } },
    );
    if (!response.ok) return false;
    const rows = (await response.json()) as { status?: string; expired_at?: string | null; valid_through?: string | null }[];
    const row = rows[0];
    if (!row) return false;
    const anchor = row.expired_at || (row.status === "expired" ? row.valid_through : null);
    if (!anchor) return false;
    return Date.now() - new Date(anchor).getTime() >= 90 * 86_400_000;
  } catch {
    return false;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
