/**
 * Brand constants shared by the UI, icons, and Open Graph images.
 *
 * The mark is a code tag, </>, whose slash is a vector pen handle with a selected
 * anchor point in the middle: design inside code.
 */
export const BRAND = {
  ink: "#0B0B0F",
  paper: "#FAFAFA",
  accent: "#3E63DD",
  accentSoft: "#EDF2FE",
  salary: "#0A7A3E",
  muted: "#5D5D69",
} as const;

export type MarkTone = "ink" | "accent";

/** Raw SVG for the mark. `tone` picks the tile colour; the anchor takes the other one. */
export function markSvg(tone: MarkTone = "ink", radius = 8) {
  const tile = tone === "ink" ? BRAND.ink : BRAND.accent;
  const anchor = tone === "ink" ? BRAND.accent : BRAND.ink;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="${radius}" fill="${tile}"/><path d="M11.2 10.4 6.6 16l4.6 5.6M20.8 10.4l4.6 5.6-4.6 5.6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.7 8.6 13.3 23.4" stroke="#fff" stroke-opacity=".55" stroke-width="1.3" stroke-linecap="round"/><circle cx="18.7" cy="8.6" r="1.6" fill="#fff"/><circle cx="13.3" cy="23.4" r="1.6" fill="#fff"/><rect x="13.4" y="13.4" width="5.2" height="5.2" rx="1.1" fill="${anchor}" stroke="#fff" stroke-width="1.3"/></svg>`;
}

export function markDataUri(tone: MarkTone = "ink", radius = 8) {
  return `data:image/svg+xml;base64,${Buffer.from(markSvg(tone, radius)).toString("base64")}`;
}
