"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_JD,
  generateJobDescription,
  JD_LEVELS,
  JD_ROLES,
  JD_STACK,
  postJobHref,
  POST_DRAFT_KEY,
  POST_PRICE_LABEL,
  type JdInput,
  type JdStack,
} from "@/lib/job-description";

export function JobDescriptionForm() {
  const [input, setInput] = useState<JdInput>(DEFAULT_JD);
  const [text, setText] = useState(() => generateJobDescription(DEFAULT_JD));
  const [copied, setCopied] = useState(false);
  const href = useMemo(() => postJobHref(input), [input]);

  function update(next: JdInput) {
    setInput(next);
    setText(generateJobDescription(next));
    setCopied(false);
  }

  function toggleStack(item: JdStack) {
    const stack = input.stack.includes(item) ? input.stack.filter((value) => value !== item) : [...input.stack, item];
    update({ ...input, stack });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function saveDraft() {
    try {
      window.sessionStorage.setItem(POST_DRAFT_KEY, JSON.stringify({ description: text }));
    } catch {
      /* The short fields still travel in the query string. */
    }
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
      <form className="card space-y-4 p-5" onSubmit={(event) => event.preventDefault()} aria-label="Job description inputs">
        <div>
          <label htmlFor="jd-role" className="text-[13px] font-medium">Role</label>
          <select id="jd-role" className="field mt-1.5" value={input.role} onChange={(event) => update({ ...input, role: event.target.value as JdInput["role"] })}>
            {JD_ROLES.map((role) => <option key={role.value} value={role.value}>{role.title}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="jd-level" className="text-[13px] font-medium">Seniority</label>
          <select id="jd-level" className="field mt-1.5" value={input.level} onChange={(event) => update({ ...input, level: event.target.value as JdInput["level"] })}>
            {JD_LEVELS.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
          </select>
        </div>
        <fieldset>
          <legend className="text-[13px] font-medium">Stack</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {JD_STACK.map((item) => (
              <label key={item} className="flex items-center gap-2 text-[13px] text-fg-2">
                <input type="checkbox" checked={input.stack.includes(item)} onChange={() => toggleStack(item)} style={{ accentColor: "var(--accent)" }} />
                {item}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-[13px] font-medium">Workplace</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(["remote", "hybrid", "onsite"] as const).map((value) => (
              <label key={value} className={`flex h-10 cursor-pointer items-center justify-center rounded-xl border text-[13px] font-medium focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent ${input.workplace === value ? "border-accent bg-accent text-accent-fg" : "border-line"}`}>
                <input className="sr-only" type="radio" name="workplace" value={value} checked={input.workplace === value} onChange={() => update({ ...input, workplace: value })} />
                {value === "onsite" ? "On-site" : value[0].toUpperCase() + value.slice(1)}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="jd-location" className="text-[13px] font-medium">Location</label>
          <input id="jd-location" className="field mt-1.5" value={input.location} onChange={(event) => update({ ...input, location: event.target.value })} placeholder="United States, or a city" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="jd-min" className="text-[13px] font-medium">Salary min</label>
            <input id="jd-min" className="field mt-1.5" inputMode="numeric" value={input.salaryMin} onChange={(event) => update({ ...input, salaryMin: event.target.value })} />
          </div>
          <div>
            <label htmlFor="jd-max" className="text-[13px] font-medium">Salary max</label>
            <input id="jd-max" className="field mt-1.5" inputMode="numeric" value={input.salaryMax} onChange={(event) => update({ ...input, salaryMax: event.target.value })} />
          </div>
        </div>
        <div>
          <label htmlFor="jd-currency" className="text-[13px] font-medium">Currency</label>
          <select id="jd-currency" className="field mt-1.5" value={input.currency} onChange={(event) => update({ ...input, currency: event.target.value })}>
            {["USD", "CAD", "EUR", "GBP"].map((code) => <option key={code}>{code}</option>)}
          </select>
        </div>
      </form>

      <div className="card p-5 sm:p-6">
        <label htmlFor="jd-output" className="text-[13px] font-medium">Generated job description</label>
        <textarea id="jd-output" className="field mt-1.5 min-h-[28rem] font-mono text-[13px]" value={text} onChange={(event) => { setText(event.target.value); setCopied(false); }} />
        <p className="mt-2 text-[12px] text-muted">Changing the form rewrites this draft. You can edit it before copying.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn btn-secondary" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
          <a href={href} className="btn btn-primary" onClick={saveDraft}>{POST_PRICE_LABEL}</a>
        </div>
        <p className="sr-only" role="status">{copied ? "Copied the job description." : ""}</p>
      </div>
    </div>
  );
}
