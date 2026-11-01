import { currentMonth, monthLabel } from "@/lib/reports/month";
import { getSnapshot, listSnapshots } from "@/lib/reports/registry";
import type { ReportSnapshot } from "@/lib/reports/types";

/** A past month with a snapshot is frozen. The current month stays live even if a file exists. */
export function frozenSnapshot(month: string, now = new Date()): ReportSnapshot | null {
  if (month === currentMonth(now)) return null;
  return getSnapshot(month);
}

/** Indexable report URLs: the index, every frozen month, and the live current month. */
export function indexableReportPaths(now = new Date()) {
  const paths = ["/reports"];
  for (const snapshot of listSnapshots()) paths.push(`/reports/${snapshot.month}`);
  const current = `/reports/${currentMonth(now)}`;
  if (!paths.includes(current)) paths.push(current);
  return paths;
}

export function reportNavLinks(now = new Date()) {
  const current = currentMonth(now);
  const links = [
    { href: "/reports", label: "Jobs reports" },
    { href: `/reports/${current}`, label: "Monthly jobs report" },
  ];
  for (const snapshot of [...listSnapshots()].reverse()) {
    if (snapshot.month === current) continue;
    links.push({
      href: `/reports/${snapshot.month}`,
      label: `${monthLabel(snapshot.month)} jobs report`,
    });
  }
  return links;
}
