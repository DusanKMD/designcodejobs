import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { breadcrumbLd, itemListLd } from "@/lib/jsonld";
import { reportsIndexDescription } from "@/lib/reports/copy";
import { currentMonth, monthLabel } from "@/lib/reports/month";
import { listSnapshots } from "@/lib/reports/registry";
import { pageMeta } from "@/lib/seo";

export function generateMetadata() {
  const snapshots = listSnapshots();
  return pageMeta({
    title: "Design engineering jobs reports",
    description: reportsIndexDescription(snapshots),
    path: "/reports",
    index: true,
  });
}

export default function ReportsIndexPage() {
  const now = new Date();
  const current = currentMonth(now);
  const snapshots = [...listSnapshots()].reverse();
  const crumbs = [
    { name: "Jobs", path: "/" },
    { name: "Reports", path: "/reports" },
  ];
  const entries = [
    {
      href: `/reports/${current}`,
      title: monthLabel(current),
      kicker: "Live board",
      summary: "Calculated from the live board. Figures change as roles open and close.",
    },
    ...snapshots
      .filter((snapshot) => snapshot.month !== current)
      .map((snapshot) => ({
        href: `/reports/${snapshot.month}`,
        title: monthLabel(snapshot.month),
        kicker: "Frozen snapshot",
        summary: `${snapshot.openAtLastSync} open roles at ${snapshot.openCompanies} companies at last sync.`,
      })),
  ];

  return (
    <div>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd
        data={itemListLd(
          entries.map((entry) => ({
            name: entry.title,
            path: entry.href,
            description: entry.summary,
          })),
        )}
      />
      <PageHeader
        crumbs={crumbs}
        kicker="Reports"
        title="Design engineering jobs reports"
        lede={
          <p>
            These are the dated design engineering jobs reports. A frozen month keeps the figures from its snapshot. The current month is still calculated from the live board.
          </p>
        }
      />
      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <p className="mt-10 text-[15.5px] leading-7 text-fg-2">
          Each frozen month records open roles, the companies hiring, the fully remote share, employer-posted salary by role and currency, and the roles posted that month. Currencies are never converted.
        </p>
        <ul className="mt-8 grid gap-4">
          {entries.map((entry) => (
            <li key={entry.href}>
              <Link href={entry.href} className="group card flex flex-col gap-4 p-6 transition-colors hover:border-line-strong sm:flex-row sm:items-center sm:justify-between">
                <span>
                  <span className="chip chip-accent">{entry.kicker}</span>
                  <span className="mt-3 block text-xl font-semibold tracking-tight text-fg">{entry.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-muted">{entry.summary}</span>
                </span>
                <ArrowRight className="arrow shrink-0 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
