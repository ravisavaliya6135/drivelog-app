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

## DriveLog design system

- Use the reusable DriveLog SVG mark: navy rounded square, white outlined `D`, and teal dashed road centre line. Do not substitute text initials or raster art.
- Keep the shell consistent: the sticky header uses the mark and named desktop links; mobile navigation uses Lucide line icons above Home, History, Export, and Settings labels. Active navigation has a teal treatment plus a non-color cue.
- Make Home a focused driving cockpit: license-progress card first, one full-width 64px **Start a driving session** action second, then day/night progress and latest-drive detail.
- Prefer solid, clearly separated surfaces with subtle shadows and visible borders over opaque glass or low-contrast gray-on-gray cards. Mirror hierarchy in dark mode.
- Use tabular figures for time and progress, 4/8px spacing rhythm, 16px minimum body text, and 16–24px section spacing.
- Favor a single primary action per screen. Secondary actions should be clearly quieter but remain at least 44px touch targets.
- Use text, labels, or icons alongside color for day/night, completion, validation, active navigation, and locked states.
- Keep animation to 150–250ms opacity, color, or elevation transitions; honor `prefers-reduced-motion` and never animate layout dimensions around live timer information.
