import { ImageResponse } from "next/og";
import { guideBySlug } from "@/lib/catalog";
import { OG_SIZE, OgChip, OgFrame, ogFonts } from "@/lib/og";

export const alt = "Design Code Jobs guide";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  const title = guide?.h1 || "Guides";
  const raw = guide?.description || "Guides for designers who code.";
  const description = raw.length > 118 ? `${raw.slice(0, 117).replace(/\s+\S*$/, "")}…` : raw;

  return new ImageResponse(
    (
      <OgFrame footer={<span>Guides for designers who code · designcodejobs.com/guides</span>}>
        <div style={{ display: "flex" }}>
          <OgChip tone="accent">Guide</OgChip>
        </div>
        <div style={{ display: "flex", fontSize: title.length > 40 ? 68 : 80, fontWeight: 700, letterSpacing: -3, lineHeight: 1.04, marginTop: 24, maxWidth: 1040 }}>
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "rgba(255,255,255,0.68)", marginTop: 22, maxWidth: 960, lineHeight: 1.35 }}>
          {description}
        </div>
      </OgFrame>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
