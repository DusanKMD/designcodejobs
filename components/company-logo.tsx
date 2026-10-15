"use client";

import Image from "next/image";
import { useState } from "react";

const TINTS = [
  ["#EDF2FE", "#3A5BC7"],
  ["#E8F7EE", "#0A7A3E"],
  ["#FFF1E6", "#B4530F"],
  ["#F4EEFF", "#6E3FC8"],
  ["#FDEBF3", "#B4235F"],
  ["#E7F6F8", "#0E7383"],
] as const;

/** Favicon from the company domain, then a tinted initial. Fixed size, so no layout shift. */
export function CompanyLogo({
  name,
  domain,
  size = 44,
  className = "",
}: {
  name: string;
  domain?: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const host = (domain || "").replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const radius = Math.round(size * 0.26);

  if (!host || failed) return <Initial name={name} size={size} radius={radius} className={className} />;

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-line bg-card shadow-[0_1px_2px_rgb(0_0_0/0.05)] ${className}`}
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <Image
        src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`}
        alt=""
        width={size}
        height={size}
        unoptimized
        loading="lazy"
        className="h-full w-full object-contain"
        style={{ padding: Math.round(size * 0.18) }}
        onError={() => setFailed(true)}
      />
    </span>
  );
}

function Initial({ name, size, radius, className }: { name: string; size: number; radius: number; className: string }) {
  const letter = name.replace(/[^A-Za-z0-9]/g, "").slice(0, 1).toUpperCase() || "•";
  const index = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % TINTS.length;
  const [background, color] = TINTS[index];
  return (
    <span
      className={`flex shrink-0 items-center justify-center font-semibold tracking-tight ${className}`}
      style={{ width: size, height: size, borderRadius: radius, background, color, fontSize: Math.round(size * 0.42) }}
      aria-hidden
    >
      {letter}
    </span>
  );
}
