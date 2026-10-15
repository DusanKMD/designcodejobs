import { NextResponse } from "next/server";
import { unauthorizedCron } from "@/lib/cron-auth";
import { submitSitemapToIndexNow } from "@/lib/sitemap-urls";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** One-shot submission of every URL in the sitemaps. Protected like the ingest cron. */
export async function GET(request: Request) {
  const denied = unauthorizedCron(request);
  if (denied) return denied;
  const result = await submitSitemapToIndexNow({ force: true, maxWaitMs: 2_000 });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  return GET(request);
}
