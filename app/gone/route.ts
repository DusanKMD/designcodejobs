import { markSvg } from "@/lib/brand";

export function GET() {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Role closed — Design Code Jobs</title><link rel="icon" href="/icon.svg" type="image/svg+xml"><style>
:root{color-scheme:light dark;--bg:#fafafa;--fg:#0b0b0f;--muted:#5d5d69;--line:#e7e7eb;--card:#fff}
@media (prefers-color-scheme:dark){:root{--bg:#09090b;--fg:#f4f4f6;--muted:#a3a3b0;--line:#24242b;--card:#111114}}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;display:grid;place-items:center;min-height:100vh;padding:1.25rem;box-sizing:border-box}
main{max-width:28rem;background:var(--card);border:1px solid var(--line);border-radius:1rem;padding:2rem}
h1{font-size:1.75rem;letter-spacing:-.03em;line-height:1.15;margin:1.25rem 0 .5rem}p{color:var(--muted);margin:0}
a.btn{display:inline-flex;margin-top:1.5rem;background:var(--fg);color:var(--bg);text-decoration:none;font-weight:600;font-size:.875rem;padding:.7rem 1rem;border-radius:.75rem}
</style></head><body><main><a href="/" aria-label="Design Code Jobs">${markSvg("ink").replace("<svg ", '<svg width="36" height="36" ')}</a><h1>This role is gone</h1><p>It closed more than 90 days ago, so the listing has been removed.</p><a class="btn" href="/">See open design engineer jobs →</a></main></body></html>`;
  return new Response(html, {
    status: 410,
    headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex" },
  });
}
