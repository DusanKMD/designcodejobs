"use client";

import { useState } from "react";
import { Check, LinkIcon } from "@/components/icons";

export function CopyLink({ url, className = "" }: { url: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const area = document.createElement("textarea");
      area.value = url;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button type="button" onClick={copy} className={`btn btn-secondary ${className}`} aria-live="polite">
      <span className="relative inline-flex h-4 w-4 items-center justify-center">
        <LinkIcon className={`copy-state absolute ${copied ? "scale-50 opacity-0" : "opacity-100"}`} />
        <Check className={`copy-state absolute text-salary-fg ${copied ? "opacity-100" : "scale-50 opacity-0"}`} />
      </span>
      {copied ? "Link copied" : "Copy link"}
    </button>
  );
}
