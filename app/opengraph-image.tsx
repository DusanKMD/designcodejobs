import { ImageResponse } from "next/og";

export const alt = "Design engineer jobs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f6f5f2", color: "#1c1917", padding: "72px" }}>
        <div style={{ display: "flex", fontSize: 24, fontWeight: 700, color: "#c2410c" }}>designcodejobs.com</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, lineHeight: 1.02, letterSpacing: -2, fontWeight: 700 }}>Design engineer jobs</div>
          <div style={{ fontSize: 30, marginTop: 20, color: "#57534e" }}>For designers who code.</div>
        </div>
      </div>
    ),
    size,
  );
}
