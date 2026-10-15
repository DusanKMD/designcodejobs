import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { BRAND, markDataUri } from "@/lib/brand";
import { SITE_DOMAIN } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };

type OgFont = { name: string; data: ArrayBuffer; weight: 500 | 600 | 700; style: "normal" };

let fontCache: Promise<OgFont[]> | null = null;

/** Geist (OFL) from assets/fonts. Falls back to the next/og default font if a file is missing. */
export function ogFonts(): Promise<OgFont[]> {
  if (!fontCache) {
    const dir = join(process.cwd(), "assets/fonts");
    const load = async (file: string, name: string, weight: OgFont["weight"]): Promise<OgFont | null> => {
      try {
        const buffer = await readFile(join(dir, file));
        const data = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
        return { name, data, weight, style: "normal" };
      } catch {
        return null;
      }
    };
    fontCache = Promise.all([
      load("Geist-Medium.woff", "Geist", 500),
      load("Geist-SemiBold.woff", "Geist", 600),
      load("Geist-Bold.woff", "Geist", 700),
      load("GeistMono-Medium.woff", "Geist Mono", 500),
    ]).then((fonts) => fonts.filter((font): font is OgFont => Boolean(font)));
  }
  return fontCache as Promise<OgFont[]>;
}

const DOT_GRID = {
  backgroundColor: BRAND.ink,
  backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.09) 1px, transparent 0)",
  backgroundSize: "28px 28px",
};

/** Dark canvas with the brand row on top and a footer line. Children fill the middle. */
export function OgFrame({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div
      style={{
        ...DOT_GRID,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px 72px 52px",
        color: "#FFFFFF",
        fontFamily: "Geist",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -260,
          right: -200,
          width: 760,
          height: 760,
          borderRadius: 760,
          background: "radial-gradient(circle, rgba(62,99,221,0.38) 0%, rgba(62,99,221,0) 65%)",
          display: "flex",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markDataUri("accent")} width={52} height={52} alt="" />
          <div style={{ display: "flex", fontSize: 30, fontWeight: 600, letterSpacing: -0.6 }}>
            Design Code <span style={{ color: "rgba(255,255,255,0.55)", marginLeft: 8 }}>Jobs</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Geist Mono",
            fontSize: 22,
            color: "rgba(255,255,255,0.6)",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: 999,
            padding: "8px 18px",
          }}
        >
          {SITE_DOMAIN}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>{children}</div>
      <div style={{ display: "flex", alignItems: "center", fontSize: 24, color: "rgba(255,255,255,0.55)" }}>
        {footer ?? "Software roles for designers who code"}
      </div>
    </div>
  );
}

/** Figma-style selection frame: accent outline, square handles in the corners. */
export function OgSelection({ children, label }: { children: React.ReactNode; label?: string }) {
  const handle = (position: React.CSSProperties) => (
    <div
      style={{
        position: "absolute",
        width: 14,
        height: 14,
        background: "#FFFFFF",
        border: `2.5px solid ${BRAND.accent}`,
        display: "flex",
        ...position,
      }}
    />
  );
  return (
    <div style={{ display: "flex", position: "relative", padding: "0 14px", margin: "0 -14px", border: `2.5px solid ${BRAND.accent}` }}>
      {children}
      {handle({ top: -8, left: -8 })}
      {handle({ top: -8, right: -8 })}
      {handle({ bottom: -8, left: -8 })}
      {handle({ bottom: -8, right: -8 })}
      {label ? (
        <div
          style={{
            position: "absolute",
            bottom: -44,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            background: BRAND.accent,
            color: "#FFFFFF",
            fontFamily: "Geist Mono",
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: 0,
            lineHeight: 1.3,
            padding: "4px 10px",
            borderRadius: 6,
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
}

export function OgChip({ children, tone = "plain" }: { children: React.ReactNode; tone?: "plain" | "salary" | "accent" }) {
  const styles: Record<string, React.CSSProperties> = {
    plain: { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.86)", border: "1px solid rgba(255,255,255,0.14)" },
    salary: { background: "rgba(34,197,94,0.14)", color: "#86EFAC", border: "1px solid rgba(34,197,94,0.32)" },
    accent: { background: "rgba(62,99,221,0.22)", color: "#B7C6FF", border: "1px solid rgba(62,99,221,0.5)" },
  };
  return (
    <div style={{ display: "flex", alignItems: "center", fontSize: 24, fontWeight: 500, padding: "9px 18px", borderRadius: 999, ...styles[tone] }}>
      {children}
    </div>
  );
}
