import type { Metadata } from "next";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

export function pageMeta(input: {
  title: string;
  description: string;
  path: string;
  index: boolean;
  canonicalPath?: string;
}): Metadata {
  const canonical = absoluteUrl(input.canonicalPath || input.path);
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
      type: "website",
    },
    twitter: { card: "summary_large_image", title: input.title, description: input.description },
  };
}
