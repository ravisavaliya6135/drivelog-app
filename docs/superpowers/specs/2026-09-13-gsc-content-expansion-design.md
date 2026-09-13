# DriveHours GSC Content Expansion Design

## Goal

Turn the early Google Search Console demand for supervised driving logs into useful, crawlable DriveHours content that can earn qualified clicks without misrepresenting DMV rules.

## Evidence and decision

The supplied Search Console export reports zero clicks but 519 listed page impressions. The most visible state pages are California (169 impressions), North Carolina (118), and Ohio (73). The strongest relevant query groups are night supervised-driving hours, 50-hour DMV log sheets, permit-hour logs, and questions about whether a DMV verifies logged practice hours.

The approved direction is a focused first content release:

- Strengthen the existing national `/night-driving-hours` guide instead of creating a duplicate page.
- Add two national, answer-first public guides:
  - `/50-hour-driving-log`
  - `/does-dmv-check-driving-hours`
- Improve CA, NC, and OH state guides with links to the new and existing national guides.

Queries about Pennsylvania driving records, MVR reports, and unrelated driving-record retrieval are intentionally excluded because DriveHours does not provide motor-vehicle-record services.

## Approaches considered

1. Create broad generic driving articles. This would be fast, but it would compete on vague terms and dilute the product's supervised-practice focus.
2. Rewrite every state guide immediately. This would cover more pages but creates unnecessary legal-content risk and spreads the work too thin.
3. Build a small national content cluster, then link it to the three state pages already earning the most impressions. This is the selected approach because it matches observed search intent, reuses existing state requirements, and creates clear internal navigation.

## Content architecture

### 1. Refreshed national night-hours guide

`/night-driving-hours` remains the authoritative national guide for the observed “how many night driving hours” questions. It will gain a concise answer-first opening, a short explanation that states define night differently, links to the two new guides, and context links from the priority state pages. It must continue to use only the existing local `US_STATES` data for its requirements table and must retain its verification notice.

### 2. 50-hour driving-log guide

`/50-hour-driving-log` answers the intent behind “DMV 50 hour log sheet,” “how to log 40 hours of driving,” and related permit-log queries. It will explain how to make a complete supervised-practice record: date, start/end time, duration, supervisor, day/night classification, notes, and signatures when required. It will not claim every state requires 50 hours. Instead, it will direct readers to their state page, the national night-hours guide, and the DriveHours logging flow.

### 3. DMV verification guide

`/does-dmv-check-driving-hours` answers “does the DMV check your driving hours” and related queries. It will plainly explain that proof and review practices differ by state, that users should follow their state’s required form and certification process, and that DriveHours helps organize a clear record but is not a licensing authority. It will not speculate about enforcement, guarantee acceptance, or give legal advice.

### 4. Priority state-guide linking

California, North Carolina, and Ohio guides will each link readers to the national night-hours page, the 50-hour log guide, and the verification guide from relevant sections. The links will use descriptive anchor text, be useful to a teenager or parent completing their required practice, and preserve the existing official-source notice and state requirements.

## Technical design

- Add the two public pages as lazy-loaded React routes in `src/App.tsx`.
- Implement the pages as self-contained React article components using `useSeo`, canonical `https://drivehours.app` URLs, `BreadcrumbList` JSON-LD, app-card styling, existing Lucide icons, and a single `Start Logging for Free` CTA.
- Add each route to the public-page prerender list in `scripts/prerender.mjs` so visible content, title, description, canonical tag, and Open Graph tags exist before JavaScript runs.
- Add each canonical route to `public/sitemap.xml` exactly once.
- Use only factual WebPage/BreadcrumbList schema where appropriate. Do not use FAQPage as a rich-result tactic.
- Keep all public copy offline-safe: no runtime network fetches and no new dependencies.

## Accuracy, safety, and brand rules

- State requirements remain sourced from `US_STATES`; the state licensing agency is the source of truth.
- Do not state a universal number of supervised or night-driving hours.
- Do not claim DriveHours is an official DMV form, a legal authority, or guaranteed to be accepted by any DMV.
- Preserve the existing calm, teen-and-parent-friendly DriveHours tone and 64px primary CTA target.
- Keep TypeScript strict and retain accessible heading order, labelled tables, link focus states, and WCAG-AA text contrast.

## Validation

- Add static tests that verify the three content routes are registered, prerendered, present in the sitemap, and contain their canonical titles/descriptions in the built HTML.
- Add static tests confirming priority state guides link to all three national guides.
- Run `npm run typecheck`, `npm run lint`, and `npm run build`.
- Inspect the generated HTML for the three national routes and CA/NC/OH state routes for canonical URLs, visible answer-first content, working internal links, and absence of FAQPage schema.

## Success measure

After publishing, compare a 28-day Search Console period against the previous 28 days. Track impressions, clicks, CTR, and position for the three new national pages, CA/NC/OH pages, and queries that include driving log, permit hours, 50-hour log, and night driving hours.
