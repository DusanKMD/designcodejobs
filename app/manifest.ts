import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";
import { SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME}: design engineer jobs`,
    short_name: SITE_NAME,
    description: "Software jobs for designers who code: design engineers, UX engineers, design technologists, and design systems engineers.",
    start_url: "/",
    display: "standalone",
    background_color: BRAND.paper,
    theme_color: BRAND.ink,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
      { src: "/logo/designcodejobs", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
