import { ImageResponse } from "next/og";
import { OG_SIZE, OgChip, OgFrame, OgSelection, ogFonts } from "@/lib/og";
import { filterJobs } from "@/lib/query";
import { getAllJobs } from "@/lib/store";

export const alt = "Design Code Jobs: design engineer jobs for designers who code";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image() {
  const jobs = filterJobs(await getAllJobs(), {});
  const companies = new Set(jobs.map((job) => job.companySlug)).size;
  const remote = jobs.filter((job) => job.workplace === "remote").length;

  return new ImageResponse(
    (
      <OgFrame footer={<span>UX engineers · Design technologists · Design systems · Creative technologists</span>}>
        <div style={{ display: "flex", alignItems: "center", fontSize: 92, fontWeight: 700, letterSpacing: -4, lineHeight: 1, whiteSpace: "nowrap" }}>
          <OgSelection label="Hug × Hug">
            <span>Design</span>
          </OgSelection>
          <span style={{ marginLeft: 26 }}>engineer jobs</span>
          <div style={{ display: "flex", width: 7, height: 78, background: "#3E63DD", marginLeft: 10, borderRadius: 2 }} />
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "rgba(255,255,255,0.7)", marginTop: 62, maxWidth: 900, lineHeight: 1.35 }}>
          The job board for designers who code. Hosted descriptions, real salary ranges, no hardware noise.
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 30 }}>
          <OgChip tone="accent">{jobs.length} open roles</OgChip>
          <OgChip>{companies} companies hiring</OgChip>
          <OgChip>{remote} fully remote</OgChip>
        </div>
      </OgFrame>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
