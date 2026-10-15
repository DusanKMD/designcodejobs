import { postJobAction } from "@/app/actions";
import { pageMeta } from "@/lib/seo";
import { FEATURED_PRICE_USD, STANDARD_PRICE_USD } from "@/lib/site";

export const metadata = pageMeta({
  title: "Post a design engineer job",
  description: `Post a software design engineer role for $${STANDARD_PRICE_USD} for 30 days. Featured placement is $${FEATURED_PRICE_USD}.`,
  path: "/post-a-job",
  index: true,
});

export default async function PostJobPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const search = await searchParams;
  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <h1 className="text-4xl font-medium tracking-tight">Post a job</h1>
      <p className="mt-4 text-[15px] leading-7 text-muted">
        ${STANDARD_PRICE_USD} for 30 days. Add featured placement for ${FEATURED_PRICE_USD - STANDARD_PRICE_USD} more (${FEATURED_PRICE_USD} total). The role goes live when Dodo Payments confirms the payment. Hardware and mechanical roles are not listed.
      </p>
      {search.error ? <p className="mt-4 text-sm">Check the email, title, apply link, and description (at least a short paragraph).</p> : null}
      <form action={postJobAction} className="mt-8 space-y-4">
        <input name="company_website" className="hidden" tabIndex={-1} autoComplete="off" />
        <Field label="Work email" name="email" type="email" required />
        <Field label="Company" name="company" required />
        <Field label="Company domain" name="domain" placeholder="vercel.com" />
        <Field label="Job title" name="title" required placeholder="Design Engineer" />
        <label className="block text-sm">
          Workplace
          <select name="workplace" className="mt-1 h-10 w-full rounded-lg border border-line bg-bg px-3">
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>
        </label>
        <Field label="Location" name="location" placeholder="Remote - US, or London" />
        <Field label="Apply URL" name="apply_url" type="url" required placeholder="https://" />
        <div className="grid grid-cols-3 gap-2">
          <Field label="Salary min" name="salary_min" type="number" />
          <Field label="Salary max" name="salary_max" type="number" />
          <Field label="Currency" name="salary_currency" placeholder="USD" />
        </div>
        <label className="block text-sm">
          Description
          <textarea name="description" required minLength={80} rows={8} className="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" />
          Feature this role (+${FEATURED_PRICE_USD - STANDARD_PRICE_USD})
        </label>
        <button type="submit" className="h-11 rounded-full bg-fg px-5 text-sm font-medium text-bg">
          Continue to checkout
        </button>
      </form>
    </div>
  );
}

function Field({ label, name, type = "text", required, placeholder }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="block text-sm">
      {label}
      <input name={name} type={type} required={required} placeholder={placeholder} className="mt-1 h-10 w-full rounded-lg border border-line bg-bg px-3" />
    </label>
  );
}
