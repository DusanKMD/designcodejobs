"use client";

export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    const apply = () => root.classList.toggle("dark", next);
    const doc = document as Document & { startViewTransition?: (callback: () => void) => unknown };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (doc.startViewTransition && !reduce) doc.startViewTransition(apply);
    else apply();
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="group relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg text-muted transition-colors hover:bg-chip hover:text-fg"
    >
      <span className="absolute transition-all duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] dark:-translate-y-6 dark:rotate-90 dark:opacity-0" aria-hidden>
        <Moon />
      </span>
      <span className="absolute translate-y-6 -rotate-90 opacity-0 transition-all duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] dark:translate-y-0 dark:rotate-0 dark:opacity-100" aria-hidden>
        <Sun />
      </span>
    </button>
  );
}

function Moon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8 5.6 5.6 0 1 0 13.2 9.6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function Sun() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 1.6v1.4M8 13v1.4M1.6 8h1.4M13 8h1.4M3.5 3.5l1 1M11.5 11.5l1 1M12.5 3.5l-1 1M4.5 11.5l-1 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
