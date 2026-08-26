# Performance and Bundle Optimization — DriveHours

Use for Vite, React rendering, route loading, assets, images, PWA output, and performance regressions.

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

## Performance rules

Prefer route-level lazy loading for non-critical screens and keep timer/dashboard interactions responsive. Avoid adding dependencies when existing React, Tailwind, Lucide, Workbox, or browser APIs solve the need. Optimize local images and avoid layout shift. Preserve client-side PDF lazy loading and PWA caching. Validate production builds and investigate bundle increases before accepting them.
