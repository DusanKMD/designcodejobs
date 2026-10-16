import { LISTING_TERMS, type ListingKeyword } from "@/lib/listing-keywords";

export type RubricId = "shipped" | "stack" | "impact" | "links" | "length" | "verbs" | "ats";

export type RubricRow = {
  id: RubricId;
  label: string;
  max: number;
  score: number;
  detail: string;
  fixes: string[];
};

const STACK: { label: string; pattern: RegExp; points: number }[] = [
  { label: "React", pattern: /\breact\b/i, points: 4 },
  { label: "TypeScript", pattern: /\btypescript\b/i, points: 3 },
  { label: "CSS", pattern: /\bcss\b|\btailwind\b/i, points: 3 },
  { label: "design systems", pattern: /design systems?/i, points: 3 },
  { label: "Figma", pattern: /\bfigma\b/i, points: 3 },
  { label: "motion", pattern: /\bmotion\b|\banimation\b|\bgsap\b|framer motion/i, points: 2 },
  { label: "accessibility", pattern: /accessib|\ba11y\b|\bwcag\b|\baria\b/i, points: 2 },
];

const SHIPPED = [
  /\bshipped\b/i,
  /\bproduction\b/i,
  /\blaunched\b/i,
  /\breleased\b/i,
  /\bdeployed\b/i,
  /pull requests?/i,
  /\bmerged\b/i,
  /\blive\b/i,
];

const VERBS = ["shipped", "built", "designed", "prototyped", "implemented", "led", "owned", "reduced", "improved", "launched"];

export function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function clamp(score: number, max: number) {
  return Math.max(0, Math.min(max, score));
}

export function scoreResume(text: string, keywords: ListingKeyword[] = []): { score: number; rows: RubricRow[]; words: number; missing: string[] } {
  const raw = text.replace(/\u0000/g, "");
  const words = wordCount(raw);
  const lower = raw.toLowerCase();

  const shippedHits = SHIPPED.filter((pattern) => pattern.test(raw)).length;
  const shipped = clamp(shippedHits * 4, 20);
  const shippedFixes = shipped >= 20 ? [] : ["Name one interface you shipped: the product, what you built, and that it reached users or production."];

  const foundStack = STACK.filter((item) => item.pattern.test(raw));
  const stack = clamp(foundStack.reduce((sum, item) => sum + item.points, 0), 20);
  const missingStack = STACK.filter((item) => !item.pattern.test(raw)).map((item) => item.label);
  const stackFixes = missingStack.length ? [`Add the tools you actually use. Still missing: ${missingStack.join(", ")}.`] : [];

  const percents = raw.match(/\d+(?:\.\d+)?\s?%/g)?.length || 0;
  const quantities = raw.match(/(?:\$\s?\d[\d,.]*|\b\d[\d,.]*\s?(?:ms|seconds?|users|customers|people|requests|k|m)\b)/gi)?.length || 0;
  let impact = 0;
  if (percents > 0) impact += 6;
  if (quantities >= 2) impact += 5;
  if (percents + quantities >= 4) impact += 4;
  impact = clamp(impact, 15);
  const impactFixes = impact >= 15 ? [] : ["Add a number to a bullet: a percent, a time, a user count, or a before-and-after."];

  const hasGithub = /github\.com\/[a-z0-9-]+/i.test(raw);
  const hasPortfolio = /https?:\/\/(?!(?:www\.)?(?:github|linkedin|twitter|x)\.com)[^\s]+/i.test(raw) || /\bportfolio\b/i.test(raw);
  const links = clamp((hasGithub ? 8 : 0) + (hasPortfolio ? 7 : 0), 15);
  const linkFixes: string[] = [];
  if (!hasGithub) linkFixes.push("Add a GitHub profile or a repository a reviewer can open.");
  if (!hasPortfolio) linkFixes.push("Add a portfolio URL, or say where the work can be viewed.");

  let length = 0;
  if (words >= 350 && words <= 800) length = 10;
  else if ((words >= 200 && words < 350) || (words > 800 && words <= 1100)) length = 6;
  else if ((words >= 120 && words < 200) || (words > 1100 && words <= 1500)) length = 3;
  const lengthFixes = length === 10 ? [] : words < 350
    ? ["This is short for a design-engineer resume. Aim for roughly 350–800 words, with the work itself, not a skill cloud."]
    : ["Cut it toward 350–800 words. Keep shipped work and drop the rest."];

  const verbHits = VERBS.filter((verb) => new RegExp(`\\b${verb}\\b`, "i").test(lower)).length;
  const verbs = clamp(verbHits * 2, 10);
  const verbFixes = verbs >= 10 ? [] : ["Start bullets with verbs such as shipped, built, designed, prototyped, or reduced."];

  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(raw);
  const hasExperience = /\b(experience|work history|selected work)\b/i.test(raw);
  const hasSkills = /\b(skills|technologies|stack|tools)\b/i.test(raw);
  const weird = (raw.match(/[^\S\n]{6,}|[|│┃]{2,}|[\u2500-\u257F]/g)?.length || 0) > 0;
  let ats = 0;
  if (hasEmail) ats += 3;
  if (hasExperience) ats += 3;
  if (hasSkills) ats += 2;
  if (!weird && words > 40) ats += 2;
  ats = clamp(ats, 10);
  const atsFixes: string[] = [];
  if (!hasEmail) atsFixes.push("Put an email in the text. Parsers miss contact details that live only in a header image.");
  if (!hasExperience) atsFixes.push("Add a plain heading such as Experience or Selected work.");
  if (!hasSkills) atsFixes.push("Add a Skills heading with the stack written out, not only icons.");
  if (weird) atsFixes.push("Avoid columns, box-drawing characters, and wide runs of spaces. Paste the linear reading order.");

  const rows: RubricRow[] = [
    { id: "shipped", label: "Shipped UI", max: 20, score: shipped, detail: `${shippedHits} production signals, 4 points each, capped at 20.`, fixes: shippedFixes },
    { id: "stack", label: "Front-end stack", max: 20, score: stack, detail: foundStack.length ? `Found ${foundStack.map((item) => item.label).join(", ")}.` : "None of the tracked stack words are in the text.", fixes: stackFixes },
    { id: "impact", label: "Quantified impact", max: 15, score: impact, detail: `${percents} percentages and ${quantities} quantities.`, fixes: impactFixes },
    { id: "links", label: "Portfolio and GitHub", max: 15, score: links, detail: `${hasGithub ? "GitHub link found." : "No GitHub link."} ${hasPortfolio ? "Portfolio mentioned." : "No portfolio link."}`, fixes: linkFixes },
    { id: "length", label: "Length", max: 10, score: length, detail: `${words} words. Full points at 350–800.`, fixes: lengthFixes },
    { id: "verbs", label: "Action verbs", max: 10, score: verbs, detail: `${verbHits} of ${VERBS.length} tracked verbs.`, fixes: verbFixes },
    { id: "ats", label: "ATS safety", max: 10, score: ats, detail: "Email, standard headings, and a single reading order.", fixes: atsFixes },
  ];

  const present = new Set(LISTING_TERMS.filter((item) => item.pattern.test(raw)).map((item) => item.term.toLowerCase()));
  const missing = keywords.filter((item) => !present.has(item.term.toLowerCase())).map((item) => item.term);

  return {
    score: rows.reduce((sum, row) => sum + row.score, 0),
    rows,
    words,
    missing,
  };
}
