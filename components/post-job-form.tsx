"use client";

import { useState } from "react";
import { postJobAction } from "@/app/actions";
import {
  CURRENCIES,
  EMPTY_POST_JOB,
  parsePostJob,
  POST_JOB_LIMITS,
  type PostJobValues,
} from "@/lib/post-job";
import { FEATURED_ADDON_USD, FEATURED_PRICE_USD, STANDARD_PRICE_USD } from "@/lib/site";

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

export function PostJobForm() {
  const [values, setValues] = useState<PostJobValues>(EMPTY_POST_JOB);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState("");

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

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6" aria-busy={pending}>
      <input name="company_website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
      <p className="text-sm text-muted">Required fields are marked.</p>
      <Section title="Company">
      <TextField
        id="email"
        name="email"
        label="Work email"
        type="email"
        autoComplete="email"
        required
        value={values.email}
        max={POST_JOB_LIMITS.email.max}
        minHint={POST_JOB_LIMITS.email.min}
        error={errors.email}
        showError={Boolean((touched.email || submitted) && errors.email)}
        onBlur={() => blur("email")}
        onChange={(value) => update("email", value)}
      />
      <TextField
        id="company"
        name="company"
        label="Company"
        autoComplete="organization"
        required
        value={values.company}
        max={POST_JOB_LIMITS.company.max}
        minHint={POST_JOB_LIMITS.company.min}
        error={errors.company}
        showError={Boolean((touched.company || submitted) && errors.company)}
        onBlur={() => blur("company")}
        onChange={(value) => update("company", value)}
      />
      <TextField
        id="domain"
        name="domain"
        label="Company domain"
        placeholder="vercel.com"
        value={values.domain}
        max={POST_JOB_LIMITS.domain.max}
        error={errors.domain}
        showError={Boolean((touched.domain || submitted) && errors.domain)}
        onBlur={() => blur("domain")}
        onChange={(value) => update("domain", value)}
      />
      </Section>
      <Section title="Role">
      <TextField
        id="title"
        name="title"
        label="Job title"
        required
        placeholder="Design Engineer"
        value={values.title}
        max={POST_JOB_LIMITS.title.max}
        minHint={POST_JOB_LIMITS.title.min}
        error={errors.title}
        showError={Boolean((touched.title || submitted) && errors.title)}
        onBlur={() => blur("title")}
        onChange={(value) => update("title", value)}
      />
      <fieldset>
        <legend className="text-sm font-medium">
          Workplace
          <span aria-hidden> *</span>
        </legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(
            [
              ["remote", "Remote"],
              ["hybrid", "Hybrid"],
              ["onsite", "On-site"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className={`flex h-11 cursor-pointer items-center justify-center rounded-xl border text-sm font-medium focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 ${values.workplace === value ? "border-accent bg-accent text-accent-fg focus-within:outline-fg" : "border-line focus-within:outline-accent"}`}>
              <input
                className="sr-only"
                type="radio"
                name="workplace"
                value={value}
                checked={values.workplace === value}
                onChange={() => update("workplace", value)}
                onBlur={() => blur("workplace")}
              />
              {label}
            </label>
          ))}
        </div>
        <p id="workplace-hint" className="mt-2 text-xs text-muted">
          {remote ? "Remote listings ask where applicants can be based. A city is optional." : "Hybrid and on-site listings need a city or office."}
        </p>
      </fieldset>
      <TextField
        id="location"
        name="location"
        label={remote ? "Applicant region" : "Location"}
        required={!remote}
        placeholder={remote ? "Remote - United States" : "London"}
        value={values.location}
        max={POST_JOB_LIMITS.location.max}
        minHint={remote ? undefined : POST_JOB_LIMITS.location.min}
        error={errors.location}
        showError={Boolean((touched.location || submitted) && errors.location)}
        onBlur={() => blur("location")}
        onChange={(value) => update("location", value)}
      />
      <TextField
        id="apply_url"
        name="apply_url"
        label="Apply URL"
        type="url"
        required
        placeholder="https://"
        value={values.apply_url}
        max={POST_JOB_LIMITS.applyUrl.max}
        minHint={POST_JOB_LIMITS.applyUrl.min}
        error={errors.apply_url}
        showError={Boolean((touched.apply_url || submitted) && errors.apply_url)}
        onBlur={() => blur("apply_url")}
        onChange={(value) => update("apply_url", value)}
      />
      </Section>
      <Section title="Pay">
      <div className="grid gap-3 sm:grid-cols-3">
        <TextField
          id="salary_min"
          name="salary_min"
          label="Salary min"
          type="number"
          inputMode="numeric"
          value={values.salary_min}
          error={errors.salary_min}
          showError={Boolean((touched.salary_min || submitted) && errors.salary_min)}
          onBlur={() => blur("salary_min")}
          onChange={(value) => update("salary_min", value)}
        />
        <TextField
          id="salary_max"
          name="salary_max"
          label="Salary max"
          type="number"
          inputMode="numeric"
          value={values.salary_max}
          error={errors.salary_max}
          showError={Boolean((touched.salary_max || submitted) && errors.salary_max)}
          onBlur={() => blur("salary_max")}
          onChange={(value) => update("salary_max", value)}
        />
        <div>
          <label htmlFor="salary_currency" className="text-sm font-medium">Currency</label>
          <select
            id="salary_currency"
            name="salary_currency"
            value={values.salary_currency}
            onBlur={() => blur("salary_currency")}
            onChange={(event) => update("salary_currency", event.target.value as PostJobValues["salary_currency"])}
            aria-invalid={Boolean((touched.salary_currency || submitted) && errors.salary_currency) || undefined}
            aria-describedby={(touched.salary_currency || submitted) && errors.salary_currency ? "salary_currency-error" : undefined}
            className={`mt-1 h-11 w-full rounded-xl border bg-bg px-3 text-sm ${(touched.salary_currency || submitted) && errors.salary_currency ? "border-accent" : "border-line"}`}
          >
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
          {(touched.salary_currency || submitted) && errors.salary_currency ? (
            <p id="salary_currency-error" role="alert" className="mt-1 text-sm text-fg">{errors.salary_currency}</p>
          ) : null}
        </div>
      </div>
      <p className="text-xs text-muted">Leave salary blank if you are not publishing a range. Minimum must be less than or equal to maximum.</p>
      </Section>
      <Section title="Description">
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="description" className="text-sm font-medium">
            Description
            <span aria-hidden> *</span>
          </label>
          <p id="description-hint" className="text-xs tabular-nums text-muted">
            {values.description.trim().length} / {POST_JOB_LIMITS.description.max} · {POST_JOB_LIMITS.description.min}–{POST_JOB_LIMITS.description.max}
          </p>
        </div>
        <textarea
          id="description"
          name="description"
          rows={10}
          value={values.description}
          aria-required
          aria-invalid={Boolean((touched.description || submitted) && errors.description) || undefined}
          aria-describedby={`description-hint${(touched.description || submitted) && errors.description ? " description-error" : ""}`}
          onBlur={() => blur("description")}
          onChange={(event) => update("description", event.target.value)}
          className={`mt-1 w-full rounded-xl border bg-bg px-3 py-2 text-sm leading-6 ${(touched.description || submitted) && errors.description ? "border-accent" : "border-line"}`}
        />
        {(touched.description || submitted) && errors.description ? (
          <p id="description-error" role="alert" className="mt-1 text-sm text-fg">{errors.description}</p>
        ) : null}
      </div>
      <label className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${values.featured ? "border-accent bg-salary" : "border-line"}`}>
        <input
          type="checkbox"
          name="featured"
          checked={values.featured}
          onChange={(event) => update("featured", event.target.checked)}
          className="mt-1"
        />
        <span>
          <span className="font-medium text-fg">Feature this role (+${FEATURED_ADDON_USD})</span>
          <span className="mt-1 block text-muted">Highlighted on the board for the same 30 days. Checkout total ${FEATURED_PRICE_USD}.</span>
        </span>
      </label>
      </Section>
      {formError ? <p role="alert" className="text-sm text-fg">{formError}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-accent-fg hover:opacity-90 disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Creating checkout…" : `Continue to checkout · $${price}`}
      </button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="card space-y-5 p-5">
      <legend className="px-1 text-base font-bold">{title}</legend>
      {children}
    </fieldset>
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
  minHint,
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
  minHint?: number;
}) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
          {required ? <span aria-hidden> *</span> : null}
        </label>
        {max ? (
          <p id={hintId} className="text-xs tabular-nums text-muted">
            {value.trim().length} / {max}{minHint ? ` · ${minHint}–${max}` : ""}
          </p>
        ) : (
          <p id={hintId} className="sr-only">{label}</p>
        )}
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
        aria-describedby={`${hintId}${showError ? ` ${errorId}` : ""}`}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-1 h-11 w-full rounded-xl border bg-bg px-3 text-sm ${showError ? "border-accent" : "border-line"}`}
      />
      {showError ? <p id={errorId} role="alert" className="mt-1 text-sm text-fg">{error}</p> : null}
    </div>
  );
}

function isRedirectError(error: unknown) {
  return typeof error === "object" && error !== null && "digest" in error && String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT");
}
