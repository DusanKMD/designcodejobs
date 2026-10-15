import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center", background: "#c2410c", color: "#ffffff", fontSize: 108, fontWeight: 700, borderRadius: 40 }}>
        D
      </div>
    ),
    { ...size },
  );
}
