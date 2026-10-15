import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

// Search and AI answer engines are welcome: being quoted by them is how a niche board gets found.
// Only the private review queue and checkout returns are kept out.
const PRIVATE = ["/review", "/post-a-job/confirmation"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      {
        userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended"],
        allow: "/",
        disallow: PRIVATE,
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
