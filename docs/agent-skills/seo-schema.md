# SEO and Schema — DriveHours

Use for route metadata, canonical URLs, sitemap, robots, prerendering, JSON-LD, state guides, and share cards.

## Non-negotiables

- Use no CDN fetches; bundle all fonts and icons.
- Keep UI fully functional offline; UI flows must not require runtime network access.
- Keep TypeScript strict; use zero `any`.
- Meet WCAG AA contrast: at least 4.5:1 for normal text.
- Primary touch targets must be at least 64px.
- Use Navy `#0F172A`, Slate `#334155`, Teal `#0D9488` / `#0F766E`.
- Treat timer logic as sacred: preserve its one-second IndexedDB heartbeat and wall-clock calculations.
- Gate paid functionality at exactly `20.0` logged hours.
- Preserve Lighthouse Performance at 90 or higher.

## SEO rules

Use `https://www.drivehours.app` for canonical, Open Graph, JSON-LD, sitemap, and robots URLs. Keep sitemap routes aligned with real static and prerendered routes, including all 50 lowercase `/dmv/:stateCode` pages. Use valid, factual Schema.org JSON-LD; never invent DMV requirements or claims. Ensure crawler-facing static files remain directly served rather than rewritten to the SPA shell.
