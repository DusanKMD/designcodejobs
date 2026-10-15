import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1916" }}>
        <div style={{ display: "flex", width: 84, height: 84, flexWrap: "wrap" }}>
          <div style={{ width: 36, height: 36, background: "#f4f2ea", marginRight: 12, marginBottom: 12 }} />
          <div style={{ width: 36, height: 36, background: "#9db4ff", marginBottom: 12 }} />
          <div style={{ width: 36, height: 36, background: "#f4f2ea", opacity: 0.35, marginRight: 12 }} />
          <div style={{ width: 36, height: 36, background: "#f4f2ea" }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
