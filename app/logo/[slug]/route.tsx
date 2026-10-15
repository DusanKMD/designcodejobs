import { ImageResponse } from "next/og";
import { BRAND, markDataUri } from "@/lib/brand";
import { companyName } from "@/lib/companies";
import { ogFonts } from "@/lib/og";

export const runtime = "nodejs";

/**
 * Square logos for JSON-LD. `designcodejobs` is the brand mark (Organization.logo).
 * Other slugs are an initial tile used as hiringOrganization.logo when no company logo is on file.
 */
export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  if (slug === "designcodejobs") {
    return new ImageResponse(
      // eslint-disable-next-line @next/next/no-img-element
      <img src={markDataUri("accent", 0)} width={512} height={512} alt="" />,
      { width: 512, height: 512, headers: { "cache-control": "public, max-age=86400, immutable" } },
    );
  }
  const letter = companyName(slug).replace(/[^A-Za-z0-9]/g, "").slice(0, 1).toUpperCase() || "D";
  return new ImageResponse(
    (
      <div
        style={{
          width: 256,
          height: 256,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND.ink,
          color: "#FFFFFF",
          fontSize: 136,
          fontWeight: 700,
          fontFamily: "Geist",
          letterSpacing: -4,
        }}
      >
        {letter}
      </div>
    ),
    { width: 256, height: 256, fonts: await ogFonts(), headers: { "cache-control": "public, max-age=86400" } },
  );
}
