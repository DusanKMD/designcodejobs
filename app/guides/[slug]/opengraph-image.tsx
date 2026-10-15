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
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f6f5f2", color: "#1c1917", padding: "72px" }}>
        <div style={{ display: "flex", fontSize: 24, fontWeight: 700, color: "#c2410c" }}>Design Code Jobs</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 68, lineHeight: 1.05, letterSpacing: -1.5, maxWidth: 980, fontWeight: 700 }}>{title}</div>
          <div style={{ fontSize: 28, marginTop: 24, color: "#57534e", maxWidth: 900 }}>{description}</div>
        </div>
      </div>
    ),
    size,
  );
}
