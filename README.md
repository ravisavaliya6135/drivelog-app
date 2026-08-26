# 🚗 DriveHours (formerly DriveLog) — Teen Supervised Driving Log

> **drivehours.app** | Offline-first PWA | DMV-Ready PDF | Parent-Teen Friendly
> *"It's not complicated, it's just a log."*

DriveHours helps US teens log supervised driving hours (40–70 hrs depending on state) and export
DMV-ready PDF logs — with automatic legal night detection, crash-proof timers, parent sign-off,
and zero ads. Free for the first 20 hours; $4.99 one-time Lifetime Pro unlock. No subscription.

## ✨ Key Features

- **Crash-proof timer** — wall-clock based, persisted to IndexedDB every second; closing the app
  for hours credits exactly on return
- **Legal night detection** — real sunset calculations per state (SunCalc), not fixed clock times;
  handles Alaska polar day/night
- **50-state DMV requirements** — hour targets, permit ages, official form references
  (FL HSMV 71143, NY MV-262, PA DL-180C, …)
- **DMV-ready PDF export** — 100% client-side and offline, with signature blocks and
  per-entry supervisor initials
- **Parent sign-off flow** — per-drive verification with initials
- **Offline-first everything** — no account required; data lives in IndexedDB on your device
- **No ads, no tracking** — zero third-party trackers or font CDNs
- **Installable PWA** — iOS Safari, Android Chrome, desktop

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 + TypeScript (strict) |
| Styling | Tailwind CSS 3.4 + Lucide icons |
| Storage | IndexedDB (`idb`) — offline-first persistence |
| Auth | Supabase magic link (optional) |
| Payments | Stripe Checkout via Supabase Edge Functions ($4.99 one-time) |
| PDF | `@react-pdf/renderer` (click-time lazy loaded) |
| Night math | `suncalc` |
| PWA | `vite-plugin-pwa` (Workbox) |
| SEO | SSG-prerendered pages for all 50 states (`/dmv/:stateCode`) + sitemap |

## 🚀 Quick Start

```bash
git clone https://github.com/ravisavaliya6135/drivelog-app.git
cd drivelog-app
npm install

npm run dev        # http://localhost:5173
npm run build      # production build + SSG prerender (50 state pages + sitemap)
npm run typecheck  # tsc --noEmit (strict)
npm run lint       # eslint src
```

Optional: copy `.env.example` to `.env` and add your Supabase project URL + anon key.
The app works fully without them (guest mode).

## 📁 Project Structure

```
src/
├── components/    # DriveTimer, PdfExport, UpgradeModal, SiteFooter, ErrorBoundary, ...
├── contexts/      # AuthContext, EntitlementContext (offline-cached Pro state)
├── hooks/         # useDriveTimer (wall-clock), useNightDetection, useSeo, ...
├── pages/         # Home, LogDrive, ExportDocs, Settings,
│                  # StateGuide (+Index), Privacy, Terms, Help, Contact, About
├── prerender/     # SSR entry for the 50-state prerender step
├── types/         # DriveEntry, StateInfo (all 50 states + DMV form data)
└── utils/         # db (IndexedDB v3), pdf, suncalc, analytics, feedback
supabase/
├── functions/     # create-checkout-session, stripe-webhook (signature-verified)
└── migrations/    # profiles, entitlements, analytics_events, feedback_submissions
scripts/
├── generate-assets.ps1   # PWA icons + og-image generator
└── prerender.mjs         # SSG step: /dmv/* pages, sitemap.xml
```

## 🔒 Privacy

No ads. No trackers. No third-party font CDNs. Driving logs never leave your device unless you
create an account or send feedback. See the in-app Privacy Policy (`/privacy`).

## 📝 License

MIT
