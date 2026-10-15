import { ImageResponse } from "next/og";
import { markDataUri } from "@/lib/brand";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    // iOS applies its own corner mask, so the tile is drawn square.
    <img src={markDataUri("accent", 0)} width={180} height={180} alt="" />,
    { ...size },
  );
}
