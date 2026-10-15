import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-20">
      <h1 className="text-4xl font-medium tracking-tight">Page not found</h1>
      <p className="mt-4 text-muted">That URL is not on the board.</p>
      <Link href="/" className="mt-6 inline-flex text-sm underline underline-offset-4">Design engineer jobs</Link>
    </div>
  );
}
