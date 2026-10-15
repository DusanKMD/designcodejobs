"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createCheckoutSession } from "@/lib/dodo";
import { sendAlertConfirmation } from "@/lib/email";
import { parsePostJob, valuesFromForm } from "@/lib/post-job";
import { absoluteUrl } from "@/lib/site";
import { createAlert, createSubmission, unsubscribeAlert } from "@/lib/store";

function text(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}

function emailOk(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function subscribeAction(form: FormData) {
  if (text(form, "company_website")) return;
  const email = text(form, "email").toLowerCase();
  if (!emailOk(email)) redirect("/?alert=invalid");
  const title = text(form, "title");
  await createAlert(email, title ? { title } : {});
  await sendAlertConfirmation(email);
  redirect("/?alert=saved");
}

export async function postJobAction(form: FormData): Promise<{ ok: false; errors: Record<string, string> } | { ok: true } | void> {
  if (text(form, "company_website")) return { ok: true };
  const parsed = parsePostJob(valuesFromForm(form));
  if (!parsed.ok) return parsed;
  const data = parsed.data;
  const submission = await createSubmission({
    email: data.email,
    companyName: data.companyName,
    companyDomain: data.companyDomain,
    title: data.title,
    location: data.location,
    workplace: data.workplace,
    descriptionHtml: data.descriptionHtml,
    applyUrl: data.applyUrl,
    salaryMin: data.salaryMin,
    salaryMax: data.salaryMax,
    salaryCurrency: data.salaryCurrency,
    featured: data.featured,
  });
  const url = await createCheckoutSession({
    submissionId: submission.id,
    email: data.email,
    name: data.companyName,
    featured: data.featured,
    returnUrl: absoluteUrl(`/post-a-job/confirmation?submission=${submission.id}`),
  });
  if (!url) redirect(`/post-a-job/confirmation?submission=${submission.id}&pending=1`);
  redirect(url);
}

export async function reviewLoginAction(form: FormData) {
  const key = text(form, "key");
  const secret = process.env.REVIEW_SECRET;
  if (!secret || key !== secret) redirect("/review?error=1");
  const jar = await cookies();
  jar.set("review", secret, { httpOnly: true, sameSite: "lax", path: "/review", secure: process.env.NODE_ENV === "production" });
  redirect("/review");
}

export async function unsubscribeAction(token: string) {
  await unsubscribeAlert(token);
}
