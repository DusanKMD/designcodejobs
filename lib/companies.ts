import fs from "node:fs";
import path from "node:path";
import type { Ats, Board, Company } from "@/lib/types";

const NAMES: Record<string, string> = {
  "1password": "1Password",
  airbnb: "Airbnb",
  algolia: "Algolia",
  anthropic: "Anthropic",
  asana: "Asana",
  ashby: "Ashby",
  attio: "Attio",
  baseten: "Baseten",
  bitwarden: "Bitwarden",
  calendly: "Calendly",
  character: "Character.AI",
  clickup: "ClickUp",
  cloudflare: "Cloudflare",
  cohere: "Cohere",
  coinbase: "Coinbase",
  contentful: "Contentful",
  cursor: "Cursor",
  databricks: "Databricks",
  datadog: "Datadog",
  descript: "Descript",
  discord: "Discord",
  dropbox: "Dropbox",
  duolingo: "Duolingo",
  elevenlabs: "ElevenLabs",
  figma: "Figma",
  fivetran: "Fivetran",
  github: "GitHub",
  gitlab: "GitLab",
  grafanalabs: "Grafana Labs",
  granola: "Granola",
  greenhouse: "Greenhouse",
  honeycomb: "Honeycomb",
  instacart: "Instacart",
  intercom: "Intercom",
  langchain: "LangChain",
  launchdarkly: "LaunchDarkly",
  linear: "Linear",
  linkedin: "LinkedIn",
  lumaai: "Luma",
  mixpanel: "Mixpanel",
  monzo: "Monzo",
  notion: "Notion",
  openai: "OpenAI",
  opusclip: "OpusClip",
  oura: "Oura",
  perplexity: "Perplexity",
  pinterest: "Pinterest",
  planetscale: "PlanetScale",
  posthog: "PostHog",
  railway: "Railway",
  ramp: "Ramp",
  reddit: "Reddit",
  render: "Render",
  replit: "Replit",
  resend: "Resend",
  restream: "Restream",
  robinhood: "Robinhood",
  sanity: "Sanity",
  scaleai: "Scale",
  sentry: "Sentry",
  sigmacomputing: "Sigma",
  snowflake: "Snowflake",
  spotify: "Spotify",
  squarespace: "Squarespace",
  stabilityai: "Stability AI",
  stackblitz: "StackBlitz",
  storyblok: "Storyblok",
  stripe: "Stripe",
  substack: "Substack",
  supabase: "Supabase",
  tailscale: "Tailscale",
  temporal: "Temporal",
  tldraw: "tldraw",
  vercel: "Vercel",
  warp: "Warp",
  webflow: "Webflow",
  workos: "WorkOS",
  writer: "Writer",
  ycombinator: "Y Combinator",
  zapier: "Zapier",
  zed: "Zed",
};

const DOMAINS: Record<string, string> = {
  "1password": "1password.com",
  character: "character.ai",
  fly: "fly.io",
  ghost: "ghost.org",
  grafanalabs: "grafana.com",
  hex: "hex.tech",
  linear: "linear.app",
  lumaai: "lumalabs.ai",
  neon: "neon.tech",
  notion: "notion.so",
  scaleai: "scale.com",
  sentry: "sentry.io",
  stabilityai: "stability.ai",
  temporal: "temporal.io",
  warp: "warp.dev",
  zed: "zed.dev",
};

let cache: Company[] | null = null;

function titleCase(slug: string) {
  if (NAMES[slug]) return NAMES[slug];
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

export function companyName(slug: string) {
  return titleCase(slug);
}

export function companyDomain(slug: string) {
  return DOMAINS[slug] || `${slug}.com`;
}

export function loadCompanies(): Company[] {
  if (cache) return cache;
  const file = path.join(process.cwd(), "data", "companies.csv");
  const lines = fs.readFileSync(file, "utf8").trim().split(/\r?\n/).slice(1);
  const bySlug = new Map<string, Company>();
  for (const line of lines) {
    const [slug, ats, token, openJobs, apiUrl] = line.split(",");
    if (!slug || !ats || !token) continue;
    const board: Board = {
      ats: ats as Ats,
      token,
      apiUrl,
      openJobsHint: Number(openJobs) || 0,
    };
    const existing = bySlug.get(slug);
    if (existing) existing.boards.push(board);
    else {
      bySlug.set(slug, {
        slug,
        name: companyName(slug),
        domain: companyDomain(slug),
        boards: [board],
      });
    }
  }
  cache = [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
  return cache;
}

export function getCompany(slug: string) {
  return loadCompanies().find((company) => company.slug === slug) || null;
}
