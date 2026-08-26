# Premium UI/UX — DriveHours

Use for React, Tailwind, page, component, motion, or visual-system work.

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

## Design direction

Create calm, premium, mobile-first SaaS UI: restrained glass surfaces, clear hierarchy, intentional motion, and large in-car-friendly controls. Prefer semantic HTML, Tailwind tokens, Lucide icons already in the bundle, visible focus states, and `prefers-reduced-motion` support. Do not add decorative motion that obscures timer state or increases interaction latency.
