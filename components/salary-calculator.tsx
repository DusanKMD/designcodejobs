"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import { ArrowRight } from "@/components/icons";
import { formatMoney } from "@/lib/format";
import {
  CALC_LEVELS,
  CALC_LOCATIONS,
  CALC_ROLES,
  DEFAULT_INPUT,
  MIN_SAMPLE,
  calculate,
  currenciesIn,
  type CalcInput,
  type SalaryRow,
} from "@/lib/salary-calculator";

const WIDEN_LABEL = { level: "any level", location: "any location", role: "any role" } as const;
const LIST_LIMIT = 12;

function labelOf(options: { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label || value;
}

function readQuery(currencies: string[]): CalcInput | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  if (![...params.keys()].length) return null;
  const pick = <T extends string>(key: string, options: { value: T }[], fallback: T) => {
    const raw = params.get(key);
    return (options.find((option) => option.value === raw)?.value ?? fallback) as T;
  };
  const currency = params.get("currency")?.toUpperCase();
  return {
    role: pick("role", CALC_ROLES, DEFAULT_INPUT.role),
    level: pick("level", CALC_LEVELS, DEFAULT_INPUT.level),
    location: pick("location", CALC_LOCATIONS, DEFAULT_INPUT.location),
    currency: currency && currencies.includes(currency) ? currency : currencies[0] || "USD",
  };
}

export function SalaryCalculator({ rows }: { rows: SalaryRow[] }) {
  const currencies = useMemo(() => currenciesIn(rows), [rows]);
  const codes = currencies.map((item) => item.code);
  const [input, setInput] = useState<CalcInput>({ ...DEFAULT_INPUT, currency: codes[0] || "USD" });
  const [showAll, setShowAll] = useState(false);
  const id = useId();
  const result = useMemo(() => calculate(rows, input), [rows, input]);

  useEffect(() => {
    const fromUrl = readQuery(codes);
    if (fromUrl) setInput(fromUrl);
    // Read the shared link once on load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update<K extends keyof CalcInput>(key: K, value: CalcInput[K]) {
    const next = { ...input, [key]: value };
    setInput(next);
    setShowAll(false);
    const params = new URLSearchParams();
    if (next.role !== "all") params.set("role", next.role);
    if (next.level !== "all") params.set("level", next.level);
    if (next.location !== "all") params.set("location", next.location);
    if (next.currency !== (codes[0] || "USD")) params.set("currency", next.currency);
    const query = params.toString();
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }

  const count = result.rows.length;
  const enough = count >= MIN_SAMPLE && result.median != null;
  const lowest = count ? Math.min(...result.rows.map((row) => row.min)) : 0;
  const highest = count ? Math.max(...result.rows.map((row) => row.max)) : 0;
  const span = Math.max(1, highest - lowest);
  const pos = (value: number) => `${(((value - lowest) / span) * 100).toFixed(2)}%`;
  const listed = showAll ? result.rows : result.rows.slice(0, LIST_LIMIT);
  const usedSummary = [
    labelOf(CALC_ROLES, result.used.role),
    labelOf(CALC_LEVELS, result.used.level).toLowerCase(),
    labelOf(CALC_LOCATIONS, result.used.location).toLowerCase(),
    result.used.currency,
  ].join(" · ");

  const selects: { key: keyof CalcInput; label: string; options: { value: string; label: string }[] }[] = [
    { key: "role", label: "Role", options: CALC_ROLES },
    { key: "level", label: "Seniority", options: CALC_LEVELS },
    { key: "location", label: "Location", options: CALC_LOCATIONS },
    { key: "currency", label: "Currency", options: currencies.map((item) => ({ value: item.code, label: `${item.code} (${item.count} posted)` })) },
  ];

  return (
    <div className="card overflow-hidden">
      <form className="grid gap-4 border-b border-line p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4" onSubmit={(event) => event.preventDefault()} aria-label="Salary filters">
        {selects.map((select) => (
          <div key={select.key}>
            <label htmlFor={`${id}-${select.key}`} className="text-[13px] font-medium text-fg">{select.label}</label>
            <select
              id={`${id}-${select.key}`}
              name={select.key}
              value={input[select.key]}
              onChange={(event) => update(select.key, event.target.value as never)}
              className="field mt-1.5"
            >
              {select.options.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        ))}
      </form>

      <div className="p-5 sm:p-6" aria-live="polite" aria-atomic="true">
        {result.widened.length ? (
          <p className="mb-4 rounded-xl border border-line bg-chip/60 px-4 py-3 text-[13.5px] leading-6 text-fg-2">
            Fewer than {MIN_SAMPLE} posted ranges matched your filters, so this widens to {result.widened.map((key) => WIDEN_LABEL[key]).join(", then ")}.
          </p>
        ) : null}

        {enough ? (
          <>
            <p className="text-[13px] text-muted">Estimated yearly base · {usedSummary}</p>
            <dl className="mt-3 grid grid-cols-3 gap-3">
              {[
                { label: "25th percentile", value: result.p25 as number },
                { label: "Median", value: result.median as number },
                { label: "75th percentile", value: result.p75 as number },
              ].map((stat) => (
                <div key={stat.label} className={stat.label === "Median" ? "text-fg" : "text-fg-2"}>
                  <dt className="text-[12px] font-medium text-muted">{stat.label}</dt>
                  <dd className={`mt-0.5 font-mono tracking-tight tabular ${stat.label === "Median" ? "text-[26px] font-semibold sm:text-[34px]" : "text-[18px] font-medium sm:text-[22px]"}`}>
                    {formatMoney(stat.value, result.used.currency)}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-6" aria-hidden>
              <div className="relative h-2.5 rounded-full bg-chip">
                <div className="absolute inset-y-0 rounded-full bg-accent/25" style={{ left: pos(result.p25 as number), width: `calc(${pos(result.p75 as number)} - ${pos(result.p25 as number)})` }} />
                <div className="absolute -top-1 h-[18px] w-[3px] -translate-x-1/2 rounded-full bg-accent" style={{ left: pos(result.median as number) }} />
              </div>
              <div className="mt-2 flex justify-between font-mono text-[12px] text-muted tabular">
                <span>{formatMoney(lowest, result.used.currency)}</span>
                <span>{formatMoney(highest, result.used.currency)}</span>
              </div>
            </div>
            <p className="mt-4 text-[13.5px] leading-6 text-muted">
              Based on <strong className="font-semibold text-fg">{count}</strong> employer-posted {count === 1 ? "range" : "ranges"} from open listings. Percentiles are of each range&apos;s midpoint. Posted ranges, not a survey. The bar runs from the lowest posted minimum to the highest posted maximum.
            </p>
          </>
        ) : (
          <p className="text-[15px] leading-7 text-fg-2">
            {count
              ? `Only ${count} open ${count === 1 ? "listing posts" : "listings post"} a yearly ${result.used.currency} range, even with every filter widened. That is too few for a percentile, so no estimate is shown. The listings are below.`
              : `No open listing posts a yearly ${result.used.currency} range yet. Try another currency.`}
          </p>
        )}
      </div>

      {count ? (
        <div className="border-t border-line">
          <h3 className="px-5 pt-5 text-[15px] font-medium sm:px-6">Listings behind this number ({count})</h3>
          <ul className="mt-2 divide-y divide-line">
            {listed.map((row) => (
              <li key={row.id}>
                <Link href={`/jobs/${row.slug}`} className="group flex flex-col gap-1 px-5 py-3.5 transition-colors hover:bg-chip/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <span>
                    <span className="block font-medium text-fg">{row.title}</span>
                    <span className="text-[13px] text-muted">{row.company}{row.remote ? " · Remote" : ""}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="chip chip-salary tabular">{row.min === row.max ? formatMoney(row.min, row.currency) : `${formatMoney(row.min, row.currency)}–${formatMoney(row.max, row.currency)}`}</span>
                    <ArrowRight className="arrow hidden text-subtle sm:block" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {count > LIST_LIMIT ? (
            <div className="border-t border-line px-5 py-4 sm:px-6">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAll((value) => !value)} aria-expanded={showAll}>
                {showAll ? "Show fewer listings" : `Show all ${count} listings`}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
