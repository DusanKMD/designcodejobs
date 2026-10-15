"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sendAlertConfirmation } from "@/lib/email";
import { checkoutUrl } from "@/lib/lemonsqueezy";
import { createAlert, createSubmission, unsubscribeAlert } from "@/lib/store";
import type { Workplace } from "@/lib/types";

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

export async function postJobAction(form: FormData) {
  if (text(form, "company_website")) return;
  const email = text(form, "email").toLowerCase();
  const companyName = text(form, "company");
  const title = text(form, "title");
  const description = text(form, "description");
  const applyUrl = text(form, "apply_url");
  const workplace = text(form, "workplace") as Workplace;
  if (!emailOk(email) || companyName.length < 2 || title.length < 4 || description.length < 80) {
    redirect("/post-a-job?error=1");
  }
  let parsed: URL;
  try {
    parsed = new URL(applyUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("bad");
  } catch {
    redirect("/post-a-job?error=1");
  }
  const min = Number(text(form, "salary_min")) || null;
  const max = Number(text(form, "salary_max")) || null;
  const featured = form.get("featured") === "on";
  const submission = await createSubmission({
    email,
    companyName,
    companyDomain: text(form, "domain").replace(/^https?:\/\//, "").replace(/\/.*$/, ""),
    title,
    location: text(form, "location"),
    workplace: workplace === "remote" || workplace === "hybrid" ? workplace : "onsite",
    descriptionHtml: `<p>${description.replace(/</g, "").replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>")}</p>`,
    applyUrl: parsed.toString(),
    salaryMin: min,
    salaryMax: max || min,
    salaryCurrency: text(form, "salary_currency") || "USD",
    featured,
  });
  const url = checkoutUrl(featured, submission.id, email);
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
