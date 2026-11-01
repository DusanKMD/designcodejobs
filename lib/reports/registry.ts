import october2026 from "@/data/reports/2026-10.json";
import { parseSnapshot } from "@/lib/reports/schema";
import type { ReportSnapshot } from "@/lib/reports/types";

/**
 * Frozen months, imported at build time.
 * A later snapshot is a new data/reports/YYYY-MM.json plus one entry in this list.
 * Do not recompute, convert, or edit the figures in those files.
 */
const FILES: unknown[] = [october2026];

let cached: ReportSnapshot[] | null = null;

export function listSnapshots(): ReportSnapshot[] {
  if (!cached) {
    cached = FILES.map((file) => parseSnapshot(file)).sort((a, b) => a.month.localeCompare(b.month));
  }
  return cached;
}

export function getSnapshot(month: string) {
  return listSnapshots().find((snapshot) => snapshot.month === month) ?? null;
}
