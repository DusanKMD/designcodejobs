"use client";

import { useEffect, useId, useState } from "react";
import { CHECKLIST, CHECKLIST_STORAGE_KEY, parseChecked } from "@/lib/portfolio-checklist";

export function PortfolioChecklist({ counts }: { counts: Record<string, number> }) {
  const headingId = useId();
  const [checked, setChecked] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.has("done") ? parseChecked(params.get("done")) : null;
    const stored = parseChecked(window.localStorage.getItem(CHECKLIST_STORAGE_KEY));
    setChecked(fromUrl ?? stored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(CHECKLIST_STORAGE_KEY, checked.join(","));
    const params = new URLSearchParams(window.location.search);
    if (checked.length) params.set("done", checked.join(","));
    else params.delete("done");
    const query = params.toString();
    const next = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", next);
  }, [checked, ready]);

  function toggle(id: string) {
    setNotice("");
    setChecked((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function share() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setNotice("Share link copied.");
    } catch {
      setNotice(url);
    }
  }

  const done = checked.length;
  const total = CHECKLIST.length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-line p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p id={headingId} className="text-[13px] text-muted">{done} of {total} checked</p>
          <p className="font-mono text-sm tabular text-fg-2">{pct}%</p>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-chip"
          role="progressbar"
          aria-labelledby={headingId}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={done}
        >
          <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2 print:hidden">
          <button type="button" className="btn btn-secondary btn-sm" onClick={share}>Copy share link</button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => window.print()}>Print</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setChecked([])}>Clear</button>
        </div>
        {notice ? <p className="mt-3 break-all text-sm text-muted" role="status">{notice}</p> : null}
      </div>
      <ul className="divide-y divide-line">
        {CHECKLIST.map((item) => {
          const count = counts[item.id] || 0;
          const on = checked.includes(item.id);
          return (
            <li key={item.id}>
              <label className="flex cursor-pointer gap-3 px-5 py-4 sm:px-6">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 shrink-0"
                  style={{ accentColor: "var(--accent)" }}
                  checked={on}
                  onChange={() => toggle(item.id)}
                />
                <span>
                  <span className="block font-medium text-fg">{item.label}</span>
                  <span className="mt-1 block text-[13.5px] leading-6 text-muted">
                    {item.why} Mentioned in {count} open {count === 1 ? "listing" : "listings"}.
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
