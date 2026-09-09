# DriveHours SEO Sprint Design

## Goal

Increase qualified organic-search clicks after launch by improving the pages already receiving impressions, answering the highest-intent night-hours question, and making the public brand consistently DriveHours.

## Scope

### Included

- Replace user-facing and crawler-facing uses of `DriveLog` with `DriveHours`.
- Keep technical identifiers, including IndexedDB names, TypeScript symbols, analytics event names, and existing storage keys, unchanged.
- Improve the California, North Carolina, and Ohio state-guide search metadata and on-page source material.
- Add a prerendered `/night-driving-hours` guide and link to it from the state-guide hub.
- Consolidate state-guide metadata generation so React and prerendered HTML use the same values.
- Remove FAQPage markup used solely for rich-result eligibility; preserve factual WebApplication and BreadcrumbList markup.
- Update the generated sitemap for the new public route.

### Excluded

- A complete legal/content rewrite of all 50 state guides.
- Timer, IndexedDB, entitlement, authentication, PWA, or checkout behavior changes.
- A paid acquisition, backlink, or advertising campaign.
- Changes to internal technical identifiers that could affect existing local data.

## Architecture

### Shared state-guide SEO content

Introduce a small, typed module that derives default guide metadata and supplies vetted overrides for CA, NC, and OH. Both `StateGuide` and `scripts/prerender.mjs` consume the same titles and descriptions, preventing crawler-facing HTML from diverging from client-rendered metadata.

Each prioritized state receives:

- Search title and description tailored to the observed query intent.
- An answer-first introduction containing required total and night hours.
- A compact state-specific checklist with the official source URL already held in state data or added as a factual source link.
- A clearly visible verification notice.

The generic night-driving copy will avoid asserting a universal legal definition. It will state that state rules vary and direct readers to their state source.

### Nationwide night-hours guide

Add a public `NightDrivingHoursGuide` page at `/night-driving-hours`.

- Server-render it with the existing public-page prerender path.
- Give it a descriptive title and summary matching the high-intent question, “How many night driving hours are required?”
- Display the state requirements from the existing `US_STATES` source of truth in an accessible table.
- Link each state row to its corresponding guide and provide an obvious CTA to begin logging.
- Include one concise verification notice rather than presenting DriveHours as a licensing authority.
- Use standard WebPage/Breadcrumb structured data only where it is factual and relevant; do not add FAQPage markup.

### Public brand cleanup

Replace public product-name uses in browser-visible components, generated download names, head metadata, social metadata, structured data, and public crawler files. User-visible descriptions must call the product DriveHours.

Do not rename `DriveLogDB`, `useDriveLog`, event keys, internal console prefixes, or TypeScript component names. These names are implementation details and changing data identifiers risks offline data continuity.

### Structured data

Retain the WebApplication markup on the home page, changing its public `name` and `alternateName` to DriveHours. Keep valid BreadcrumbList markup on state guides. Remove FAQPage markup from the home template and state guides because DriveHours is not an eligible FAQ rich-result publisher and the markup is not a click-growth priority.

## Routing and prerendering

Register the new route in the React router and the SSR renderer. Add it to `publicPages` in the post-build prerender script and to the generated sitemap’s static route list. The static HTML must contain its own title, description, canonical URL, Open Graph tags, and rendered body content before JavaScript runs.

## Error handling and safety

- Unknown state codes retain existing noindex behavior.
- Existing official-state links remain outbound, opened safely with `noopener noreferrer`.
- The new page uses only local state data and does not fetch network content at runtime, preserving offline behavior.
- All state-specific factual content is constrained to verified state requirements and links; the UI tells users to verify rules before a licensing appointment.

## Validation

- `npm run typecheck`
- `npm run lint`
- `npm run build`, which runs prerendering
- Inspect generated `dist/night-driving-hours/index.html` for title, canonical URL, visible content, and absence of FAQPage markup.
- Inspect generated CA, NC, and OH static pages for their state-specific metadata and canonical URLs.
- Confirm sitemap includes `/night-driving-hours` exactly once.
- Search public files and user-visible source for remaining `DriveLog` branding; accept only internal implementation identifiers and legacy technical labels that are intentionally preserved.

## Success measures

Review Google Search Console after 28 days, using mobile data and Page + Query filters. Primary measures are clicks and CTR for CA, NC, OH, the night-hours page, and queries containing `driving log`, `night driving hours`, and the three state names. Position is a supporting metric, not the only success criterion.
