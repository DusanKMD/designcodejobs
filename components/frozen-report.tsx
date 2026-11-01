import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { Faq, SectionHeading, StatStrip } from "@/components/ui";
import { formatDate, formatMoney } from "@/lib/format";
import { breadcrumbLd, datasetLd, faqLd } from "@/lib/jsonld";
import {
  isSmallSample,
  openingParagraph,
  RELATED_LINKS,
  reportFaqs,
  reportSections,
  reportStats,
  roleLabel,
  snapshotTitle,
  workplaceLabel,
} from "@/lib/reports/copy";
import { monthLabel } from "@/lib/reports/month";
import type { ReportSnapshot } from "@/lib/reports/types";

export function FrozenReport({ report }: { report: ReportSnapshot }) {
  const title = snapshotTitle(report);
  const label = monthLabel(report.month);
  const path = `/reports/${report.month}`;
  const crumbs = [
    { name: "Jobs", path: "/" },
    { name: "Reports", path: "/reports" },
    { name: label, path },
  ];
  const sections = reportSections(report);
  const faqs = reportFaqs(report);
  const [salaryGuide, calculator, systemsGuide] = RELATED_LINKS;
  const byId = Object.fromEntries(sections.map((section) => [section.id, section]));

  return (
    <article>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd
        data={datasetLd({
          name: title,
          description: report.scopeNote,
          path,
        })}
      />
      <JsonLd data={faqLd(faqs)} />
      <PageHeader crumbs={crumbs} kicker={`Frozen snapshot · ${label}`} title={title} lede={<p>{openingParagraph(report)}</p>}>
        <div className="mt-8 max-w-3xl">
          <StatStrip stats={reportStats(report)} />
          <p className="mt-3 text-[13px] leading-5 text-muted">
            Frozen at the last successful ingest. This page does not follow the live board.
          </p>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <ReportSection section={byId["open-roles"]} />

        <ReportSection section={byId.companies}>
          <ul className="card mt-5 divide-y divide-line">
            {report.topCompanies.map((company) => (
              <li key={company.name} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <span className="font-medium">{company.name}</span>
                <span className="font-mono text-[13px] tabular text-fg-2">
                  {company.openRoles} open {company.openRoles === 1 ? "role" : "roles"}
                </span>
              </li>
            ))}
          </ul>
        </ReportSection>

        <ReportSection section={byId.remote}>
          <ul className="mt-5 grid gap-2 sm:grid-cols-3">
            <WorkplaceStat label="Fully remote" value={report.workplaceOpen.remote} />
            <WorkplaceStat label="Hybrid" value={report.workplaceOpen.hybrid} />
            <WorkplaceStat label="On-site" value={report.workplaceOpen.onsite} />
          </ul>
          <p className="mt-3 text-[13px] leading-5 text-muted">Open roles at the last sync. Hybrid is counted on its own, not as remote.</p>
        </ReportSection>

        <ReportSection section={byId.salary}>
          <div className="card mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <caption className="sr-only">
                Posted yearly salary by role family and currency for {label}. Currencies are not converted.
              </caption>
              <thead className="border-b border-line bg-chip/60 text-[12px] text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Role</th>
                  <th scope="col" className="px-4 py-3 font-medium">Currency</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Listings</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Median midpoint</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Lowest posted min</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Highest posted max</th>
                  <th scope="col" className="px-4 py-3 font-medium">Sample</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {report.salaryByRoleAndCurrency.map((row) => (
                  <tr key={`${row.roleFamily}-${row.currency}`} className="transition-colors hover:bg-chip/50">
                    <th scope="row" className="px-4 py-3.5 font-medium">{roleLabel(row.roleFamily)}</th>
                    <td className="px-4 py-3.5 font-mono text-[13px] tabular">{row.currency}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-[13px] tabular">{row.listings}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-[13px] tabular">{formatMoney(row.medianMidpoint, row.currency)}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-[13px] tabular">{formatMoney(row.lowestPostedMin, row.currency)}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-[13px] tabular">{formatMoney(row.highestPostedMax, row.currency)}</td>
                    <td className="px-4 py-3.5 text-[13px] text-muted">{isSmallSample(row) ? "Small sample" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[12px] text-muted sm:hidden">Scroll sideways for every salary column.</p>
          <p className="mt-3 text-[13px] leading-5 text-muted">{report.noteOnNonUsd}</p>
          <p className="mt-4 text-[15px] leading-7 text-fg-2">
            The yearly base method is the one in the <Link href={salaryGuide.href} className="link">{salaryGuide.anchor}</Link>. The{" "}
            <Link href={calculator.href} className="link">{calculator.anchor}</Link> filters the live board, a different dataset from this frozen month. For the design systems seat, read{" "}
            <Link href={systemsGuide.href} className="link">{systemsGuide.anchor}</Link>.
          </p>
        </ReportSection>

        <ReportSection section={byId["remote-pay"]}>
          <div className="card mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">USD posted yearly midpoint by workplace for {label}</caption>
              <thead className="border-b border-line bg-chip/60 text-[12px] text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">Workplace</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">Listings</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">Median midpoint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                <tr>
                  <th scope="row" className="px-5 py-3.5 font-medium">Fully remote</th>
                  <td className="px-5 py-3.5 text-right font-mono text-[13px] tabular">{report.usdRemoteVsNot.remote.n}</td>
                  <td className="px-5 py-3.5 text-right font-mono text-[13px] tabular">{formatMoney(report.usdRemoteVsNot.remote.medianMidpoint, "USD")}</td>
                </tr>
                <tr>
                  <th scope="row" className="px-5 py-3.5 font-medium">On-site or hybrid</th>
                  <td className="px-5 py-3.5 text-right font-mono text-[13px] tabular">{report.usdRemoteVsNot.onsiteOrHybrid.n}</td>
                  <td className="px-5 py-3.5 text-right font-mono text-[13px] tabular">{formatMoney(report.usdRemoteVsNot.onsiteOrHybrid.medianMidpoint, "USD")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ReportSection>

        <ReportSection section={byId["new-roles"]}>
          <ol className="card mt-5 divide-y divide-line">
            {report.newRoles.map((role) => (
              <li key={`${role.company}-${role.title}-${role.datePosted}`} className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  <span className="block font-medium">{role.title}</span>
                  <span className="text-[13px] text-muted">{role.company}</span>
                </span>
                <span className="flex items-center gap-3 text-[13px] text-fg-2">
                  <time dateTime={role.datePosted}>{formatDate(role.datePosted)}</time>
                  <span className="chip">{workplaceLabel(role.workplace)}</span>
                </span>
              </li>
            ))}
          </ol>
        </ReportSection>

        <section className="reveal mt-14" aria-labelledby="method-heading">
          <SectionHeading id="method-heading" kicker={byId.method.kicker} title={byId.method.question} />
          <p className="mt-3 text-[15.5px] leading-7 text-fg-2">{byId.method.answer}</p>
          <div className="mt-5 space-y-3 text-[14.5px] leading-7 text-muted">
            <p>{report.scopeNote}</p>
            <p>{report.noteOnNonUsd}</p>
          </div>
        </section>

        <div className="mt-14">
          <Faq id="faq-heading" kicker="Questions" title={`Questions about the ${label} report`} items={faqs} />
        </div>
      </div>
    </article>
  );
}

function ReportSection({
  section,
  children,
}: {
  section: { id: string; kicker: string; question: string; answer: string };
  children?: React.ReactNode;
}) {
  return (
    <section className="reveal mt-14" aria-labelledby={`${section.id}-heading`}>
      <SectionHeading id={`${section.id}-heading`} kicker={section.kicker} title={section.question} />
      <p className="mt-3 text-[15.5px] leading-7 text-fg-2">{section.answer}</p>
      {children}
    </section>
  );
}

function WorkplaceStat({ label, value }: { label: string; value: number }) {
  return (
    <li className="rounded-2xl border border-line bg-card px-4 py-3 shadow-[var(--shadow-sm)]">
      <p className="text-[12px] font-medium text-muted">{label}</p>
      <p className="mt-0.5 font-mono text-[19px] font-medium tracking-tight tabular">{value}</p>
    </li>
  );
}
