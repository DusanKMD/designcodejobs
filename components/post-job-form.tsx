"use client";

import { useEffect, useState } from "react";
import { postJobAction } from "@/app/actions";
import { CompanyLogo } from "@/components/company-logo";
import { ArrowRight, Bolt, Check, Globe, Lock, Pin, Sparkle } from "@/components/icons";
import { formatSalaryShort } from "@/lib/format";
import {
  CURRENCIES,
  EMPTY_POST_JOB,
  parsePostJob,
  POST_JOB_LIMITS,
  type PostJobValues,
} from "@/lib/post-job";
import { FEATURED_ADDON_USD, FEATURED_PRICE_USD, LISTING_DAYS, STANDARD_PRICE_USD } from "@/lib/site";

const FIELD_ORDER = [
  "email",
  "company",
  "domain",
  "title",
  "workplace",
  "location",
  "apply_url",
  "salary_min",
  "salary_max",
  "salary_currency",
  "description",
] as const;

const WORKPLACES = [
  ["remote", "Remote"],
  ["hybrid", "Hybrid"],
  ["onsite", "On-site"],
] as const;

export function PostJobForm() {
  const [values, setValues] = useState<PostJobValues>(EMPTY_POST_JOB);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState("");

  // Pricing cards link to #plan-featured / #plan-standard. Pick the plan and bring the form into view.
  useEffect(() => {
    function fromHash() {
      const hash = window.location.hash;
      if (hash !== "#plan-featured" && hash !== "#plan-standard") return;
      setValues((current) => ({ ...current, featured: hash === "#plan-featured" }));
      document.getElementById("post-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  function update<K extends keyof PostJobValues>(key: K, value: PostJobValues[K]) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (touched[key] || submitted) {
      const parsed = parsePostJob(next);
      setErrors((current) => ({ ...current, [key]: parsed.ok ? "" : parsed.errors[key] || "" }));
      if (key === "salary_min" || key === "salary_max" || key === "workplace") {
        const other = key === "salary_min" ? "salary_max" : key === "salary_max" ? "salary_min" : "location";
        setErrors((current) => ({
          ...current,
          [key]: parsed.ok ? "" : parsed.errors[key] || "",
          [other]: parsed.ok ? "" : parsed.errors[other] || "",
        }));
      }
    }
  }

  function blur(key: string) {
    setTouched((current) => ({ ...current, [key]: true }));
    const parsed = parsePostJob(values);
    setErrors((current) => ({ ...current, [key]: parsed.ok ? "" : parsed.errors[key] || "" }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setFormError("");
    const parsed = parsePostJob(values);
    if (!parsed.ok) {
      setErrors(parsed.errors);
      const first = FIELD_ORDER.find((key) => parsed.errors[key]);
      if (first) document.getElementById(first)?.focus();
      return;
    }
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await postJobAction(form);
      if (result && result.ok === false) {
        setErrors(result.errors);
        setPending(false);
        const first = FIELD_ORDER.find((key) => result.errors[key]);
        if (first) document.getElementById(first)?.focus();
        return;
      }
      setPending(false);
    } catch (error) {
      if (isRedirectError(error)) throw error;
      setFormError("Checkout could not be started. Your answers are still in the form.");
      setPending(false);
    }
  }

  const price = values.featured ? FEATURED_PRICE_USD : STANDARD_PRICE_USD;
  const remote = values.workplace === "remote";
  const show = (key: string) => Boolean((touched[key] || submitted) && errors[key]);
  const errorCount = submitted ? FIELD_ORDER.filter((key) => errors[key]).length : 0;

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={pending} className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <input name="company_website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />

      <div className="grid min-w-0 gap-5">
        <Step n={1} title="Choose a plan" hint="One-time payment. No subscription, no auto-renew.">
          <fieldset>
            <legend className="sr-only">Plan</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <PlanOption
                checked={!values.featured}
                onChange={() => update("featured", false)}
                value="false"
                title="Standard"
                price={`$${STANDARD_PRICE_USD}`}
                points={[`${LISTING_DAYS} days on the board`, "Role, skill, remote, salary pages", "Indexable job page"]}
              />
              <PlanOption
                checked={values.featured}
                onChange={() => update("featured", true)}
                value="true"
                title="Featured"
                badge="Most visible"
                price={`$${FEATURED_PRICE_USD}`}
                points={["Everything in Standard", "Pinned above every matching list", "Highlighted card"]}
              />
            </div>
          </fieldset>
        </Step>

        <Step n={2} title="Company" hint="Shown on the listing. The email is only for the receipt.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextField
                id="email"
                name="email"
                label="Work email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                value={values.email}
                max={POST_JOB_LIMITS.email.max}
                error={errors.email}
                showError={show("email")}
                onBlur={() => blur("email")}
                onChange={(value) => update("email", value)}
              />
            </div>
            <TextField
              id="company"
              name="company"
              label="Company"
              autoComplete="organization"
              required
              placeholder="Acme"
              value={values.company}
              max={POST_JOB_LIMITS.company.max}
              error={errors.company}
              showError={show("company")}
              onBlur={() => blur("company")}
              onChange={(value) => update("company", value)}
            />
            <TextField
              id="domain"
              name="domain"
              label="Company domain"
              placeholder="acme.com"
              hint="Used for your logo."
              value={values.domain}
              max={POST_JOB_LIMITS.domain.max}
              error={errors.domain}
              showError={show("domain")}
              onBlur={() => blur("domain")}
              onChange={(value) => update("domain", value)}
            />
          </div>
        </Step>

        <Step n={3} title="Role" hint="Use the title candidates search for: Design Engineer, UX Engineer, Design Technologist.">
          <div className="grid gap-4">
            <TextField
              id="title"
              name="title"
              label="Job title"
              required
              placeholder="Design Engineer"
              value={values.title}
              max={POST_JOB_LIMITS.title.max}
              error={errors.title}
              showError={show("title")}
              onBlur={() => blur("title")}
              onChange={(value) => update("title", value)}
            />
            <fieldset>
              <legend className="text-[13px] font-medium text-fg">
                Workplace<span className="text-muted" aria-hidden> *</span>
              </legend>
              <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-xl border border-line bg-chip p-1">
                {WORKPLACES.map(([value, label]) => (
                  <label
                    key={value}
                    className={`relative flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${
                      values.workplace === value ? "bg-card text-fg shadow-[var(--shadow-md)]" : "text-muted hover:text-fg"
                    }`}
                  >
                    <input
                      className="sr-only"
                      type="radio"
                      name="workplace"
                      value={value}
                      checked={values.workplace === value}
                      onChange={() => update("workplace", value)}
                      onBlur={() => blur("workplace")}
                    />
                    {value === "remote" ? <Globe size={13} /> : <Pin size={13} />}
                    {label}
                  </label>
                ))}
              </div>
              <p id="workplace-hint" className="mt-1.5 text-xs text-muted">
                {remote ? "Remote listings say where applicants can be based. A city is optional." : "Hybrid and on-site listings need a city or office."}
              </p>
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                id="location"
                name="location"
                label={remote ? "Applicant region" : "Location"}
                required={!remote}
                placeholder={remote ? "Remote - United States" : "London"}
                value={values.location}
                max={POST_JOB_LIMITS.location.max}
                error={errors.location}
                showError={show("location")}
                onBlur={() => blur("location")}
                onChange={(value) => update("location", value)}
              />
              <TextField
                id="apply_url"
                name="apply_url"
                label="Apply URL"
                type="url"
                required
                placeholder="https://jobs.acme.com/design-engineer"
                hint="Candidates apply here, on your ATS."
                value={values.apply_url}
                max={POST_JOB_LIMITS.applyUrl.max}
                error={errors.apply_url}
                showError={show("apply_url")}
                onBlur={() => blur("apply_url")}
                onChange={(value) => update("apply_url", value)}
              />
            </div>
          </div>
        </Step>

        <Step n={4} title="Pay" hint="Listings with a range get more clicks, and the range appears in Google for Jobs. Leave blank to skip.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_120px]">
            <TextField
              id="salary_min"
              name="salary_min"
              label="Yearly minimum"
              type="number"
              inputMode="numeric"
              placeholder="150000"
              value={values.salary_min}
              error={errors.salary_min}
              showError={show("salary_min")}
              onBlur={() => blur("salary_min")}
              onChange={(value) => update("salary_min", value)}
            />
            <TextField
              id="salary_max"
              name="salary_max"
              label="Yearly maximum"
              type="number"
              inputMode="numeric"
              placeholder="190000"
              value={values.salary_max}
              error={errors.salary_max}
              showError={show("salary_max")}
              onBlur={() => blur("salary_max")}
              onChange={(value) => update("salary_max", value)}
            />
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="salary_currency" className="text-[13px] font-medium text-fg">Currency</label>
              <select
                id="salary_currency"
                name="salary_currency"
                value={values.salary_currency}
                onBlur={() => blur("salary_currency")}
                onChange={(event) => update("salary_currency", event.target.value as PostJobValues["salary_currency"])}
                aria-invalid={show("salary_currency") || undefined}
                aria-describedby={show("salary_currency") ? "salary_currency-error" : undefined}
                className="field mt-1.5"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
              {show("salary_currency") ? (
                <p id="salary_currency-error" role="alert" className="field-error mt-1.5 text-[13px]">{errors.salary_currency}</p>
              ) : null}
            </div>
          </div>
        </Step>

        <Step n={5} title="Description" hint="Paste it as is. Line breaks are kept. Name the stack and what the person will ship.">
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="description" className="text-[13px] font-medium text-fg">
                Description<span className="text-muted" aria-hidden> *</span>
              </label>
              <p id="description-hint" className="font-mono text-[11px] text-muted tabular">
                <span className={values.description.trim().length < POST_JOB_LIMITS.description.min ? "" : "text-salary-fg"}>
                  {values.description.trim().length}
                </span>{" "}
                / {POST_JOB_LIMITS.description.min} min
              </p>
            </div>
            <textarea
              id="description"
              name="description"
              rows={12}
              value={values.description}
              aria-required
              aria-invalid={show("description") || undefined}
              aria-describedby={`description-hint${show("description") ? " description-error" : ""}`}
              onBlur={() => blur("description")}
              onChange={(event) => update("description", event.target.value)}
              placeholder={"What you will do\n- Prototype new product surfaces in code\n- Own parts of the design system\n\nWhat we use\nReact, TypeScript, Figma"}
              className="field mt-1.5 resize-y"
            />
            {show("description") ? (
              <p id="description-error" role="alert" className="field-error mt-1.5 text-[13px]">{errors.description}</p>
            ) : null}
          </div>
        </Step>
      </div>

      <aside className="grid gap-4 lg:sticky lg:top-24" aria-label="Preview and checkout">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <p className="flex items-center gap-2 text-[13px] font-medium">
              <span className="live-dot" aria-hidden /> Live preview
            </p>
            <p className="font-mono text-[11px] text-subtle">how candidates see it</p>
          </div>
          <div className="canvas p-4">
            <PreviewCard values={values} />
          </div>
        </div>

        <div className="card p-5">
          <p className="text-[13px] font-semibold">Order summary</p>
          <dl className="mt-3 grid gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Standard post · {LISTING_DAYS} days</dt>
              <dd className="tabular">${STANDARD_PRICE_USD}</dd>
            </div>
            <div className={`flex justify-between transition-colors ${values.featured ? "text-fg" : "text-subtle"}`}>
              <dt className={values.featured ? "text-muted" : ""}>Featured placement</dt>
              <dd className="tabular">{values.featured ? `$${FEATURED_ADDON_USD}` : "not added"}</dd>
            </div>
            <div className="mt-2 flex items-baseline justify-between border-t border-line pt-3">
              <dt className="font-medium">Total due today</dt>
              <dd className="overflow-hidden text-2xl font-semibold tracking-tight tabular">
                <span key={price} className="tick">${price}</span>
              </dd>
            </div>
          </dl>
          {formError ? <p role="alert" className="field-error mt-4 text-sm">{formError}</p> : null}
          {errorCount ? (
            <p role="alert" className="field-error mt-4 text-[13px]">
              {errorCount === 1 ? "One field needs attention." : `${errorCount} fields need attention.`}
            </p>
          ) : null}
          <button type="submit" disabled={pending} className="btn btn-primary btn-lg mt-4 w-full">
            {pending ? (
              <>
                <Spinner /> Creating secure checkout…
              </>
            ) : (
              <>
                Continue to checkout · ${price}
                <ArrowRight className="arrow" />
              </>
            )}
          </button>
          <ul className="mt-4 grid gap-2 text-[12.5px] text-muted">
            <li className="flex items-center gap-2"><Lock size={13} /> Secure checkout by Dodo Payments. Card details never touch this site.</li>
            <li className="flex items-center gap-2"><Bolt size={13} /> Live within a minute of payment.</li>
            <li className="flex items-center gap-2"><Check size={13} /> Failed or cancelled payment publishes nothing.</li>
          </ul>
        </div>
      </aside>
    </form>
  );
}

function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-6" aria-labelledby={`step-${n}`}>
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-[12px] font-medium text-ink-fg">
          {n}
        </span>
        <div>
          <h3 id={`step-${n}`} className="text-[15px] font-semibold tracking-tight">{title}</h3>
          {hint ? <p className="mt-0.5 text-[13px] leading-5 text-muted">{hint}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function PlanOption({
  checked,
  onChange,
  value,
  title,
  price,
  points,
  badge,
}: {
  checked: boolean;
  onChange: () => void;
  value: string;
  title: string;
  price: string;
  points: string[];
  badge?: string;
}) {
  return (
    <label className="option-card block p-4">
      <input type="radio" name="featured" value={value} checked={checked} onChange={onChange} className="sr-only" />
      <span className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-2.5">
          <span className="radio-dot h-[18px] w-[18px] rounded-full border-2 border-line-strong bg-card" aria-hidden />
          <span className="text-[15px] font-semibold">{title}</span>
          {badge ? <span className="chip chip-featured h-5 px-2 text-[10.5px]"><Sparkle size={10} /> {badge}</span> : null}
        </span>
        <span className="text-lg font-semibold tracking-tight tabular">{price}</span>
      </span>
      <span className="mt-3 grid gap-1.5 pl-7">
        {points.map((point) => (
          <span key={point} className="flex items-center gap-1.5 text-[12.5px] text-muted">
            <Check size={12} className="text-accent-text" /> {point}
          </span>
        ))}
      </span>
    </label>
  );
}

function PreviewCard({ values }: { values: PostJobValues }) {
  const min = values.salary_min.trim() ? Number(values.salary_min) : null;
  const max = values.salary_max.trim() ? Number(values.salary_max) : null;
  const salary = formatSalaryShort({
    salaryMin: Number.isFinite(min) ? min : null,
    salaryMax: Number.isFinite(max) ? max : null,
    salaryCurrency: values.salary_currency,
    salaryUnit: "YEAR",
  });
  const company = values.company.trim() || "Your company";
  const title = values.title.trim() || "Design Engineer";
  const place = values.location.trim().replace(/^remote\s*[-·:,]?\s*/i, "");
  const workplace = WORKPLACES.find(([value]) => value === values.workplace)?.[1] || "Remote";
  return (
    <div className={`job-card px-4 py-4 ${values.featured ? "is-featured" : ""}`} aria-hidden>
      <div className="flex items-start gap-3">
        <CompanyLogo key={values.domain} name={company} domain={values.domain.trim() || undefined} size={40} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-1.5 text-[12.5px]">
            <span className={`font-medium ${values.company.trim() ? "text-fg-2" : "text-subtle"}`}>{company}</span>
            {values.featured ? <span className="chip chip-featured h-5 px-2 text-[10.5px]">Featured</span> : null}
            <span className="chip chip-accent h-5 px-2 text-[10.5px]">New</span>
            <span className="text-muted">· Today</span>
          </p>
          <p className={`mt-0.5 truncate text-[15.5px] font-semibold tracking-tight ${values.title.trim() ? "text-fg" : "text-subtle"}`}>{title}</p>
          <p className="mt-2 flex flex-wrap gap-1.5">
            <span className="chip">
              {values.workplace === "remote" ? <Globe size={12} /> : <Pin size={12} />}
              {workplace}
            </span>
            {place ? <span className="chip max-w-[10rem] truncate">{place}</span> : null}
            {salary ? <span className="chip chip-salary tabular">{salary}</span> : null}
          </p>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity=".25" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TextField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  showError,
  required,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  max,
  hint,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  showError: boolean;
  required?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "numeric";
  max?: number;
  hint?: string;
}) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const length = value.trim().length;
  const near = max ? length > max * 0.85 : false;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-medium text-fg">
          {label}
          {required ? <span className="text-muted" aria-hidden> *</span> : null}
        </label>
        {max && near ? (
          <span className="font-mono text-[11px] text-muted tabular" aria-hidden>
            {length}/{max}
          </span>
        ) : null}
      </div>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        aria-required={required || undefined}
        aria-invalid={showError || undefined}
        aria-describedby={[hint && !showError ? hintId : "", showError ? errorId : ""].filter(Boolean).join(" ") || undefined}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        className="field mt-1.5"
      />
      {hint && !showError ? <p id={hintId} className="mt-1.5 text-xs text-muted">{hint}</p> : null}
      {showError ? <p id={errorId} role="alert" className="field-error mt-1.5 text-[13px]">{error}</p> : null}
    </div>
  );
}

function isRedirectError(error: unknown) {
  return typeof error === "object" && error !== null && "digest" in error && String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT");
}
