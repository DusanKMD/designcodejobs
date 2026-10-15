import { ImageResponse } from "next/og";
import { formatSalary, workplaceLabel } from "@/lib/format";
import { getJobBySlug } from "@/lib/store";

export const alt = "Job posting";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  const title = job?.title || "Design engineer jobs";
  const company = job?.companyName || "Design Code Jobs";
  const meta = job ? [workplaceLabel(job.workplace), formatSalary(job)].filter(Boolean).join("  ·  ") : "Software roles for designers who code";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f6f5f2", color: "#1c1917", padding: "72px" }}>
        <div style={{ display: "flex", fontSize: 24, fontWeight: 700, color: "#c2410c" }}>Design Code Jobs</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 28, color: "#57534e" }}>{company}</div>
          <div style={{ fontSize: 68, lineHeight: 1.05, letterSpacing: -1.5, marginTop: 12, maxWidth: 980, fontWeight: 700 }}>{title}</div>
          <div style={{ fontSize: 28, marginTop: 24, color: "#c2410c" }}>{meta}</div>
        </div>
      </div>
    ),
    size,
  );
}
