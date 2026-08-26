# PWA and Offline-First — DriveHours

Use for IndexedDB, timers, Workbox, install flows, persistence, authentication fallbacks, and offline UI.

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

## Offline rules

Persist user-visible writes to IndexedDB first. Never make a network response a prerequisite for logging, viewing, stopping, or resuming a drive. Preserve crash recovery, timer restoration, and legal night classification. Treat synchronization, auth refresh, Stripe, and Supabase as progressive enhancement with offline-safe states.
