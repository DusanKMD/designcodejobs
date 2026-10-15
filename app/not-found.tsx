import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search } from "@/components/icons";

export const metadata: Metadata = {
  title: "Page not found",
  description: "That URL is not on Design Code Jobs.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <div className="canvas canvas-fade absolute inset-0 -z-10" aria-hidden />
      <div className="mx-auto max-w-2xl px-5 py-24 text-center sm:py-32">
        <p className="font-mono text-[96px] font-medium leading-none tracking-[-0.06em] text-fg sm:text-[140px]">
          <span className="sel">
            404
            <span className="sel-frame" data-label="Not found" aria-hidden>
              <i />
              <i />
              <i />
              <i />
            </span>
          </span>
        </p>
        <h1 className="mt-14 text-3xl sm:text-4xl">Page not found</h1>
        <p className="mt-3 text-[17px] leading-7 text-muted">That URL is not on the board. The role may have closed, or the link has a typo.</p>
        <form action="/" role="search" className="search-shell mx-auto mt-8 flex max-w-md items-center gap-2 rounded-2xl border border-line bg-card p-1.5 pl-4 shadow-[var(--shadow-md)]">
          <Search className="text-muted" />
          <label htmlFor="nf-q" className="sr-only">Search roles</label>
          <input id="nf-q" name="q" placeholder="Search open roles" className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-subtle" />
          <button type="submit" className="btn btn-primary h-10">Search</button>
        </form>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-secondary">
            Design engineer jobs <ArrowRight className="arrow" />
          </Link>
          <Link href="/post-a-job" className="btn btn-ghost">
            Post a job
          </Link>
        </div>
      </div>
    </section>
  );
}
