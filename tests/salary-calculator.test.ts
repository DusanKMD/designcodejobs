import { describe, expect, it } from "vitest";
import { calcLevel, calcRole, calculate, percentile, type SalaryRow } from "@/lib/salary-calculator";

function row(over: Partial<SalaryRow>): SalaryRow {
  return { id: Math.random().toString(), title: "Design Engineer", company: "Acme", slug: "x", role: "design-engineer", level: "mid", remote: true, regions: ["us"], currency: "USD", min: 100000, max: 140000, ...over };
}

describe("salary calculator", () => {
  it("maps titles to roles and levels", () => {
    expect(calcRole("ui-engineer")).toBe("ux-engineer");
    expect(calcRole("creative-developer")).toBe("creative-technologist");
    expect(calcRole(null)).toBe("design-engineer");
    expect(calcLevel(null)).toBe("mid");
    expect(calcLevel("principal" as never)).toBe("mid");
    expect(calcLevel("lead")).toBe("staff");
    expect(calcLevel("internship")).toBe("junior");
  });

  it("computes percentiles from posted midpoints only", () => {
    expect(percentile([1, 2, 3, 4, 5], 0.25)).toBe(2);
    const rows = [row({ min: 100000, max: 120000 }), row({ min: 140000, max: 160000 }), row({ min: 180000, max: 200000 }), row({ currency: "GBP", min: 1, max: 2 })];
    const result = calculate(rows, { role: "design-engineer", level: "mid", location: "us", currency: "USD" });
    expect(result.rows).toHaveLength(3);
    expect(result.median).toBe(150000);
    expect(result.p25).toBe(130000);
    expect(result.p75).toBe(170000);
    expect(result.widened).toEqual([]);
  });

  it("widens filters when fewer than three ranges match and says which", () => {
    const rows = [row({ level: "senior" }), row({ level: "mid" }), row({ level: "junior" })];
    const result = calculate(rows, { role: "design-engineer", level: "senior", location: "all", currency: "USD" });
    expect(result.widened).toEqual(["level"]);
    expect(result.rows).toHaveLength(3);
  });

  it("returns nulls rather than inventing a figure", () => {
    const result = calculate([], { role: "all", level: "all", location: "all", currency: "EUR" });
    expect(result.median).toBeNull();
    expect(result.rows).toHaveLength(0);
  });
});
