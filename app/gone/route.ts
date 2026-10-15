export function GET() {
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>Role closed</title><body style="font-family:sans-serif;max-width:36rem;margin:4rem auto;padding:0 1.25rem"><h1>This role is gone</h1><p>It has been closed for more than 90 days. <a href="/">See open design engineer jobs</a>.</p></body></html>`;
  return new Response(html, {
    status: 410,
    headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex" },
  });
}
