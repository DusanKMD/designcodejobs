import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { buildJob, expireJob, type JobDraft } from "@/lib/model";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { AlertSubscription, Job, Submission } from "@/lib/types";
import { LISTING_DAYS } from "@/lib/site";
import { absoluteUrl } from "@/lib/site";
import { notifyIndexing } from "@/lib/indexing";

type RuntimeFile = {
  jobs: Job[];
  submissions: Submission[];
  alerts: AlertSubscription[];
  cursor: number;
};

const RUNTIME = path.join(process.cwd(), "data", "runtime", "store.json");
const SEED = path.join(process.cwd(), "data", "seed", "jobs.json");

let memo: { at: number; jobs: Job[] } | null = null;

function emptyRuntime(): RuntimeFile {
  return { jobs: [], submissions: [], alerts: [], cursor: 0 };
}

function readRuntime(): RuntimeFile {
  try {
    return { ...emptyRuntime(), ...JSON.parse(fs.readFileSync(RUNTIME, "utf8")) };
  } catch {
    return emptyRuntime();
  }
}

function writeRuntime(data: RuntimeFile) {
  fs.mkdirSync(path.dirname(RUNTIME), { recursive: true });
  fs.writeFileSync(RUNTIME, JSON.stringify(data, null, 2));
  memo = null;
}

function readSeed(): Job[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(SEED, "utf8")) as Job[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mergeById(base: Job[], overlay: Job[]) {
  const map = new Map(base.map((job) => [job.id, job]));
  for (const job of overlay) map.set(job.id, job);
  return [...map.values()];
}

export function clearJobCache() {
  memo = null;
}

export async function getAllJobs(): Promise<Job[]> {
  if (memo && Date.now() - memo.at < 15_000) return memo.jobs;
  const jobs = await readAllJobs();
  memo = { at: Date.now(), jobs };
  return jobs;
}

async function readAllJobs(): Promise<Job[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      if (!supabase) return mergeById(readSeed(), readRuntime().jobs);
      const { data, error } = await supabase.from("jobs").select("payload").limit(5000);
      if (error) throw error;
      const rows = (data || []).map((row) => row.payload as Job);
      if (rows.length) return rows;
    } catch (error) {
      console.error("[store] supabase read failed, using seed", error);
    }
  }
  return mergeById(readSeed(), readRuntime().jobs);
}

export async function getJobBySlug(slug: string) {
  const jobs = await getAllJobs();
  return jobs.find((job) => job.slug === slug) || null;
}

export async function getIngestCursor() {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    const { data } = await supabase!.from("ingest_state").select("cursor").eq("id", 1).maybeSingle();
    return data?.cursor ?? 0;
  }
  return readRuntime().cursor || 0;
}

export async function setIngestCursor(cursor: number, stats: unknown) {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    await supabase!.from("ingest_state").upsert({
      id: 1,
      cursor,
      updated_at: new Date().toISOString(),
      last_stats: stats,
    });
    return;
  }
  const runtime = readRuntime();
  runtime.cursor = cursor;
  writeRuntime(runtime);
}

export async function saveIngestedJobs(incoming: Job[], board: { source: string; token: string; seenExternalIds: string[] }) {
  const existing = await readAllJobs();
  const byId = new Map(existing.map((job) => [job.id, job]));
  const saved: Job[] = [];
  for (const job of incoming) {
    if (job.status === "rejected") continue;
    const prev = byId.get(job.id);
    const next: Job = prev
      ? {
          ...job,
          slug: prev.slug,
          firstSeenAt: prev.firstSeenAt,
          featured: prev.source === "paid" ? prev.featured : job.featured || prev.featured,
          featuredUntil: prev.featuredUntil,
          validThrough: prev.source === "paid" ? prev.validThrough : job.validThrough,
          status: prev.source === "paid" ? "active" : job.status,
          expiredAt: null,
        }
      : job;
    saved.push(next);
    byId.set(next.id, next);
  }

  const expired: Job[] = [];
  const now = new Date();
  for (const job of existing) {
    if (job.source !== board.source || job.boardToken !== board.token) continue;
    if (job.source === "paid") continue;
    if (job.status !== "active" && job.status !== "review") continue;
    if (board.seenExternalIds.includes(job.externalId)) continue;
    const closed = expireJob(job, now);
    expired.push(closed);
    byId.set(closed.id, closed);
  }

  await persistJobs([...saved, ...expired]);
  for (const job of saved) {
    if (job.status === "active") void notifyIndexing(absoluteUrl(`/jobs/${job.slug}`), "URL_UPDATED");
  }
  for (const job of expired) {
    void notifyIndexing(absoluteUrl(`/jobs/${job.slug}`), "URL_DELETED");
  }
  return { upserted: saved.length, expired: expired.length };
}

async function persistJobs(jobs: Job[]) {
  memo = null;
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    const rows = jobs.map(jobRow);
    const { error } = await supabase!.from("jobs").upsert(rows);
    if (error) throw error;
    return;
  }
  const runtime = readRuntime();
  const map = new Map(runtime.jobs.map((job) => [job.id, job]));
  for (const job of jobs) map.set(job.id, job);
  runtime.jobs = [...map.values()];
  writeRuntime(runtime);
}

function jobRow(job: Job) {
  return {
    id: job.id,
    slug: job.slug,
    company_slug: job.companySlug,
    status: job.status,
    date_posted: job.datePosted,
    expired_at: job.expiredAt,
    valid_through: job.validThrough,
    featured: job.featured,
    title_family: job.titleFamily,
    workplace: job.workplace,
    payload: job,
    updated_at: job.updatedAt,
  };
}

export async function createSubmission(input: Omit<Submission, "id" | "status" | "jobId" | "lemonsqueezyOrderId" | "createdAt" | "paidAt">) {
  const submission: Submission = {
    ...input,
    id: crypto.randomUUID(),
    status: "pending_payment",
    jobId: null,
    lemonsqueezyOrderId: null,
    createdAt: new Date().toISOString(),
    paidAt: null,
  };
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    const { error } = await supabase!.from("submissions").insert({
      id: submission.id,
      email: submission.email,
      company_name: submission.companyName,
      company_domain: submission.companyDomain,
      title: submission.title,
      location: submission.location,
      workplace: submission.workplace,
      description_html: submission.descriptionHtml,
      apply_url: submission.applyUrl,
      salary_min: submission.salaryMin,
      salary_max: submission.salaryMax,
      salary_currency: submission.salaryCurrency,
      featured: submission.featured,
      status: submission.status,
      created_at: submission.createdAt,
    });
    if (error) throw error;
    return submission;
  }
  const runtime = readRuntime();
  runtime.submissions.push(submission);
  writeRuntime(runtime);
  return submission;
}

export async function getSubmission(id: string) {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    const { data } = await supabase!.from("submissions").select("*").eq("id", id).maybeSingle();
    return data ? submissionFromRow(data) : null;
  }
  return readRuntime().submissions.find((item) => item.id === id) || null;
}

function submissionFromRow(row: Record<string, unknown>): Submission {
  return {
    id: String(row.id),
    email: String(row.email),
    companyName: String(row.company_name),
    companyDomain: String(row.company_domain || ""),
    title: String(row.title),
    location: String(row.location || ""),
    workplace: row.workplace as Submission["workplace"],
    descriptionHtml: String(row.description_html || ""),
    applyUrl: String(row.apply_url),
    salaryMin: (row.salary_min as number | null) ?? null,
    salaryMax: (row.salary_max as number | null) ?? null,
    salaryCurrency: (row.salary_currency as string | null) ?? null,
    featured: Boolean(row.featured),
    status: row.status as Submission["status"],
    jobId: (row.job_id as string | null) ?? null,
    lemonsqueezyOrderId: (row.lemonsqueezy_order_id as string | null) ?? null,
    createdAt: String(row.created_at),
    paidAt: (row.paid_at as string | null) ?? null,
  };
}

export async function publishPaidSubmission(submissionId: string, orderId: string, featuredOverride: boolean | null) {
  const submission = await getSubmission(submissionId);
  if (!submission) return { ok: false as const, reason: "unknown submission" };
  if (submission.jobId && (submission.status === "published" || submission.status === "paid")) {
    return { ok: true as const, duplicate: true, jobId: submission.jobId };
  }
  const featured = featuredOverride ?? submission.featured;
  const draft: JobDraft = {
    source: "paid",
    externalId: submission.id,
    boardToken: "paid",
    companySlug: slugFromName(submission.companyName),
    companyName: submission.companyName,
    title: submission.title,
    descriptionHtml: submission.descriptionHtml,
    location: { text: submission.location, workplace: submission.workplace },
    applyUrl: submission.applyUrl,
    salary:
      submission.salaryMin || submission.salaryMax
        ? {
            min: submission.salaryMin,
            max: submission.salaryMax ?? submission.salaryMin,
            currency: submission.salaryCurrency || "USD",
            unit: "YEAR",
            note: "Employer-posted range",
          }
        : null,
    featured,
  };
  const job = buildJob(draft);
  if (job.status === "rejected") {
    await updateSubmission(submission.id, { status: "paid", lemonsqueezyOrderId: orderId, paidAt: new Date().toISOString() });
    return { ok: false as const, reason: "paid, but the role did not match a software design job" };
  }
  const now = new Date();
  const until = new Date(now.getTime() + LISTING_DAYS * 86_400_000).toISOString();
  job.status = "active";
  job.confidence = 1;
  job.featured = featured;
  job.featuredUntil = featured ? until : null;
  job.validThrough = until;
  job.datePosted = now.toISOString();
  job.matchReasons = ["paid listing"];
  await persistJobs([job]);
  await updateSubmission(submission.id, {
    status: "published",
    jobId: job.id,
    lemonsqueezyOrderId: orderId,
    paidAt: now.toISOString(),
  });
  void notifyIndexing(absoluteUrl(`/jobs/${job.slug}`), "URL_UPDATED");
  return { ok: true as const, duplicate: false, jobId: job.id, slug: job.slug };
}

async function updateSubmission(id: string, patch: Partial<Submission>) {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    const { error } = await supabase!.from("submissions").update({
      status: patch.status,
      job_id: patch.jobId,
      lemonsqueezy_order_id: patch.lemonsqueezyOrderId,
      paid_at: patch.paidAt,
    }).eq("id", id);
    if (error) throw error;
    return;
  }
  const runtime = readRuntime();
  runtime.submissions = runtime.submissions.map((item) => (item.id === id ? { ...item, ...patch } : item));
  writeRuntime(runtime);
}

export async function refundSubmission(orderId: string) {
  const jobs = await getAllJobs();
  let submission: Submission | null = null;
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    const { data } = await supabase!.from("submissions").select("*").eq("lemonsqueezy_order_id", orderId).maybeSingle();
    submission = data ? submissionFromRow(data) : null;
  } else {
    submission = readRuntime().submissions.find((item) => item.lemonsqueezyOrderId === orderId) || null;
  }
  if (!submission?.jobId) return;
  const job = jobs.find((item) => item.id === submission!.jobId);
  if (!job) return;
  const closed = expireJob(job);
  await persistJobs([closed]);
  await updateSubmission(submission.id, { status: "refunded" });
  void notifyIndexing(absoluteUrl(`/jobs/${closed.slug}`), "URL_DELETED");
}

export async function createAlert(email: string, filters: AlertSubscription["filters"]) {
  const alert: AlertSubscription = {
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    filters,
    status: "active",
    unsubscribeToken: crypto.randomBytes(16).toString("hex"),
    createdAt: new Date().toISOString(),
  };
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    const { error } = await supabase!.from("alert_subscriptions").insert({
      id: alert.id,
      email: alert.email,
      filters: alert.filters,
      status: alert.status,
      unsubscribe_token: alert.unsubscribeToken,
      created_at: alert.createdAt,
    });
    if (error) throw error;
    return alert;
  }
  const runtime = readRuntime();
  runtime.alerts.push(alert);
  writeRuntime(runtime);
  return alert;
}

export async function unsubscribeAlert(token: string) {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase();
    const { data } = await supabase!.from("alert_subscriptions").update({ status: "unsubscribed" }).eq("unsubscribe_token", token).select("id");
    return Boolean(data?.length);
  }
  const runtime = readRuntime();
  let found = false;
  runtime.alerts = runtime.alerts.map((alert) => {
    if (alert.unsubscribeToken !== token) return alert;
    found = true;
    return { ...alert, status: "unsubscribed" as const };
  });
  if (found) writeRuntime(runtime);
  return found;
}

export async function listReviewJobs() {
  const jobs = await getAllJobs();
  return jobs.filter((job) => job.status === "review").sort((a, b) => b.confidence - a.confidence);
}

function slugFromName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "company";
}
