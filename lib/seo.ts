import type { Metadata } from "next";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

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
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical },
    robots: { index: input.index, follow: true },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      siteName: SITE_NAME,
      type: input.ogType || "website",
      images: [{ url: image, width: 1200, height: 630, alt: input.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}
