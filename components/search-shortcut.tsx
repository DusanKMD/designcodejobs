"use client";

import { useEffect } from "react";

/** Press "/" anywhere to jump to the search field, like most developer tools. */
export function SearchShortcut({ target }: { target: string }) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const active = document.activeElement as HTMLElement | null;
      if (active && (active.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName))) return;
      const input = document.getElementById(target) as HTMLInputElement | null;
      if (!input) return;
      event.preventDefault();
      input.focus();
      input.select();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [target]);
  return null;
}
