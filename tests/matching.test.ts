import { describe, expect, it } from "vitest";
import { detectSeniority, matchRole } from "@/lib/matching";

const software = "Build product UI in React and TypeScript. Partner with design in Figma and extend the design system.";

describe("matchRole", () => {
  it("publishes a UX engineer title", () => {
    const result = matchRole("Principal UX Engineer, Ads");
    expect(result.queue).toBe("publish");
    expect(result.titleFamily).toBe("ux-engineer");
    expect(result.confidence).toBeGreaterThanOrEqual(0.75);
  });

  it("publishes creative technologist, UI engineer, and design systems titles", () => {
    expect(matchRole("Creative Technologist").titleFamily).toBe("creative-technologist");
    expect(matchRole("UI Engineer").titleFamily).toBe("ui-engineer");
    expect(matchRole("Senior Frontend Platform Engineer, Design Systems").titleFamily).toBe("design-systems-engineer");
    expect(matchRole("Senior Software Engineer - Design Systems - Frontend").titleFamily).toBe("design-systems-engineer");
    expect(matchRole("Senior Software Engineer - Design Systems - Frontend").queue).toBe("publish");
    expect(matchRole("Design Technologist").queue).toBe("publish");
  });

  it("sends a bare design engineer title to review", () => {
    const result = matchRole("Design Engineer");
    expect(result.queue).toBe("review");
    expect(result.titleFamily).toBe("design-engineer");
  });

  it("publishes design engineer when the description is software", () => {
    const result = matchRole("Design Engineer", software);
    expect(result.queue).toBe("publish");
    expect(result.confidence).toBeGreaterThanOrEqual(0.75);
  });

  it("rejects mechanical, chip, and AV titles", () => {
    expect(matchRole("Mechanical Design Engineer").queue).toBe("reject");
    expect(matchRole("Physical Design Engineer").exclusions).toContain("physical design");
    expect(matchRole("ASIC Design Engineer").queue).toBe("reject");
    expect(matchRole("AV Design Engineer").queue).toBe("reject");
    expect(matchRole("Interior Design Technologist").queue).toBe("reject");
  });

  it("rejects a design engineer description that is hardware", () => {
    const result = matchRole("Design Engineer", "Own the mechanical design in SolidWorks and release drawings to manufacturing.");
    expect(result.queue).toBe("reject");
  });

  it("does not treat audio-product work as AV", () => {
    const result = matchRole("Product Design Engineer - Audio", software);
    expect(result.queue).toBe("publish");
    expect(result.exclusions).not.toContain("av");
  });

  it("ignores unrelated software engineering titles", () => {
    expect(matchRole("Staff Software Engineer, Backend").queue).toBe("reject");
  });

  it("maps internships separately from junior", () => {
    expect(detectSeniority("Design Engineer Internship")).toBe("internship");
    expect(detectSeniority("Junior Design Engineer")).toBe("junior");
    expect(detectSeniority("Manager, Design Engineering")).toBe("manager");
  });
});
