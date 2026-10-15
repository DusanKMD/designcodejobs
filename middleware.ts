import { NextResponse, type NextRequest } from "next/server";
import gone from "./data/seed/gone.json";

export async function middleware(request: NextRequest) {
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

export const config = { matcher: ["/jobs/:slug"] };
