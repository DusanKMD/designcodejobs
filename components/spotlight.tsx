"use client";

import { useRef } from "react";

/** A soft accent light that follows the pointer. Pure decoration; static where hover is unavailable. */
export function Spotlight({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  function move(event: React.PointerEvent<HTMLDivElement>) {
    const node = ref.current;
    if (!node || event.pointerType !== "mouse") return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--x", `${event.clientX - rect.left}px`);
    node.style.setProperty("--y", `${event.clientY - rect.top}px`);
  }
  return (
    <div ref={ref} onPointerMove={move} className={`spotlight ${className}`}>
      {children}
    </div>
  );
}
