import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { href: "/roles/ux-engineer", label: "UX engineer" },
  { href: "/salary", label: "Salary" },
  { href: "/remote", label: "Remote" },
  { href: "/guides/what-is-a-design-engineer", label: "Guides" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-5">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-medium tracking-tight">
          <Mark />
          designcodejobs
        </Link>
        <nav className="ml-auto hidden items-center gap-5 text-sm text-muted sm:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-fg">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          <ThemeToggle />
          <Link
            href="/post-a-job"
            className="inline-flex h-8 items-center rounded-full bg-fg px-3 text-sm font-medium text-bg"
          >
            Post a job
          </Link>
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t border-line px-5 py-2 text-sm text-muted sm:hidden">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="shrink-0 hover:text-fg">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

function Mark() {
  return (
    <span className="grid grid-cols-2 gap-[2px]" aria-hidden>
      <span className="h-1.5 w-1.5 bg-fg" />
      <span className="h-1.5 w-1.5 bg-fg/35" />
      <span className="h-1.5 w-1.5 bg-fg/35" />
      <span className="h-1.5 w-1.5 bg-fg" />
    </span>
  );
}
