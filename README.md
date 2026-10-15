# Design Code Jobs

A job board for software design engineers: designers who code, UX engineers, UI engineers, design technologists, creative technologists, and design systems engineers. Mechanical, hardware, chip, and audiovisual roles are filtered out.

The site is a Next.js App Router app. It reads public Greenhouse, Lever, and Ashby boards, hosts the full description, and marks up each open role with JobPosting structured data. It runs without accounts: jobs fall back to `data/seed/jobs.json`. Supabase, Dodo Payments, Google Indexing, and IndexNow are optional and stay off until their env vars are set.

The `main` branch deploys on Railway. The public site is https://designcodejobs.com.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The seed catalog is enough to click through home, a job, role hubs, salary, remote, Framer, and the guides.

```bash
npm test
npm run typecheck
npm run build
```

## Environment

See `.env.example`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | No | Set to `https://designcodejobs.com` with no trailing slash. `www`, a `*.up.railway.app` host, or a trailing slash are still published as `https://designcodejobs.com`. Localhost is left alone. |
| `SUPABASE_URL` | No | Server-only. When set with the service role key, reads and writes go to Postgres. |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Bypasses RLS. Never prefix it with `NEXT_PUBLIC_`. |
| `CRON_SECRET` | Production | `Authorization: Bearer` for `/api/cron/ingest` and `/api/indexnow`. Production returns 401 if it is missing. |
| `REVIEW_SECRET` | No | Cookie gate for `/review`, the low-confidence queue. |
| `DODO_PAYMENTS_API_KEY` | To charge | API key from Developer → API Keys. Test and live keys are separate. |
| `DODO_PAYMENTS_WEBHOOK_KEY` | To publish paid posts | Signing secret from Developer → Webhooks. Standard Webhooks (`webhook-id`, `webhook-signature`, `webhook-timestamp`). |
| `DODO_PAYMENTS_ENVIRONMENT` | To charge | `test_mode` (`https://test.dodopayments.com`) or `live_mode` (`https://live.dodopayments.com`). There is no default. |
| `DODO_PAYMENTS_PRODUCT_STANDARD` | To charge | Product id for the $129 one-time 30-day post. |
| `DODO_PAYMENTS_PRODUCT_FEATURED` | To charge | Product id for the $99 featured add-on. A featured checkout includes both products. |
| `GOOGLE_INDEXING_CREDENTIALS` | No | Service-account JSON on one line. Empty means the Indexing API is a no-op. |
| `INGEST_BATCH` | No | Company boards per cron run. Default 20. |
| `INDEXNOW_KEY` | To notify IndexNow | Public key, 8–128 characters (`a-z`, `A-Z`, `0-9`, `-`). Served at `https://designcodejobs.com/<key>.txt`. The committed default is `10bf5cfa82ac960b7a1d23c83bbf60ab`. |

Paid posts are charged through Dodo Payments. The listing stays pending until `payment.succeeded` arrives.

## Data

`data/companies.csv` lists Greenhouse, Lever, and Ashby board tokens. Duplicate slugs are one company with more than one board.

`data/seed/jobs.json` is the committed sample, fetched from those boards with descriptions and employer-posted salary. `npm run seed` refreshes it from `data/jobs.json` (the sample id list). A board that is down is reported as missing and left out of the file.

Without Supabase, the app reads the seed file and overlays `data/runtime/store.json` (gitignored) for local submissions, alerts, and ingest writes.

With Supabase, apply `supabase/migrations/20261015103000_init_job_board.sql` and then `supabase/migrations/20261015150000_dodo_payments.sql` (SQL editor or `supabase db push` once the CLI is linked). The second migration renames `submissions.lemonsqueezy_order_id` to `payment_id`. Tables: `companies`, `company_boards`, `jobs` (jsonb payload plus denormalized columns), `submissions`, `alert_subscriptions`, `ingest_state`. RLS is on. Public `SELECT` is limited to companies, boards, and jobs with status `active` or `expired`. Service role does the writes. If a Supabase read fails, the app falls back to the seed file.

A successful board read upserts that company (`slug`) and board (`ats`, `board_token`) and sets `last_synced_at`. A failed board is left alone. Without Supabase the upsert is skipped.

## Ingest

Matching lives in `lib/matching.ts`. Strong titles (UX engineer, UI engineer, design technologist, creative technologist, design systems engineer, prototyper) publish on the title alone. A bare “design engineer” stays in review until the description has software signals (React, Figma, CSS, design systems, and the rest of that list). Title exclusions (mechanical, hardware, chip, CAD, AV, architecture, and similar) are rejected and not stored.

```bash
npm run ingest          # one batch, then advances the cursor
npm run ingest -- --all
npm run ingest -- --company=vercel
```

Greenhouse descriptions are fetched only after the title matches, because the list endpoint has no body. A failed detail fetch does not expire that job. A failed board does not expire that company’s roles. Paid listings are never expired by ingest.

Vercel cron hits `GET /api/cron/ingest` daily at 07:00 UTC (`vercel.json`). `maxDuration` is 60 seconds, so the default batch is 20 companies. Raise `INGEST_BATCH` or run `npm run ingest -- --all` when a full pass is required. Closed roles that disappear from a successfully listed board are marked expired. After 90 days the URL returns 410.

## Pages

Canonical paths follow `docs/SEO_PLAN.md`, including the OpenSEO priorities in section 8.

| Path | Title / H1 |
| --- | --- |
| `/` | Design engineer jobs |
| `/roles/ux-engineer` | UX engineer jobs |
| `/roles/creative-technologist` | Creative technologist jobs |
| `/roles/design-systems-engineer` | Design systems engineer jobs |
| `/roles/ui-engineer` | UI engineer jobs |
| `/roles/design-technologist` | Design technologist jobs |
| `/salary` | Design engineer salary |
| `/salary/ux-engineer` and the other role salary pages | UX engineer salary, UI engineer salary, design technologist salary, design systems engineer salary, creative technologist salary |
| `/remote` | Remote design engineer jobs |
| `/seniority/internship` | Design engineer internship |
| `/skills/framer` | Framer jobs (the design tool, not carpentry) |

`/roles/design-engineer` uses “Software design engineer jobs” so the home page keeps the head term. City pages are not routed. Old paths redirect: `/jobs` → `/`, `/titles/:slug` → `/roles/:slug`, `/salaries` → `/salary`.

A facet page is `noindex,follow` until it has at least 5 open roles (3 for a company page). Salary role pages are indexable with at least one yearly range. Query-string filters are `noindex` and canonical to the parent. Pages 2 and 3 of a list are indexable and self-canonical. Page 4+ is `noindex`. JobPosting JSON-LD is only on an active job page with a real description and a mappable location. Fully remote roles use `TELECOMMUTE` plus applicant countries, and omit `jobLocation`. Hybrid roles never use `TELECOMMUTE`. `baseSalary` is included only when the employer posted a base range. Worldwide remote roles with no country omit the markup. Expired jobs drop the markup. Sitemaps, `robots.txt`, RSS (`/feed.xml`), and dynamic OG images are included.

Finished guides are MDX in `content/guides/`. Salary figures in the salary guide are rendered from the open listings, the same source as `/salary`:

- What is a design engineer?
- Design engineer salary guide (the live numbers stay on `/salary`)
- Design engineer job description (includes a UX engineer job description section)

## Brand and design system

The mark is a `</>` code tag whose slash is a pen-tool handle with a selected anchor point. `lib/brand.ts` holds the colours and the SVG. `public/mark.svg` (ink tile) and `app/icon.svg` (indigo tile) are generated from it, and `app/favicon.ico` holds the 16–64 px renders. `/apple-icon` and `/logo/designcodejobs` (the Organization logo in JSON-LD, 512 px) are rendered from the same SVG.

Open Graph images (`/opengraph-image`, `/jobs/[slug]/opengraph-image`, `/guides/[slug]/opengraph-image`) share `lib/og.tsx`, which loads Geist from `assets/fonts` (SIL OFL). The home image shows live counts.

Tokens live at the top of `app/globals.css` (light and `.dark`). Component classes (`btn`, `chip`, `job-card`, `field`, `faq`, `sel-frame`, and the rest) are in `@layer components`, so Tailwind utilities still override them. Type is Geist and Geist Mono, with Instrument Serif italic for accents. Motion respects `prefers-reduced-motion`. Sections with `.reveal` fade in through `components/reveal-observer.tsx`. Content stays visible without JavaScript.

## Answer engines

`/llms.txt` is a plain-text summary of the board with live counts, for AI assistants. `robots.txt` allows search and AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, and others) and keeps `/review` and the checkout return page out.

## Posting a job

`/post-a-job` saves the listing as `pending_payment`, creates a Dodo checkout session, and redirects to `checkout_url`. Standard is $129 for 30 days. Featured adds the $99 product on the same cart ($228 total). The return URL is `https://designcodejobs.com/post-a-job/confirmation?submission=<id>`. Dodo appends `payment_id`, `status`, and the customer email. The browser return does not publish the role.

### Dodo dashboard

Use the same mode (Test or Live) for the API key, the products, and the webhook.

1. Products → create two one-time products: a standard 30-day job post at $129, and a featured add-on at $99. Copy each product id into `DODO_PAYMENTS_PRODUCT_STANDARD` and `DODO_PAYMENTS_PRODUCT_FEATURED`.
2. Developer → API Keys → create a key. Set `DODO_PAYMENTS_API_KEY` and `DODO_PAYMENTS_ENVIRONMENT` to `test_mode` or `live_mode`.
3. Developer → Webhooks → add `https://designcodejobs.com/api/webhooks/dodo`. Subscribe to `payment.succeeded`, `payment.failed`, `payment.cancelled`, and `refund.succeeded`. Copy the signing secret into `DODO_PAYMENTS_WEBHOOK_KEY`.

`payment.succeeded` publishes the post for 30 days. Featured is set when the add-on product is in `product_cart` or `metadata.featured` is true, and `featured_until` matches the listing expiry. A repeat delivery of the same payment is a no-op. `payment.failed` and `payment.cancelled` leave the submission pending so the buyer can try again. `refund.succeeded` expires the job. A title that matches a hard exclusion can be paid and still stay unpublished. If the API key, environment, or product ids are missing, the form returns to the confirmation page with `pending=1` and nothing is charged.

## Email alerts

The signup form stores an address. `lib/email.ts` defines an `EmailSender` interface. The default implementation logs and does not send. Wire a provider later by implementing that interface.

## Google Indexing API

When `GOOGLE_INDEXING_CREDENTIALS` is a service-account JSON string, publish sends `URL_UPDATED` and expiry sends `URL_DELETED`. Leave it empty to skip the call. This repo does not create a Google Cloud project.

## IndexNow

Set `INDEXNOW_KEY`. The app serves that key at `https://designcodejobs.com/<INDEXNOW_KEY>.txt` (UTF-8, key only). `public/10bf5cfa82ac960b7a1d23c83bbf60ab.txt` is the same key checked in, so the file exists for the documented value even before the env var is read. If Railway sets a different key, middleware serves the new file at the new path.

Submissions go to `https://api.indexnow.org/indexnow` in batches of at most 10,000 URLs. Only `https://designcodejobs.com` URLs are sent. A URL is not sent again within 10 minutes. A `429` waits for `Retry-After` when that wait fits the caller, then tries once. Ingest and checkout do not block on a long wait.

IndexNow runs after ingest for new, changed, or newly expired job URLs, and after a paid post is published (or refunded and expired). Submit every sitemap URL once:

```bash
INDEXNOW_KEY=10bf5cfa82ac960b7a1d23c83bbf60ab npm run indexnow
```

Or `GET`/`POST` `https://designcodejobs.com/api/indexnow` with `Authorization: Bearer $CRON_SECRET`.

## Deploy on Railway

The GitHub branch deploys itself on Railway. This is not a Vercel app. `vercel.json` is unused there.

1. In the Railway service, set the env vars in `.env.example`. Production needs `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL=https://designcodejobs.com`, and `INDEXNOW_KEY=10bf5cfa82ac960b7a1d23c83bbf60ab`.
2. Attach `designcodejobs.com`. Requests to `www.designcodejobs.com` and any `*.up.railway.app` host 301 to `https://designcodejobs.com`, keeping the path and query.
3. Apply the Supabase migration and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` when Postgres is ready.
4. Add the Dodo Payments env vars and the webhook in the same mode as the API key. See Posting a job.
5. Schedule a daily request to `GET /api/cron/ingest` with `Authorization: Bearer $CRON_SECRET`. Railway does not run the Vercel cron in `vercel.json`.

### DNS

At the registrar, use the records Railway shows for the apex and for `www`. The app sends `www` and the default Railway hostname to the apex, so both names can stay attached.

## Review queue

Set `REVIEW_SECRET`, open `/review`, and submit the secret. The page lists matches that scored between the review and publish thresholds. They are stored and are not public.

## Tests

`npm test` covers title matching (including hardware exclusions and design-systems titles), JobPosting field mapping, salary currency separation, Dodo webhook signatures and paid publish, canonical URLs, the sitemap, and IndexNow batching.
