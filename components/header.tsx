"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { href: "/roles/ux-engineer", label: "UX engineer" },
  { href: "/salary", label: "Salary" },
  { href: "/remote", label: "Remote" },
  { href: "/guides", label: "Guides" },
  { href: "/about", label: "About" },
];

export function Header() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5 text-[15px] font-medium tracking-tight">
          <Mark />
          designcodejobs
        </Link>
        <PrimaryNav path={path} />
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/post-a-job"
            className="inline-flex h-9 items-center rounded-md bg-fg px-3.5 text-sm font-medium text-bg hover:opacity-90"
          >
            Post a job
          </Link>
        </div>
      </div>
    </header>
  );
}

function PrimaryNav({ path }: { path: string }) {
  return (
    <nav aria-label="Primary" className="order-last flex basis-full gap-4 overflow-x-auto border-t border-line pt-2 text-sm sm:order-none sm:basis-auto sm:border-0 sm:pt-0">
      {NAV.map((item) => {
        const current = path === item.href || path.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={`shrink-0 hover:text-fg ${current ? "text-fg" : "text-muted"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Mark() {
  return (
    <span className="grid grid-cols-2 gap-[3px]" aria-hidden>
      <span className="h-1.5 w-1.5 bg-fg" />
      <span className="h-1.5 w-1.5 bg-accent" />
      <span className="h-1.5 w-1.5 bg-fg/30" />
      <span className="h-1.5 w-1.5 bg-fg" />
    </span>
  );
}
