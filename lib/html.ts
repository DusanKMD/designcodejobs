import sanitizeHtml from "sanitize-html";

export function decodeHtmlEntities(value: string) {
  if (!value) return "";
  if (!value.includes("&lt;") && !value.includes("&#")) return value;
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&");
}

export function stripTags(html: string) {
  return decodeHtmlEntities(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h\d|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/**
 * Shift heading levels so the highest one in the description becomes `top`.
 * The job page renders the description under its own h2, so employer h4s or
 * h2s would otherwise skip or collide with the page outline.
 */
export function normalizeHeadings(html: string, top = 3) {
  const levels = [...html.matchAll(/<h([1-6])\b/gi)].map((match) => Number(match[1]));
  if (!levels.length) return html;
  const offset = top - Math.min(...levels);
  if (offset === 0) return html;
  return html.replace(/<(\/?)h([1-6])\b/gi, (_, slash: string, level: string) => {
    const next = Math.min(6, Math.max(1, Number(level) + offset));
    return `<${slash}h${next}`;
  });
}

export function sanitizeJobHtml(html: string) {
  const decoded = decodeHtmlEntities(html || "");
  return sanitizeHtml(decoded, {
    allowedTags: [
      "p",
      "br",
      "ul",
      "ol",
      "li",
      "strong",
      "b",
      "em",
      "i",
      "a",
      "h2",
      "h3",
      "h4",
      "blockquote",
      "code",
      "pre",
      "div",
      "span",
      "hr",
    ],
    allowedAttributes: {
      a: ["href", "rel", "target"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      h1: "h2",
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          href: attribs.href || "",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    },
    disallowedTagsMode: "discard",
  }).trim();
}
