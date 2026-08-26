# Accessibility — DriveHours

Use for every interactive, visual, form, dialog, navigation, and motion change.

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

## Review rules

Use semantic controls before ARIA. Every icon-only control needs an accessible name; every form input needs a programmatic label. Preserve keyboard navigation, visible focus, logical heading order, dialog focus handling, readable error states, and screen-reader status updates. Respect reduced-motion preferences and never rely on color alone to convey timer, paywall, or validation state.
