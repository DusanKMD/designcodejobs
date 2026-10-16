/** Terms hiring posts actually use. Counted in open descriptions, not invented. */
export const LISTING_TERMS: { term: string; pattern: RegExp }[] = [
  { term: "React", pattern: /\breact\b/i },
  { term: "TypeScript", pattern: /\btypescript\b/i },
  { term: "CSS", pattern: /\bcss\b/i },
  { term: "design system", pattern: /design systems?/i },
  { term: "Figma", pattern: /\bfigma\b/i },
  { term: "accessibility", pattern: /accessib|\ba11y\b|\bwcag\b|\baria\b/i },
  { term: "prototype", pattern: /prototyp/i },
  { term: "motion", pattern: /\bmotion\b|\banimation\b|\bgsap\b|framer motion/i },
  { term: "portfolio", pattern: /\bportfolio\b/i },
  { term: "component", pattern: /\bcomponents?\b/i },
  { term: "token", pattern: /\btokens?\b/i },
  { term: "Tailwind", pattern: /\btailwind\b/i },
  { term: "Next.js", pattern: /\bnext\.?js\b/i },
  { term: "Storybook", pattern: /\bstorybook\b/i },
  { term: "Framer", pattern: /\bframer\b/i },
  { term: "WebGL", pattern: /\bwebgl\b/i },
  { term: "Three.js", pattern: /\bthree\.?js\b/i },
  { term: "SwiftUI", pattern: /\bswiftui\b/i },
  { term: "interaction", pattern: /\binteractions?\b/i },
  { term: "responsive", pattern: /\bresponsive\b/i },
];

export type ListingKeyword = { term: string; count: number; listings: number };

/** Term frequency across descriptions, plus how many listings mention the term. */
export function listingKeywords(descriptions: string[]): ListingKeyword[] {
  const rows: ListingKeyword[] = [];
  for (const item of LISTING_TERMS) {
    let count = 0;
    let listings = 0;
    for (const description of descriptions) {
      const matches = description.match(new RegExp(item.pattern.source, item.pattern.flags.includes("g") ? item.pattern.flags : `${item.pattern.flags}g`));
      if (matches?.length) {
        listings += 1;
        count += matches.length;
      }
    }
    if (listings > 0) rows.push({ term: item.term, count, listings });
  }
  return rows.sort((a, b) => b.listings - a.listings || b.count - a.count || a.term.localeCompare(b.term));
}
