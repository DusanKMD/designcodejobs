import { ImageResponse } from "next/og";

export const runtime = "nodejs";
import { companyName } from "@/lib/companies";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const letter = (slug === "designcodejobs" ? "D" : companyName(slug).replace(/[^A-Za-z0-9]/g, "").slice(0, 1).toUpperCase()) || "D";
  return new ImageResponse(
    (
      <div style={{ width: 128, height: 128, display: "flex", alignItems: "center", justifyContent: "center", background: "#111111", color: "#ffffff", fontSize: 72, fontFamily: "sans-serif" }}>
        {letter}
      </div>
    ),
    { width: 128, height: 128 },
  );
}
