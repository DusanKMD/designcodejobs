export type ChecklistItem = {
  id: string;
  label: string;
  why: string;
  pattern: RegExp;
};

/** Stable ids. localStorage and shared links use these, so do not rename them. */
export const CHECKLIST: ChecklistItem[] = [
  {
    id: "shipped",
    label: "Show an interface that shipped",
    why: "Hiring posts ask for production UI, not a deck of mockups.",
    pattern: /\b(shipped|production|launched)\b/i,
  },
  {
    id: "prototype",
    label: "Include a prototype someone can use",
    why: "A clickable prototype is how these teams decide an interaction.",
    pattern: /prototyp/i,
  },
  {
    id: "system",
    label: "Show a design-system contribution",
    why: "Components, tokens, and docs show up across the open listings.",
    pattern: /design systems?/i,
  },
  {
    id: "code",
    label: "Put React or TypeScript next to the picture",
    why: "The role is design in code. A screenshot without the stack reads as product design only.",
    pattern: /\breact\b|\btypescript\b/i,
  },
  {
    id: "figma",
    label: "Connect the Figma file to what you built",
    why: "Listings name Figma when the team designs there and still expects you to ship.",
    pattern: /\bfigma\b/i,
  },
  {
    id: "a11y",
    label: "Show an accessibility decision",
    why: "Keyboard, focus, contrast, and semantics are part of the interface job.",
    pattern: /accessib|\ba11y\b|\bwcag\b/i,
  },
  {
    id: "motion",
    label: "Explain one motion or interaction",
    why: "Motion is mentioned when the product’s feel is part of the work.",
    pattern: /\bmotion\b|\banimation\b|\binteraction\b/i,
  },
  {
    id: "states",
    label: "Include empty, loading, and error states",
    why: "Finished UI is the states, not only the happy path.",
    pattern: /empty state|error state|loading state|edge case/i,
  },
  {
    id: "measure",
    label: "Add one measured result",
    why: "A percent, a time, or a user count tells a reviewer what changed.",
    pattern: /\d+(?:\.\d+)?\s?%|\blatency\b|\bconversion\b/i,
  },
  {
    id: "source",
    label: "Link the source or a live URL",
    why: "Reviewers follow a GitHub or live link when the posting asks for a portfolio.",
    pattern: /\bgithub\b|\bportfolio\b/i,
  },
];

export const CHECKLIST_STORAGE_KEY = "dcj-portfolio-checklist";

export function checklistCounts(descriptions: string[]) {
  const counts: Record<string, number> = {};
  for (const item of CHECKLIST) {
    counts[item.id] = descriptions.filter((description) => item.pattern.test(description)).length;
  }
  return counts;
}

export function parseChecked(value: string | null) {
  const known = new Set(CHECKLIST.map((item) => item.id));
  if (!value) return [];
  return [...new Set(value.split(",").map((part) => part.trim()).filter((id) => known.has(id)))];
}
