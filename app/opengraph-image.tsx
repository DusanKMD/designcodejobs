import { ImageResponse } from "next/og";

export const alt = "Design engineer jobs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0a0a0a", color: "#f5f5f5", padding: "72px", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 22, letterSpacing: 2, textTransform: "uppercase", color: "#a3a3a3" }}>designcodejobs.com</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, lineHeight: 1.02, letterSpacing: -2 }}>Design engineer jobs</div>
          <div style={{ fontSize: 30, marginTop: 20, color: "#a3a3a3" }}>For designers who code.</div>
        </div>
      </div>
    ),
    size,
  );
}
