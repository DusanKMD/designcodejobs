"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight } from "@/components/icons";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { href: "/", label: "Jobs", exact: true },
  { href: "/remote", label: "Remote" },
  { href: "/salary", label: "Salary" },
  { href: "/companies", label: "Companies" },
  { href: "/guides", label: "Guides" },
];

const ROLE_LINKS = [
  { href: "/roles/ux-engineer", label: "UX engineer jobs" },
  { href: "/roles/design-technologist", label: "Design technologist jobs" },
  { href: "/roles/design-systems-engineer", label: "Design systems engineer jobs" },
  { href: "/roles/creative-technologist", label: "Creative technologist jobs" },
];

function isCurrent(path: string, href: string, exact?: boolean) {
  if (exact) return path === href || path.startsWith("/jobs/") || path.startsWith("/roles/");
  return path === href || path.startsWith(`${href}/`);
}

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="site-header sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 sm:px-6">
        <Logo />
        <nav aria-label="Primary" className="hidden items-center gap-0.5 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrent(path, item.href, item.exact) ? "page" : undefined}
              className="nav-link"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="hidden sm:contents">
            <ThemeToggle />
          </span>
          <Link href="/post-a-job" className="btn btn-primary btn-sm">
            Post a job
            <span className="hidden font-normal opacity-60 lg:inline">· $129</span>
          </Link>
          <button
            type="button"
            className="burger inline-flex h-9 w-9 flex-col items-center justify-center rounded-lg text-fg hover:bg-chip md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
      <div id="mobile-menu" className="menu-panel md:hidden" data-open={open}>
        <div inert={!open}>
          <nav aria-label="Mobile" className="mx-auto max-w-6xl border-t border-line px-5 pb-5 pt-3">
            <ul className="grid gap-0.5">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                   
                    aria-current={isCurrent(path, item.href, item.exact) ? "page" : undefined}
                    className="flex h-11 items-center rounded-xl px-3 text-[15px] font-medium text-fg-2 hover:bg-chip aria-[current=page]:text-fg"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 px-3 text-xs font-medium uppercase tracking-[0.08em] text-subtle">Roles</p>
            <ul className="mt-1 grid gap-0.5">
              {ROLE_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="flex h-10 items-center rounded-xl px-3 text-sm text-muted hover:bg-chip hover:text-fg">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-2">
              <Link href="/post-a-job" className="btn btn-primary btn-lg flex-1">
                Post a job · $129
                <ArrowRight className="arrow" />
              </Link>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-line">
                <ThemeToggle />
              </span>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
