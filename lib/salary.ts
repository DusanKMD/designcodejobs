import type { SalaryUnit } from "@/lib/types";

export type ParsedSalary = {
  min: number | null;
  max: number | null;
  currency: string;
  unit: SalaryUnit | null;
  note: string | null;
};

const MULTIPLIERS: Record<string, number> = { k: 1000, K: 1000 };

function amount(num: string, suffix?: string) {
  const n = Number(num.replace(/,/g, ""));
  if (!Number.isFinite(n)) return null;
  return suffix && MULTIPLIERS[suffix] ? n * MULTIPLIERS[suffix] : n;
}

function currencyFrom(symbol: string) {
  if (symbol === "£") return "GBP";
  if (symbol === "€") return "EUR";
  if (/^CA\$|C\$|CAD/i.test(symbol)) return "CAD";
  if (/^AU\$|A\$|AUD/i.test(symbol)) return "AUD";
  return "USD";
}

function unitFor(value: number, window: string): SalaryUnit | null {
  const near = window.toLowerCase();
  if (/\bhour/.test(near)) return "HOUR";
  if (/\bmonth/.test(near)) return "MONTH";
  if (/\bweek/.test(near)) return "WEEK";
  if (/\bday\b/.test(near)) return "DAY";
  if (/\byear|annual|base salary|\/yr|per year/.test(near)) return "YEAR";
  if (value >= 20000) return "YEAR";
  if (value > 0 && value < 500) return "HOUR";
  return null;
}

/**
 * Pull an employer-written salary range out of posting text.
 * Returns null when nothing looks like pay.
 */
export function parseSalaryFromText(text: string): ParsedSalary | null {
  if (!text) return null;
  const source = text.replace(/\u00a0/g, " ");
  const pattern =
    /(CA\$|C\$|AU\$|A\$|CAD|AUD|USD|GBP|EUR|£|€|\$)\s?(\d{2,3}(?:,\d{3})+|\d{2,3})(\s?[kK])?(?:\s*(?:[-–—]|to)\s*(?:CA\$|C\$|AU\$|A\$|CAD|AUD|USD|GBP|EUR|£|€|\$)?\s?(\d{2,3}(?:,\d{3})+|\d{2,3})(\s?[kK])?)?/g;

  let best: ParsedSalary | null = null;
  for (const match of source.matchAll(pattern)) {
    const min = amount(match[2], match[3]?.trim());
    const max = match[4] ? amount(match[4], match[5]?.trim()) : null;
    if (min == null) continue;
    const high = max ?? min;
    const low = Math.min(min, high);
    const top = Math.max(min, high);
    if (top < 15 && !match[3]) continue;
    const start = Math.max(0, (match.index ?? 0) - 80);
    const window = source.slice(start, (match.index ?? 0) + match[0].length + 80);
    const unit = unitFor(top, window);
    if (!unit) continue;
    const ote = /\bote\b|on[- ]target/i.test(window);
    const candidate: ParsedSalary = {
      min: low,
      max: max == null ? low : top,
      currency: currencyFrom(match[1]),
      unit: ote ? null : unit,
      note: ote ? "Posted as OTE, not base salary" : "Employer-posted range",
    };
    const score = (candidate.unit === "YEAR" ? 5 : 1) + (/\bsalary|compensation|pay\b/i.test(window) ? 3 : 0);
    const bestScore = best ? (best.unit === "YEAR" ? 5 : 1) : -1;
    if (!best || score > bestScore) best = candidate;
  }
  return best;
}

export function salaryFromStructured(input: {
  min?: number | null;
  max?: number | null;
  currency?: string | null;
  interval?: string | null;
  summary?: string | null;
  hide?: boolean;
}): ParsedSalary | null {
  if (input.hide) return null;
  const min = input.min ?? null;
  const max = input.max ?? null;
  if ((min == null || min <= 0) && (max == null || max <= 0)) return null;
  const low = min && max ? Math.min(min, max) : min || max;
  const high = min && max ? Math.max(min, max) : min || max;
  const interval = (input.interval || "").toLowerCase();
  let unit: SalaryUnit | null = "YEAR";
  if (/hour/.test(interval)) unit = "HOUR";
  else if (/month/.test(interval)) unit = "MONTH";
  else if (/week/.test(interval)) unit = "WEEK";
  else if (/day/.test(interval)) unit = "DAY";
  else if (/year|yr|annual/.test(interval) || interval.includes("1 year")) unit = "YEAR";
  const summary = input.summary || "";
  const ote = /\bote\b|on[- ]target/i.test(summary);
  return {
    min: low,
    max: high,
    currency: (input.currency || "USD").toUpperCase(),
    unit: ote ? null : unit,
    note: ote ? "Posted as OTE, not base salary" : "Employer-posted range",
  };
}
