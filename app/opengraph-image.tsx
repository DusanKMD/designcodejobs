import { ImageResponse } from "next/og";

export const alt = "Design engineer jobs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0e0e0c", color: "#f4f2ea", padding: "72px" }}>
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 3, textTransform: "uppercase", color: "#9db4ff" }}>designcodejobs.com</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, lineHeight: 1.02, letterSpacing: -2 }}>Design engineer jobs</div>
          <div style={{ fontSize: 30, marginTop: 20, color: "#c8c4b8" }}>For designers who code.</div>
        </div>
      </div>
    ),
    size,
  );
}
