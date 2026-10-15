# SEO Plan: designcodejobs.com
Research date: 2026-10-15. Prepared for Dusan Kovacevic. Files: `keywords.csv` (128 terms), `suggest.txt` (raw Google autocomplete output).

## 0. How to read the data
- **Volume and difficulty:** I had no paid SEO tool (Ahrefs, Semrush, GKP), so this plan has **no search volume or keyword difficulty numbers**. Signals used: (a) Google autocomplete via suggestqueries.google.com. If a term shows up there, real people search it. The order of suggestions is a rough popularity hint, not a measurement. (b) Web search results gathered on 2026-10-15. (c) Competitors' sitemaps. Anything marked *estimate* is a judgement call. Before you commit to page priorities, check volumes in Google Keyword Planner or Ahrefs' free tool.
- **Key finding: "design engineer" means two different jobs.** Autocomplete for "design engineer", "...europe", "...london", "...new york" and "...san francisco" is mostly about mechanical, hardware or construction engineers ("design engineer vs mechanical engineer", "physical design engineer europe", "design engineering heat shield"). "framer jobs" is mostly carpentry. So:
  - Always add a qualifier to the term: *software / UI / product / web design engineer*, "designers who code".
  - Page copy should use the vocabulary of our field (React, Figma, prototyping, design systems) so Google files the site under software, not hardware.
  - The head term "design engineer jobs" will be hard to win. The variant titles (UX engineer, design technologist, creative developer/technologist) are cleaner, and on those the big general boards are less dominant (*estimate*).

## 1. Keyword universe (summary; the full 128-term list is in keywords.csv)
| Cluster | Examples (autocomplete-confirmed = ✓) | Intent | Priority |
|---|---|---|---|
| Core | design engineer jobs ✓, design engineering jobs ✓, design engineer jobs entry level ✓, design engineer internship ✓, founding design engineer, staff/senior design engineer | Transactional | P1 |
| Remote/location | remote design engineer jobs ✓, …uk ✓, …usa ✓, design engineering jobs remote ✓, design engineer jobs nyc ✓/london ✓/seattle ✓, design engineering jobs germany ✓, europe (polluted by mechanical) | Transactional | P1 |
| Title variants | ux engineer jobs ✓ (+remote ✓), ui engineer jobs ✓ (+remote ✓), design technologist jobs ✓, creative developer jobs ✓ (+remote ✓, london ✓), creative technologist jobs ✓ (+remote/nyc/london/usa ✓), ux prototyper jobs ✓, ai prototyper jobs ✓, design systems engineer jobs ✓, frontend design engineer jobs ✓ | Transactional | P1 |
| Company | vercel design engineering ✓, vercel design engineer salary/interview/role/job ✓, google ux engineer ✓, amazon design technologist ✓; linear/stripe/ramp design engineer (estimate) | Nav/Transactional | P2 |
| Salary | design engineer salary ✓ (+nyc, california, uk, reddit, range ✓), ux engineer salary ✓ (+google ✓), ui engineer salary ✓, design technologist salary ✓, creative developer salary ✓, design systems engineer salary ✓ | Informational/commercial | P1 |
| Career info | what is a design engineer in software ✓, design engineer vs frontend engineer ✓, vs product designer ✓, vs software engineer ✓, ux engineer vs ux designer ✓, ux engineer job description ✓, design engineer portfolio (+examples/template/website ✓), design engineer interview questions/process ✓, creative developer roadmap ✓, vercel design engineer principles ✓ | Informational | P1/P2 |
| Tools | framer jobs ✓ (carpentry noise), react / figma / three.js / webgl / gsap / swiftui (estimate) | Transactional | P2/P3 |

**Volume signals actually observed** (not numbers):
- "design engineer jobs nyc" is the first suggestion for both "design engineer" and "design engineer jobs".
- Google marks "creative technologist jobs" with suggest subtype 457, the same marker shown for "design engineer jobs near me". That suggests Google treats it as a local/jobs query (*inference*).
- "creative technologist jobs in the last 3 days / week" is suggested, which points to strong demand for fresh listings.

## 2. SERP analysis (top ~15 terms)
Method: the web search tool on 2026-10-15 plus checks of competitor sitemaps. I did not use live Google rank tracking, so positions are indicative. Re-check in an incognito window from the US and UK.

| Term | Who ranks (observed) | Content type | Gaps / angle |
|---|---|---|---|
| design engineer jobs | designengineer.io, designengineer.jobs, designengineers.org, LinkedIn/Indeed (mixed with mechanical) | Niche boards + aggregators | Mixed intent. Win with a software-only, fresh, salary-transparent list |
| remote design engineer jobs | weworkremotely.com/remote-jobs/vercel-design-engineer, remotive.com (Cal.com, Samsara roles), LandEarly, EngRadar | Generalist remote boards | No niche board owns "remote + region" (EU/UK/US) pages |
| ux engineer jobs (remote) | LinkedIn job view, remotive.com (Counterpart, ATPCO, NTT) | Aggregators | No curated UX engineer page with salary ranges |
| ui engineer jobs | LinkedIn/Indeed/Glassdoor (*estimate*), India-heavy (Flipkart in suggestions) | Aggregators | Separate US/EU from India intent |
| design technologist jobs | LinkedIn, Amazon (amazon.jobs), Google careers (*estimate*) | Big-tech career pages | Gather big-tech plus startup roles in one place |
| creative developer / technologist jobs | LinkedIn, agency job boards, Indeed (*estimate*) | Aggregators | Agency, WebGL and Three.js roles; strong freshness intent |
| design engineer salary | Glassdoor/Indeed/ZipRecruiter = mechanical data (*estimate*, based on suggestions) | Salary aggregators | **Biggest gap:** no software design engineer salary data. Publish real ranges from postings (Vercel SF $208–312k, WorkOS $175–225k, Linear $120–190k, Samsara $137–231k, Cal.com $100–150k) |
| what is a design engineer | vercel.com/blog/design-engineering-at-vercel, paraform.com/blog/..., adobe.design/ideas/should-you-pursue-a-career-in-design-engineering, designengineer.xyz, learn-ui.com | Essays/blogs | Plenty of opinion pieces, few with data. Add job-data definitions ("based on N postings") |
| design engineer vs frontend engineer | designengineer.xyz, paraform | Blog | Comparison table + salary delta + real job description diffs |
| design engineer portfolio | Mechanical-portfolio results mixed in; Maggie Appleton's collection; personal sites | Galleries | A curated software design engineer portfolio gallery (links magnet) |
| design engineer interview | Mechanical Q&A PDFs dominate | PDFs/listicles | Software-specific interview guide (take-homes, prototype tasks, Vercel-style) |
| vercel design engineer | vercel.com/careers, vercel.com/blog, accel job board, WWR | Official pages | Company page: open roles, salary history, team links |
| design systems engineer jobs | LinkedIn/Indeed (*estimate*) | Aggregators | Dedicated category page |
| framer jobs | Carpentry results | n/a | Use "framer developer jobs" / "framer designer jobs" instead |
| design engineer jobs london / nyc | Mixed with mechanical/civil | Aggregators | City pages with a "software" modifier in title/H1 |

**Competitors**
- **designengineers.org:** jobs + people + resources index. Paid listings at $249/$399 for 30 days (from its /terms page). Its sitemap holds about 40+ `/jobs/{company-title-id}` URLs. Its homepage HTML has **no JSON-LD**, and it links out instead of hosting jobs. That makes it a weak Google for Jobs player. Opportunity: we do hosted job pages with full JobPosting markup.
- **designengineer.io:** board; $225 paid post, or free with about a 6-week wait.
- **designengineer.jobs:** curated board.

Ways to stand out: full JobPosting schema, salary on every listing, programmatic remote/region/title pages, salary data, and an EU focus.

**Google for Jobs:** the "job search experience" appears for jobs-intent terms. Google's documented regions include the US, UK, Germany, Netherlands, Portugal, Spain, France and others. **Serbia is not on the list**, so check the jobs box using a US or UK VPN or location setting. Third-party boards rank there when they host the full description with valid markup and a canonical URL.

## 3. Site architecture & URL plan
```
/                                  hub: latest jobs, top filters
/jobs/{company}-{title-slug}-{id}  job detail (only page type with JobPosting JSON-LD)
/remote                            remote design engineer jobs
/remote/{us|uk|europe|canada|worldwide}
/locations/{city}                  london, new-york, san-francisco, seattle, berlin, amsterdam, toronto
/titles/{design-engineer|ux-engineer|ui-engineer|design-technologist|creative-developer|creative-technologist|design-systems-engineer|prototyper}
/titles/{title}/remote             only if passes thresholds
/companies  /companies/{slug}      company profile + open roles + past roles count + salary ranges
/seniority/{junior|senior|staff|lead|founding|manager}
/skills/{react|figma|framer|threejs|webgl|swiftui|motion|design-systems}
/salaries  /salaries/{title}       data pages (from posted ranges)
/guides/{slug}                     evergreen articles
/reports/{yyyy-mm}                 monthly report
/post-a-job, /about
```
**Thin and duplicate content rules**
- **Index threshold:** a listing page is `index` when it has **≥5 active jobs** (≥3 for company pages). Below that it stays live as `noindex,follow` with related links. If it has 0 jobs for 60 days or more, 301 it to its parent or keep it noindexed.
- **Combinations:** allow at most 2 facets in the path (e.g. title+remote, title+city). Every other combination uses query params (`?seniority=`) that canonicalize to the clean parent and are disallowed from indexing (canonical + noindex). Do not block them in robots.txt, or Google can't see the canonical.
- **Unique content per listing page:** an intro of 80–150 words generated from data: count, median salary range, top companies, share remote, last-updated date. Add an FAQ block and links to related facets.
- **Job pages:** one canonical URL per job. A job that appears in several facets still uses one `/jobs/...` URL. If the same role is open in multiple cities, use one page with a `jobLocation` array unless the source has distinct requisitions.
- **Expired jobs:** keep the URL (it shows an "expired" banner and similar jobs) but remove the JobPosting JSON-LD, or set `validThrough` in the past. Notify Google via the Indexing API (URL_DELETED). After about 90 days, return 410, or keep it noindexed if it has backlinks.
- **Pagination:** `?page=2` is self-canonical and indexable only on the first 3 pages. Include it in internal links, but not in the sitemap.
- **Current data** (/workspace/designjobs/jobs.json, 37 jobs, 164 companies): only `/`, `/remote`, `/titles/design-engineer`, `/locations/san-francisco`, `/locations/london` and maybe `/remote/us` pass the threshold today. Every other facet launches as noindex. Ashby alone accounts for 8 of the 37 roles, so the company page `/companies/ashby` qualifies.

## 4. Technical SEO checklist (Next.js)
**JobPosting JSON-LD**, checked against developers.google.com/search/docs/appearance/structured-data/job-posting on 2026-10-15:
- **Required:** `title` (the job title only: no company, salary or emojis; keep the employer's wording), `description` (the full HTML description with `<p>/<ul>/<li>/<br>`; it must not equal the title), `datePosted` (ISO 8601), `hiringOrganization` (name + `sameAs` + `logo` with an aspect ratio of 0.75–2.5), `jobLocation` (Place → PostalAddress with **addressCountry required**). For 100% remote roles, `jobLocation` may be left out if `applicantLocationRequirements` is present.
- **Recommended:** `applicantLocationRequirements` (required in practice for remote roles: at least one Country/State), `jobLocationType: "TELECOMMUTE"` (only for 100% remote; never for hybrid, e.g. Cloudflare "Hybrid", Oura), `baseSalary` (MonetaryAmount with min/max and unitText YEAR; only employer-provided figures, and they must also be shown on the page), `employmentType` (FULL_TIME etc.), `identifier`, `validThrough` (include it when an expiry is known; if unknown, leave it out and remove the job when it closes), `directApply` (false for us, since we link out to the ATS).
- **Beta:** `educationRequirements`, `experienceRequirements.monthsOfExperience`, `experienceInPlaceOfEducation`.
- **Rules:** JobPosting markup goes **only on single-job pages, never on list or facet pages** (that earns a manual action). The markup must match visible content, including salary. There must be a way to apply. No login wall. No keyword stuffing in titles.
- **Mapping from our ATS data:** Ashby, Greenhouse and Lever expose a compensation field and a remote flag. Map "Remote - US" to TELECOMMUTE + Country USA. Map "Remote (Europe)" to a list of EU countries. Note that Google for Jobs doesn't cover every EU country. Map "Hybrid - SF" to jobLocation only.
- **Expiry automation:** re-poll the ATS daily. If a job disappears, strip the schema, show the expired state and send an Indexing API URL_DELETED. Default `validThrough` = datePosted + 60 days only if you set it that way in product policy; otherwise leave it out.

**Indexing API:** Google officially supports it only for pages carrying JobPosting (or BroadcastEvent in VideoObject). Google's job-posting doc recommends it over sitemaps for job URLs.
- **Setup:** a GCP service account, made an owner in Search Console.
- **Calls:** URL_UPDATED on publish/change, URL_DELETED on close.
- **Quota:** the default is about 200 publish requests per day; you can request more. Check that number in the current docs.
- Still submit sitemaps.

**Sitemaps**
- `sitemap-jobs.xml` holds active jobs only, with an accurate `lastmod`.
- `sitemap-pages.xml` holds indexable facets, guides and reports.
- No search-result or param URLs. Use a sitemap index. Generate with `app/sitemap.ts` or route handlers, revalidated hourly.

**Next.js**
- Use the App Router with SSR/ISR for job and facet pages (`revalidate` 900–3600 s) so the HTML includes the content and JSON-LD.
- Use `generateMetadata` for title/description/canonical/robots per page. Render JSON-LD in a `<script type="application/ld+json">` from a server component.
- Return real 404/410 via `notFound()` and middleware.
- Trailing-slash consistency. Lowercase slugs.
- `robots.ts` allows everything and lists the sitemaps.

**Other**
- **hreflang:** not needed (single English site).
- **Core Web Vitals:** LCP <2.5 s, INP <200 ms, CLS <0.1. Use `next/image` for logos with fixed dimensions, `next/font`, minimal client JS on listing pages (server-rendered filters as links), no layout shift from ads or banners.
- **OG/Twitter:** per-job dynamic OG image (`opengraph-image.tsx`: company logo, title, salary, remote badge). `twitter:card=summary_large_image`.
- **Other schema:** `Organization` + `WebSite` (SearchAction optional) on home, `BreadcrumbList` everywhere, `FAQPage` markup is fine but rarely shown now, `Article` on guides, `Dataset` on salary/report pages.
- **Search Console + Bing Webmaster Tools.** Track the `utm_source=google_jobs_apply` traffic Google mentions in its docs for the jobs experience. Also add our own UTM to outbound apply links.

## 5. Content plan (15 evergreen articles)
| # | Target keyword | One-line outline |
|---|---|---|
| 1 | design engineer salary (software) | Salary ranges from N posted listings by level, city and remote, with a methodology note; updated monthly |
| 2 | what is a design engineer in software | Definition, the 3 archetypes (product, brand/web, systems), day-to-day work, sample job descriptions, related titles |
| 3 | design engineer vs frontend engineer | Comparison table: skills, ownership, salary delta, real job-description excerpts, which to hire or become |
| 4 | design engineer vs product designer | Overlap and differences, career switch path, portfolio differences |
| 5 | ux engineer vs ux designer | Google-style UXE explained, what's tested in interviews, salaries |
| 6 | how to become a design engineer | Roadmap from designer→code and dev→design, a 90-day learning plan, first projects |
| 7 | design engineer portfolio examples | A gallery of 30 portfolios with annotations (what makes them hireable) |
| 8 | design engineer interview questions | Rounds (craft review, prototype take-home, systems, behavioural), with sample tasks and rubrics |
| 9 | design technologist job description | A template + real examples (Amazon, Google, agencies) + salary |
| 10 | creative developer roadmap / salary | WebGL, Three.js, GSAP stack; agency vs product; rates |
| 11 | design systems engineer guide | Responsibilities, tokens, tooling, career ladder, jobs link |
| 12 | design engineering at Vercel, Linear, Stripe (company guide) | How top teams structure the role, with interviews and open-role links |
| 13 | design engineer resume | Template + bullet examples tied to shipped work |
| 14 | remote design engineer jobs in Europe | Which companies hire in the EU, time zones, contractor vs EOR, salary bands (strong Serbia/EU angle) |
| 15 | best tools for design engineers (Figma, Framer, React, Cursor) | Stack survey built from mentions in job descriptions (counted from our data) |

**Monthly link asset: "Design Engineering Jobs Report — {Month YYYY}"** at `/reports/yyyy-mm`.
- **Contents:** number of open roles, new companies hiring, median posted salary by level and region, remote share, top skills mentioned (React/TypeScript/Figma/AI tools), notable roles.
- **Format:** downloadable CSV + embeddable charts (with an attribution link) + an X/LinkedIn thread.
- Journalists and newsletters cite data. Roles that rarely publish salaries make this rare data.

## 6. Distribution and link building (no spam)
- **Free value-adds:** a free "Post a job" tier for the first months, plus a public API/RSS/JSON feed of jobs (developers will embed it and link back), and a "Hiring design engineers" badge companies can put on their careers pages.
- **Curated directories:** submit to resource directories that already list design-engineer boards (e.g. fountn.design lists designengineer.io), plus design-resource sites, awesome-lists on GitHub (awesome-design-engineering, awesome-remote-job), Product Hunt and Hacker News "Show HN" at launch.
- **Data journalism:** the monthly report and the salary dataset, shared to newsletters (Sidebar, UX Collective, Frontend Focus, Bytes, Smashing, Dense Discovery) through their **public submission forms**. This is a later decision for you. Nothing has been sent.
- **Community:** build in public on X (design engineers are very active there; designengineers.org even indexes X hiring posts). Run a weekly "new design engineer roles" post, and add an automated X/Bluesky/LinkedIn feed account.
- **People-index angle:** profile pages for design engineers (opt-in) that they link to from their portfolios. That creates natural backlinks.
- **Tools and free utilities:** a salary calculator, a job-description generator for design engineer roles, a portfolio checklist. All linkable.
- **Partnerships via value, not outreach blasts:** offer bootcamps and courses (learn-ui.com-type) a free jobs widget.
- **Avoid:** PBNs, paid guest posts, mass DMs, and scraping LinkedIn listings without permission. Respect ATS terms. Always link to the original apply URL.

## 7. Next steps (first 30 days)
1. Ship job pages with valid JobPosting markup, then test them in the Rich Results Test.
2. Indexing API + sitemaps.
3. Build the indexable facets that pass thresholds today.
4. Publish articles #1–#3 and the first monthly report.
5. Verify volumes in Keyword Planner and adjust priorities.

## 8. Data-backed priorities (OpenSEO, US/en, pulled 2026-10-15)

Source: OpenSEO project `00b245e0-e0f6-4d4d-b937-b2f19178cf60`. Full data is in `keywords_openseo.csv`. Volume = US monthly searches, KD = 0-100, CPC in USD. Of the 128 planned terms, 81 returned data. The other 47 have no data, which in practice means near-zero volume. Close variants share one volume figure (Google Ads grouping), so don't add them together. **The 2,900 for "design engineer jobs" also counts mechanical and hardware searches.** The SERP is mixed, so expect only part of that traffic to fit this site.

### Top 20 terms to target first (volume vs KD)
| # | keyword | vol | KD | CPC | target |
|---|---|---|---|---|---|
| 1 | design engineer jobs (/job, /engineering jobs) | 2900 | 0 | 1.99 | / , /jobs |
| 2 | design engineer salary | 1600 | 0 | 51.95 | /salary |
| 3 | framer jobs | 1600 | 0 | 1.63 | /skills/framer |
| 4 | what is a design engineer | 880 | 3 | 1.67 | guide |
| 5 | ux engineer | 880 | 0 | 18.95 | /roles/ux-engineer |
| 6 | what do design engineers do | 720 | 0 | — | same guide as #4 |
| 7 | creative technologist jobs | 590 | 0 | 1.68 | /roles/creative-technologist |
| 8 | design systems engineer | 590 | 11 | 4.06 | /roles/design-systems-engineer |
| 9 | design system jobs | 320 | 0 | 10.72 | /roles/design-systems-engineer |
| 10 | design engineer internship | 320 | 0 | 3.21 | /seniority/internship |
| 11 | ux engineer jobs | 260 | 0 | 0.07 | /roles/ux-engineer |
| 12 | design engineer job description | 260 | 0 | — | guide |
| 13 | ui engineer | 260 | 0 | — | /roles/ui-engineer |
| 14 | design technologist jobs | 210 | 0 | 4.48 | /roles/design-technologist |
| 15 | ui developer jobs | 210 | 0 | 4.43 | /roles/ui-engineer |
| 16 | remote design engineer jobs | 170 | 0 | 2.51 | /remote |
| 17 | ux engineer salary | 140 | 8 | 86.68 | /salary/ux-engineer |
| 18 | design engineer portfolio | 110 | 0 | — | guide |
| 19 | ui engineer jobs | 90 | 0 | 5.12 | /roles/ui-engineer |
| 20 | how to become a design engineer | 90 | 13 | 16.73 | guide |

Not included: "product design engineer jobs" (260/0) and "design engineer jobs near me" (390/11), because they lean toward hardware and local searches. "Vercel design engineer" (50/21) has the highest KD among brand terms.

### Programmatic pages to prioritize
1. `/roles/*` hubs: ux-engineer (880 + 260), creative-technologist (590), design-systems-engineer (590 + 320), ui-engineer (260 + 210 + 90), design-technologist (210). Creative-developer is lower (30 vol).
2. `/salary` + `/salary/<role>`: design engineer salary 1600 and ux engineer salary 140 (CPC 86.68). design technologist / ui engineer salary are 50 each.
3. `/skills/framer`: framer jobs 1600 (navigational, likely brand-led; check the SERP). three.js jobs is 90.
4. `/remote`: remote design engineer jobs 170, design engineer jobs remote 70.
5. `/seniority/internship` (320). senior is 30 and junior is 20, so keep those pages thin.
6. City pages have little US demand: NYC 40, others 10 or no data. Hold off on them.

### Content to write first
1. What is a design engineer? (880 + "what do design engineers do" 720 + in software 10)
2. Design engineer salary guide (1600) with UX engineer / design technologist / UI engineer breakouts
3. Design engineer job description template (260) + UX engineer job description (70)
4. How to become a design engineer (90) + skills (50)
5. Design engineer portfolio examples (110 + 70)
6. Design engineer interview questions (70) + resume (70)

### SERP competitors (12 top terms, organic)
indeed (vis 9.60), linkedin (8.00), ziprecruiter (6.45), reddit (4.50), glassdoor (3), **designengineer.io** (4 kws, avg pos 5.50, etv 754.59), **creativedevjobs.com** (2 kws, avg pos 2), levels.fyi (2 kws), uiuxjobsboard.com, uxengineer.com. designengineers.org did not show up in the top 25.
