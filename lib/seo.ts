import type { Metadata } from "next";
import { formatSalary, jobFacts } from "@/lib/format";
import { absoluteUrl, SITE_NAME } from "@/lib/site";
import type { Job } from "@/lib/types";

/** Clip on a word boundary. Titles aim at 60 and hard-stop at 65; descriptions aim at 155 and hard-stop at 165. */
export function fitText(value: string, max: number) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max - 1);
  const space = slice.lastIndexOf(" ");
  const base = (space > Math.floor(max * 0.6) ? slice.slice(0, space) : slice).replace(/[\s.,;:|–—-]+$/u, "");
  return `${base}…`;
}

export function fitTitle(title: string, max = 60) {
  return fitText(title, max);
}

export function fitDescription(description: string, max = 155) {
  return fitText(description, max);
}

/** Keep live remote H1s, and do not lowercase an acronym into "uX" or "uI". */
export function remoteRoleTitle(h1: string) {
  const second = h1.charAt(1);
  const acronym = second !== second.toLowerCase();
  const first = acronym ? h1.charAt(0) : h1.charAt(0).toLowerCase();
  return `Remote ${first}${h1.slice(1)}`;
}

export function remoteRoleDescription(label: string) {
  return fitDescription(
    `Remote ${label} jobs. Fully remote software roles only. Hybrid weeks stay on the main ${label} page.`,
  );
}

function shortPlace(job: Pick<Job, "workplace" | "locationRaw" | "locations">) {
  const city = job.locations.find((location) => location.locality)?.locality;
  if (job.workplace === "remote") {
    const region = job.locationRaw.replace(/remote/gi, "").replace(/^[\s\-–—·,:()/|]+|[\s\-–—·,:()/|]+$/g, "");
    return region ? `Remote, ${region}` : "Remote";
  }
  return city || job.locationRaw.split(/[;|]/)[0].trim();
}

/**
 * "{title} at {company}". When another listing shares that exact pair (one role
 * posted per region, for example), the place is appended so each title stays unique.
 */
export function jobMetaTitle(job: Job, others: Job[] = []) {
  const base = `${job.title} at ${job.companyName}`;
  const clash = others.some(
    (other) =>
      other.id !== job.id &&
      other.companySlug === job.companySlug &&
      other.title.trim().toLowerCase() === job.title.trim().toLowerCase(),
  );
  const place = clash ? shortPlace(job) : "";
  return fitTitle(place ? `${base} · ${place}` : base, place ? 65 : 60);
}

/** Facts first (place, pay), then the opening of the description so the snippet is never a stub. */
export function jobMetaDescription(job: Job) {
  const salary = formatSalary(job);
  const lead = `${job.title} at ${job.companyName}. ${jobFacts(job)}. ${salary ? `Salary ${salary}.` : "Salary not posted."}`;
  const opening = job.descriptionText.replace(/\s+/g, " ").trim();
  return fitDescription(opening ? `${lead} ${opening}` : lead);
}

export function pageMeta(input: {
  title: string;
  description: string;
  path: string;
  index: boolean;
  canonicalPath?: string;
  ogType?: "website" | "article";
  image?: string;
  /** Paginated lists: pages 2+ get their own title and description so they are not duplicates of page 1. */
  page?: number;
}): Metadata {
  const canonical = absoluteUrl(input.canonicalPath || input.path);
  const image = absoluteUrl(input.image || "/opengraph-image");
  const page = input.page && input.page > 1 ? Math.floor(input.page) : 1;
  const title = page > 1 ? `${fitText(input.title, 55)} (page ${page})` : fitText(input.title, 65);
  const description = fitText(page > 1 ? `Page ${page}. ${input.description}` : input.description, 165);
  return {
    title,
    description,
    alternates: { canonical, types: { "application/rss+xml": [{ url: "/feed.xml", title: "Design Code Jobs: new roles" }] } },
    robots: { index: input.index, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: input.ogType || "website",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
