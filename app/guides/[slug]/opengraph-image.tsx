import { ImageResponse } from "next/og";
import { guideBySlug } from "@/lib/catalog";

export const alt = "Design Code Jobs guide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  const title = guide?.h1 || "Guides";
  const description = guide?.description || "Design Code Jobs";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0e0e0c", color: "#f4f2ea", padding: "72px" }}>
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 3, textTransform: "uppercase", color: "#9db4ff" }}>Design Code Jobs</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 68, lineHeight: 1.05, letterSpacing: -1.5, maxWidth: 980 }}>{title}</div>
          <div style={{ fontSize: 28, marginTop: 24, color: "#c8c4b8", maxWidth: 900 }}>{description}</div>
        </div>
      </div>
    ),
    size,
  );
}
