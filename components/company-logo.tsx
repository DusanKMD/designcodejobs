"use client";

import Image from "next/image";
import { useState } from "react";

const FALLBACKS = [
  ["#ffedd5", "#9a3412"],
  ["#ffe4e6", "#9f1239"],
  ["#fef3c7", "#92400e"],
  ["#fce7f3", "#9d174d"],
  ["#ecfccb", "#3f6212"],
  ["#e0f2fe", "#075985"],
] as const;

export function CompanyLogo({ name, domain, size = 48 }: { name: string; domain?: string; size?: number }) {
  const [step, setStep] = useState(0);
  const host = (domain || "").replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const sources = host
    ? [`https://logo.clearbit.com/${host}`, `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`]
    : [];

  if (step >= sources.length) return <Initial name={name} size={size} />;

  return (
    <span
      className="relative shrink-0 overflow-hidden rounded-xl border border-line bg-card"
      style={{ width: size, height: size }}
    >
      <Image
        src={sources[step]}
        alt=""
        width={size}
        height={size}
        unoptimized
        className="h-full w-full object-contain p-1.5"
        onError={() => setStep((current) => current + 1)}
      />
    </span>
  );
}

function Initial({ name, size }: { name: string; size: number }) {
  const letter = name.replace(/[^A-Za-z0-9]/g, "").slice(0, 1).toUpperCase() || "•";
  const index = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % FALLBACKS.length;
  const [background, color] = FALLBACKS[index];
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-xl text-lg font-bold"
      style={{ width: size, height: size, background, color }}
      aria-hidden
    >
      {letter}
    </span>
  );
}
