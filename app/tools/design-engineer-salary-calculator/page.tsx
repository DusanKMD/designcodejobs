import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { SalaryCalculator } from "@/components/salary-calculator";
import { Faq, SectionHeading } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import { breadcrumbLd, faqLd, webApplicationLd } from "@/lib/jsonld";
import { calculate, currenciesIn, DEFAULT_INPUT, salaryRows } from "@/lib/salary-calculator";
import { listedJobs } from "@/lib/query";
import { pageMeta } from "@/lib/seo";
import { getAllJobs } from "@/lib/store";

const PATH = "/tools/design-engineer-salary-calculator";
const TITLE = "Design engineer salary calculator";

export const metadata = pageMeta({
  title: "Design engineer salary calculator (free, from real job posts)",
  description:
    "Free design engineer salary calculator. Pick role, level, location and currency to see p25, median and p75 pay from employer-posted ranges on open listings.",
  path: PATH,
  index: true,
});

function faqs(input: { count: number; median: string | null }) {
  return [
    {
      q: "How much does a design engineer make?",
      a: input.median
        ? `Across ${input.count} open software design engineering listings that post a yearly USD base, the median midpoint is ${input.median}. That figure comes from employer-posted ranges on Design Code Jobs, not a survey. Use the calculator to narrow it by role, seniority, location and currency.`
        : "No open listing posts a yearly USD base right now, so there is no median to show. The calculator fills in as soon as employers publish ranges. Nothing is estimated in the meantime.",
    },
    {
      q: "Where does the salary calculator get its numbers?",
      a: "Every number comes from a yearly base salary range an employer wrote on an open job post we list: Ashby compensation, Lever salary ranges, or a range in a Greenhouse description. Equity, OTE and hidden pay are left out. It is posted pay, not self-reported survey data.",
    },
    {
      q: "How are role and seniority decided?",
      a: "Both come from the job title. UI engineer counts as UX engineer, prototyper as design technologist, and creative developer as creative technologist. Senior, staff, principal, lead and junior are read from the title. A title with no level word counts as mid-level.",
    },
    {
      q: "Why did the calculator widen my filters?",
      a: "A percentile from one or two listings would be noise. When fewer than three posted ranges match, the calculator drops seniority first, then location, then role, and tells you which filters it widened. It never fills the gap with an invented figure.",
    },
    {
      q: "Are salaries converted between currencies?",
      a: "No. Each currency is counted on its own, in the currency the employer posted. A GBP range is never converted into USD or mixed into a USD median. Pick a currency to see only the ranges posted in it.",
    },
  ];
}

export default async function SalaryCalculatorPage() {
  const rows = salaryRows(listedJobs(await getAllJobs()));
  const currencies = currenciesIn(rows);
  const initial = calculate(rows, { ...DEFAULT_INPUT, currency: currencies[0]?.code || "USD" });
  const usdRows = rows.filter((row) => row.currency === "USD");
  const usd = calculate(rows, { ...DEFAULT_INPUT, currency: "USD" });
  const median = usdRows.length >= 3 && usd.median != null ? formatMoney(usd.median, "USD") : null;
  const items = faqs({ count: usdRows.length, median });
  const crumbs = [
    { name: "Jobs", path: "/" },
    { name: "Design engineer salary", path: "/salary" },
    { name: TITLE, path: PATH },
  ];

  return (
    <article>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd data={faqLd(items)} />
      <JsonLd
        data={webApplicationLd({
          name: "Design Engineer Salary Calculator",
          description: "Estimate design engineer, UX engineer, design technologist, design systems engineer and creative technologist pay from employer-posted salary ranges.",
          path: PATH,
        })}
      />
      <PageHeader
        crumbs={crumbs}
        kicker="Free tool"
        title={TITLE}
        lede={
          <p>
            This design engineer salary calculator estimates yearly base pay from salary ranges employers posted on {rows.length} open listings. Choose a role, level, location and currency to see the 25th percentile, median and 75th percentile, plus the jobs behind them.
          </p>
        }
      />

      <div className="mx-auto max-w-4xl px-5 sm:px-6">
        <section className="mt-10" aria-labelledby="calculator-heading">
          <h2 id="calculator-heading" className="sr-only">Calculate a design engineer salary</h2>
          <SalaryCalculator rows={rows} />
          {initial.median == null ? null : (
            <p className="mt-3 text-[13px] text-muted">Data refreshes with every board sync. Figures are posted ranges, not a salary survey.</p>
          )}
        </section>

        <section className="reveal mt-14 max-w-3xl" aria-labelledby="how-heading">
          <SectionHeading id="how-heading" kicker="Method" title="How does the design engineer salary calculator work?" />
          <p className="mt-3 text-[15.5px] leading-7 text-fg-2">
            The calculator takes the yearly base range on each open listing, finds its midpoint, and reports the 25th, 50th and 75th percentile of those midpoints for your filters. It counts only software design engineering roles, never mechanical or hardware ones. With fewer than three matches it widens the filters and says so.
          </p>
          <p className="mt-3 text-[15px] leading-7 text-muted">
            Because it uses posted ranges, it reflects what companies hiring right now say they will pay, which can differ from what people already in the job earn. Bonus, equity and OTE are not included. For the full table by role, see <Link href="/salary" className="link">design engineer salary</Link>, and for how posted pay is collected read the <Link href="/guides/design-engineer-salary" className="link">design engineer salary guide</Link>.
          </p>
        </section>

        <div className="mt-14 max-w-3xl">
          <Faq id="faq-heading" kicker="Questions" title="Design engineer salary questions" items={items} />
        </div>
      </div>
    </article>
  );
}
