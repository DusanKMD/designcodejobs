import { ImageResponse } from "next/og";
import { formatSalaryShort, workplaceLabel } from "@/lib/format";
import { OG_SIZE, OgChip, OgFrame, ogFonts } from "@/lib/og";
import { getJobBySlug } from "@/lib/store";

export const alt = "Job posting on Design Code Jobs";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  const title = job?.title || "Design engineer jobs";
  const company = job?.companyName || "Design Code Jobs";
  const salary = job ? formatSalaryShort(job) : null;
  const city = job?.locations.find((location) => location.locality)?.locality;
  const letter = company.replace(/[^A-Za-z0-9]/g, "").slice(0, 1).toUpperCase() || "D";
  const titleSize = title.length > 48 ? 64 : title.length > 30 ? 76 : 88;

  return new ImageResponse(
    (
      <OgFrame footer={<span>Full description and apply link on designcodejobs.com</span>}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              width: 64,
              height: 64,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              background: "#FFFFFF",
              color: "#0B0B0F",
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            {letter}
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 500, color: "rgba(255,255,255,0.78)" }}>{company} is hiring</div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            fontWeight: 700,
            letterSpacing: -3,
            lineHeight: 1.04,
            marginTop: 28,
            maxWidth: 1040,
          }}
        >
          {title}
        </div>
        {job ? (
          <div style={{ display: "flex", gap: 14, marginTop: 36, flexWrap: "wrap" }}>
            <OgChip tone="accent">{workplaceLabel(job.workplace)}</OgChip>
            {city ? <OgChip>{city}</OgChip> : null}
            {salary ? <OgChip tone="salary">{salary}</OgChip> : null}
          </div>
        ) : null}
      </OgFrame>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
