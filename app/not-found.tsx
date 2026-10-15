import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  description: "That URL is not on Design Code Jobs.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent">404</p>
      <h1 className="mt-3 text-5xl">Page not found</h1>
      <p className="mt-4 text-[17px] leading-8 text-muted">That URL is not on the board.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="inline-flex h-11 items-center rounded-md bg-fg px-5 text-sm font-medium text-bg">
          Design engineer jobs
        </Link>
        <Link href="/post-a-job" className="inline-flex h-11 items-center rounded-md border border-line px-5 text-sm">
          Post a job
        </Link>
      </div>
    </div>
  );
}
