import type { Seniority, SkillSlug, TitleFamily } from "@/lib/types";

export type MatchQueue = "publish" | "review" | "reject";

export type MatchResult = {
  queue: MatchQueue;
  confidence: number;
  titleFamily: TitleFamily | null;
  reasons: string[];
  exclusions: string[];
};

const STRONG: { family: TitleFamily; re: RegExp }[] = [
  { family: "creative-technologist", re: /\bcreative technologists?\b/i },
  { family: "creative-developer", re: /\bcreative developers?\b/i },
  { family: "design-technologist", re: /\bdesign technologists?\b/i },
  {
    family: "design-systems-engineer",
    re: /\bdesign[\s-]?systems?\s+(engineer|engineering|developer|designer)s?\b/i,
  },
  {
    family: "design-systems-engineer",
    re: /\b(front[\s-]?end|frontend|ui|ux|web|product)\s+(platform\s+)?(engineer|developer)s?\b[^.\n]{0,48}\bdesign[\s-]?systems?\b/i,
  },
  {
    family: "design-systems-engineer",
    re: /\bdesign[\s-]?systems?\b[^.\n]{0,48}\b(engineer|developer)s?\b/i,
  },
  {
    family: "design-systems-engineer",
    re: /\b(engineer|developer)s?\b[^.\n]{0,40}\bdesign[\s-]?systems?\b/i,
  },
  { family: "ux-engineer", re: /\b(ux|user experience)\s+engineers?\b/i },
  { family: "ux-engineer", re: /\b(ux|user experience)\s+developers?\b/i },
  { family: "ui-engineer", re: /\b(ui|user interface)\s+engineers?\b/i },
  { family: "ui-engineer", re: /\b(ui|user interface)\s+developers?\b/i },
  { family: "ui-engineer", re: /\bui\s*\/\s*ux\s+(engineer|developer)s?\b/i },
  { family: "prototyper", re: /\b(ux |ai |product )?prototypers?\b/i },
  { family: "prototyper", re: /\bprototyping (engineer|developer)s?\b/i },
];

const DESIGN_ENGINEER = /\bdesign\s+engineers?\b|\bdesign\s+engineering\b/i;

/** Title hits reject the role outright. Hardware, mechanical, chip, AV, and other non-software senses of "design engineer". */
const TITLE_EXCLUSIONS: { re: RegExp; label: string }[] = [
  { re: /\bmechanical\b/i, label: "mechanical" },
  { re: /\bhardware\b/i, label: "hardware" },
  { re: /\belectrical\b/i, label: "electrical" },
  { re: /\bcivil\b/i, label: "civil" },
  { re: /\bstructural\b/i, label: "structural" },
  { re: /\baerospace\b/i, label: "aerospace" },
  { re: /\baircraft\b/i, label: "aircraft" },
  { re: /\bhvac\b/i, label: "hvac" },
  { re: /\bpiping\b/i, label: "piping" },
  { re: /\bsolidworks\b/i, label: "solidworks" },
  { re: /\bautocad\b/i, label: "autocad" },
  { re: /\bcatia\b/i, label: "catia" },
  { re: /\bcreo\b/i, label: "creo" },
  { re: /\bmanufacturing\b/i, label: "manufacturing" },
  { re: /\bpcb\b/i, label: "pcb" },
  { re: /\basic\b/i, label: "asic" },
  { re: /\bfpga\b/i, label: "fpga" },
  { re: /\brtl\b/i, label: "rtl" },
  { re: /\bvlsi\b/i, label: "vlsi" },
  { re: /\bverilog\b/i, label: "verilog" },
  { re: /\bvhdl\b/i, label: "vhdl" },
  { re: /\bsemiconductor\b/i, label: "semiconductor" },
  { re: /\bsilicon\b/i, label: "silicon" },
  { re: /\bchip\b/i, label: "chip" },
  { re: /\bphysical design\b/i, label: "physical design" },
  { re: /\btapeout\b/i, label: "tapeout" },
  { re: /\bplace and route\b/i, label: "place and route" },
  { re: /\baudiovisual\b/i, label: "audiovisual" },
  { re: /\baudio[\s-]?visual\b/i, label: "audio-visual" },
  { re: /\bav\s+(design|engineer|engineering)\b/i, label: "av" },
  { re: /\bbroadcast\b/i, label: "broadcast" },
  { re: /\bconstruction\b/i, label: "construction" },
  { re: /\bhydraulic\b/i, label: "hydraulic" },
  { re: /\bpneumatic\b/i, label: "pneumatic" },
  { re: /\bbim\b/i, label: "bim" },
  { re: /\bmep\b/i, label: "mep" },
  { re: /\bcad\b/i, label: "cad" },
  { re: /\bindustrial\b/i, label: "industrial" },
  { re: /\binterior\b/i, label: "interior" },
  { re: /\barchitect(?:ural|ure)?\b/i, label: "architecture" },
  { re: /\boptical\b/i, label: "optical" },
  { re: /\bsubstation\b/i, label: "substation" },
  { re: /\bfirearms?\b/i, label: "firearms" },
  { re: /\bplastics?\b/i, label: "plastics" },
  { re: /\bmedical device\b/i, label: "medical device" },
  { re: /\bmmic\b/i, label: "mmic" },
  { re: /\bformwork\b/i, label: "formwork" },
  { re: /\btransformer\b/i, label: "transformer" },
  { re: /\bharness\b/i, label: "harness" },
  { re: /\bcarpentry\b|\bjoiner\b|\btimber\b/i, label: "carpentry" },
];

/** Description hits are stricter so a software JD that mentions a hardware team is not thrown out. */
const DESCRIPTION_EXCLUSIONS: { re: RegExp; label: string }[] = [
  { re: /\bsolidworks\b/i, label: "solidworks" },
  { re: /\bautocad\b/i, label: "autocad" },
  { re: /\bcatia\b/i, label: "catia" },
  { re: /\bcreo\b/i, label: "creo" },
  { re: /\bhvac\b/i, label: "hvac" },
  { re: /\bverilog\b/i, label: "verilog" },
  { re: /\bvhdl\b/i, label: "vhdl" },
  { re: /\basic\b/i, label: "asic" },
  { re: /\bfpga\b/i, label: "fpga" },
  { re: /\bvlsi\b/i, label: "vlsi" },
  { re: /\bsemiconductor\b/i, label: "semiconductor" },
  { re: /\btapeout\b/i, label: "tapeout" },
  { re: /\bplace and route\b/i, label: "place and route" },
  { re: /\bphysical design\b/i, label: "physical design" },
  { re: /\bmechanical (design|engineer)/i, label: "mechanical" },
  { re: /\bpcb layout\b/i, label: "pcb" },
  { re: /\baudiovisual\b|\baudio[\s-]?visual\b/i, label: "audiovisual" },
  { re: /\bcivil engineer/i, label: "civil" },
  { re: /\bstructural engineer/i, label: "structural" },
];

const SOFTWARE_SIGNALS: RegExp[] = [
  /\breact\b/i,
  /\btypescript\b/i,
  /\bjavascript\b/i,
  /\bnext\.?js\b/i,
  /\bcss\b/i,
  /\bhtml\b/i,
  /\bfigma\b/i,
  /\bfront[\s-]?end\b/i,
  /\bdesign[\s-]?systems?\b/i,
  /\bprototyp/i,
  /\bframer\b/i,
  /\bswift\s?ui\b/i,
  /\bwebgl\b/i,
  /\bthree\.?js\b/i,
  /\bgsap\b/i,
  /\bstorybook\b/i,
  /\btailwind\b/i,
  /\baccessibility\b|\bwcag\b/i,
  /\bcomponent library\b/i,
  /\binteraction design\b/i,
  /\bvisual design\b/i,
  /\bmotion design\b/i,
  /\bproduct design\b/i,
  /\bweb design\b/i,
  /\bdesign tokens?\b/i,
  /\bvue\b/i,
  /\bsvelte\b/i,
  /\bremix\b/i,
  /\baria\b/i,
];

const SKILL_RULES: { slug: SkillSlug; re: RegExp }[] = [
  { slug: "react", re: /\breact\b/i },
  { slug: "figma", re: /\bfigma\b/i },
  { slug: "framer", re: /\bframer\b/i },
  { slug: "threejs", re: /\bthree\.?js\b/i },
  { slug: "webgl", re: /\bwebgl\b/i },
  { slug: "swiftui", re: /\bswift\s?ui\b/i },
  { slug: "motion", re: /\bgsap\b|\bframer motion\b|\bmotion design\b|\blottie\b|\brive\b/i },
  { slug: "design-systems", re: /\bdesign[\s-]?systems?\b/i },
];

const PUBLISH_AT = 0.75;
const REVIEW_AT = 0.45;

function hits(text: string, rules: { re: RegExp; label: string }[]) {
  if (!text) return [];
  const found: string[] = [];
  for (const rule of rules) {
    if (rule.re.test(text) && !found.includes(rule.label)) found.push(rule.label);
  }
  return found;
}

function signalCount(text: string) {
  if (!text) return 0;
  return SOFTWARE_SIGNALS.reduce((n, re) => n + (re.test(text) ? 1 : 0), 0);
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

function detectFamily(title: string): { family: TitleFamily; strong: boolean } | null {
  for (const rule of STRONG) {
    if (rule.re.test(title)) return { family: rule.family, strong: true };
  }
  if (DESIGN_ENGINEER.test(title)) return { family: "design-engineer", strong: false };
  return null;
}

export function matchRole(title: string, description = ""): MatchResult {
  const clean = title.replace(/\s+/g, " ").trim();
  const titleEx = hits(clean, TITLE_EXCLUSIONS);
  if (titleEx.length) {
    return {
      queue: "reject",
      confidence: 0.05,
      titleFamily: null,
      reasons: ["title exclusion"],
      exclusions: titleEx,
    };
  }

  const family = detectFamily(clean);
  if (!family) {
    return {
      queue: "reject",
      confidence: 0.1,
      titleFamily: null,
      reasons: ["no role match"],
      exclusions: [],
    };
  }

  const softwareInTitle = signalCount(clean);
  const softwareInBody = signalCount(description);
  const descEx = hits(description, DESCRIPTION_EXCLUSIONS);
  const reasons = [`title:${family.family}`];
  let confidence = family.strong ? 0.86 : 0.62;

  if (family.strong) {
    if (softwareInTitle + softwareInBody > 0) {
      confidence += 0.06;
      reasons.push("software context");
    }
    if (descEx.length >= 2 && softwareInTitle + softwareInBody === 0) {
      return {
        queue: "reject",
        confidence: 0.2,
        titleFamily: family.family,
        reasons: [...reasons, "description looks hardware"],
        exclusions: descEx,
      };
    }
  } else {
    if (softwareInTitle > 0) {
      confidence += 0.16;
      reasons.push("software terms in title");
    }
    if (softwareInBody >= 2) {
      confidence += 0.16;
      reasons.push("software terms in description");
    } else if (softwareInBody === 1) {
      confidence += 0.14;
      reasons.push("software term in description");
    }
    if (descEx.length > 0 && softwareInBody === 0 && softwareInTitle === 0) {
      return {
        queue: "reject",
        confidence: 0.12,
        titleFamily: family.family,
        reasons: [...reasons, "hardware description"],
        exclusions: descEx,
      };
    }
    if (descEx.length > 0 && softwareInBody < 2 && softwareInTitle === 0) {
      confidence = Math.min(confidence, 0.55);
      reasons.push("mixed hardware terms");
    }
  }

  confidence = round(Math.max(0, Math.min(0.99, confidence)));
  const queue: MatchQueue =
    confidence >= PUBLISH_AT ? "publish" : confidence >= REVIEW_AT ? "review" : "reject";
  return { queue, confidence, titleFamily: family.family, reasons, exclusions: descEx };
}

/** Skip the description fetch when the title cannot be one of our roles. */
export function shouldFetchDescription(title: string) {
  const result = matchRole(title, "");
  return result.reasons[0] !== "title exclusion" && result.reasons[0] !== "no role match";
}

export function detectSeniority(title: string): Seniority | null {
  const t = title.toLowerCase();
  if (/\bintern(ship)?\b/.test(t)) return "internship";
  if (/\bmanager\b|\bhead of\b/.test(t)) return "manager";
  if (/\bfounding\b/.test(t)) return "founding";
  if (/\bstaff\b|\bprincipal\b/.test(t)) return "staff";
  if (/\blead\b/.test(t)) return "lead";
  if (/\bsenior\b|\bsr\.?\b/.test(t)) return "senior";
  if (/\bjunior\b|\bjr\.?\b|\bentry[\s-]?level\b/.test(t)) return "junior";
  return null;
}

export function detectSkills(title: string, description = ""): SkillSlug[] {
  const text = `${title}\n${description}`;
  return SKILL_RULES.filter((rule) => rule.re.test(text)).map((rule) => rule.slug);
}

export function cleanTitle(title: string) {
  return title
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}
