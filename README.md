# Design Code Jobs

A job board for software design engineers: designers who code, UX engineers, UI engineers, design technologists, creative technologists, and design systems engineers. Mechanical, hardware, chip, and audiovisual roles are filtered out.

The site is a Next.js App Router app. It reads public Greenhouse, Lever, and Ashby boards, hosts the full description, and marks up each open role with JobPosting structured data. It runs without accounts: jobs fall back to `data/seed/jobs.json`. Supabase, Lemon Squeezy, Google Indexing, and IndexNow are optional and stay off until their env vars are set.

Pushes to this branch deploy on Railway. The public site is https://designcodejobs.com.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The seed catalog is enough to click through home, a job, role hubs, salary, remote, Framer, and the guide outlines.

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
| `LEMONSQUEEZY_CHECKOUT_STANDARD_URL` | To charge | Hosted checkout for the $129 listing. |
| `LEMONSQUEEZY_CHECKOUT_FEATURED_URL` | To charge | Hosted checkout for the $228 featured listing. |
| `LEMONSQUEEZY_VARIANT_STANDARD` | No | When set, the webhook only treats this variant as standard. |
| `LEMONSQUEEZY_VARIANT_FEATURED` | No | When set, the webhook treats this variant as featured. |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | To publish paid posts | HMAC-SHA256 of the raw body, compared to `X-Signature`. |
| `GOOGLE_INDEXING_CREDENTIALS` | No | Service-account JSON on one line. Empty means the Indexing API is a no-op. |
| `INGEST_BATCH` | No | Company boards per cron run. Default 20. |
| `INDEXNOW_KEY` | To notify IndexNow | Public key, 8–128 characters (`a-z`, `A-Z`, `0-9`, `-`). Served at `https://designcodejobs.com/<key>.txt`. The committed default is `10bf5cfa82ac960b7a1d23c83bbf60ab`. |

Stripe is not used. Lemon Squeezy is the checkout, including for a seller in Serbia.

## Data

`data/companies.csv` lists Greenhouse, Lever, and Ashby board tokens. Duplicate slugs are one company with more than one board.

`data/seed/jobs.json` is the committed sample, fetched from those boards with descriptions and employer-posted salary. `npm run seed` refreshes it from `data/jobs.json` (the sample id list). A board that is down is reported as missing and left out of the file.

Without Supabase, the app reads the seed file and overlays `data/runtime/store.json` (gitignored) for local submissions, alerts, and ingest writes.

With Supabase, apply the migration in `supabase/migrations/20261015103000_init_job_board.sql` (SQL editor or `supabase db push` once the CLI is linked). Tables: `companies`, `company_boards`, `jobs` (jsonb payload plus denormalized columns), `submissions`, `alert_subscriptions`, `ingest_state`. RLS is on. Public `SELECT` is limited to companies, boards, and jobs with status `active` or `expired`. Service role does the writes. If a Supabase read fails, the app falls back to the seed file.

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

Guide outlines, not finished essays, are MDX in `content/guides/`:

- What is a design engineer?
- Design engineer salary guide (the live numbers stay on `/salary`)
- Design engineer job description (includes a UX engineer job description section)

## Posting a job

`/post-a-job` collects the listing and sends the buyer to Lemon Squeezy. Standard is $129 for 30 days. Featured adds $99 ($228 total).

In Lemon Squeezy, create those two products and paste each variant’s hosted checkout URL into the env vars. Point a webhook at `https://designcodejobs.com/api/webhooks/lemonsqueezy` for `order_created` and `order_refunded`. The signing secret is `LEMONSQUEEZY_WEBHOOK_SECRET`. The app checks `X-Signature` against the raw body. A paid order publishes the submission. A refund expires it. A title that matches a hard exclusion can be paid and still stay unpublished. If the checkout URL is empty, the form returns to the confirmation page with `pending=1` and nothing is charged.

The checkout link adds `checkout[custom][submission_id]` and `checkout[email]`.

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
4. Add the Lemon Squeezy webhook and checkout URLs.
5. Schedule a daily request to `GET /api/cron/ingest` with `Authorization: Bearer $CRON_SECRET`. Railway does not run the Vercel cron in `vercel.json`.

### DNS

At the registrar, use the records Railway shows for the apex and for `www`. The app sends `www` and the default Railway hostname to the apex, so both names can stay attached.

## Review queue

Set `REVIEW_SECRET`, open `/review`, and submit the secret. The page lists matches that scored between the review and publish thresholds. They are stored and are not public.

## Tests

`npm test` covers title matching (including hardware exclusions and design-systems titles), JobPosting field mapping, salary currency separation, Lemon Squeezy signature checks, canonical URLs, the sitemap, and IndexNow batching.
