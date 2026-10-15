"use client";

export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
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
      aria-label="Toggle color scheme"
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-chip hover:text-fg"
    >
      <span className="dark:hidden" aria-hidden>
        <Moon />
      </span>
      <span className="hidden dark:inline" aria-hidden>
        <Sun />
      </span>
    </button>
  );
}

function Moon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8 5.6 5.6 0 1 0 13.2 9.6Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function Sun() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 1.6v1.4M8 13v1.4M1.6 8h1.4M13 8h1.4M3.2 3.2l1 1M11.8 11.8l1 1M12.8 3.2l-1 1M4.2 11.8l-1 1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
