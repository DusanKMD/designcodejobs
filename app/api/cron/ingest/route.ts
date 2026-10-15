import { NextResponse } from "next/server";
import { unauthorizedCron } from "@/lib/cron-auth";
import { runIngest } from "@/lib/ingest";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const denied = unauthorizedCron(request);
  if (denied) return denied;
  const result = await runIngest();
  return NextResponse.json(result);
}
