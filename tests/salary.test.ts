import { describe, expect, it } from "vitest";
import { medianSalary, salaryBands } from "@/lib/query";
import type { Job } from "@/lib/types";

function pay(currency: string, min: number, max: number): Job {
  return {
    salaryCurrency: currency,
    salaryMin: min,
    salaryMax: max,
    salaryUnit: "YEAR",
  } as Job;
}

describe("salary bands", () => {
  it("keeps currencies separate and reports the USD median", () => {
    const jobs = [pay("GBP", 100000, 130000), pay("USD", 200000, 300000), pay("USD", 140000, 180000)];
    const bands = salaryBands(jobs);
    expect(bands.map((band) => band.currency)).toEqual(["USD", "GBP"]);
    expect(bands[0].min).toBe(140000);
    expect(bands[0].max).toBe(300000);
    expect(bands[1].min).toBe(100000);
    const median = medianSalary(jobs);
    expect(median?.currency).toBe("USD");
    expect(median?.count).toBe(2);
    expect(median?.value).toBe(205000);
  });
});
