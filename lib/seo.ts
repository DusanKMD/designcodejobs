import type { Metadata } from "next";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

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

export function pageMeta(input: {
  title: string;
  description: string;
  path: string;
  index: boolean;
  canonicalPath?: string;
  ogType?: "website" | "article";
  image?: string;
}): Metadata {
  const canonical = absoluteUrl(input.canonicalPath || input.path);
  const image = absoluteUrl(input.image || "/opengraph-image");
  const title = fitText(input.title, 65);
  const description = fitText(input.description, 165);
  return {
    title,
    description,
    alternates: { canonical },
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
