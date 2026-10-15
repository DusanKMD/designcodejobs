"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Adds .is-in to each .reveal element as it scrolls into view. See globals.css. */
export function RevealObserver() {
  const path = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("js-reveal")) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Also reveal anything already scrolled past (e.g. the visitor scrolled before hydration).
          if (!entry.isIntersecting && entry.boundingClientRect.bottom > 0) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    document.querySelectorAll(".reveal:not(.is-in)").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [path]);
  return null;
}
