# DriveLog — Project Context for AI Assistants

> Offline-first PWA for US teens to log supervised driving hours (40–70 hrs depending on state) and export DMV-ready PDFs.
> Competes with RoadReady: no ads, no data loss, pause/resume timer, legal night detection, one-time $4.99 Pro unlock.

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + Vite 5 + TypeScript (strict), SWC plugin |
| Styling | Tailwind CSS 3.4, Lucide React icons |
| Routing | react-router-dom |
| Local storage | IndexedDB via `idb` (100% offline persistence) |
| Auth | Supabase passwordless magic link (`src/lib/supabase.ts`, `src/contexts/AuthContext.tsx`) |
| Monetization | Stripe Checkout $4.99 one-time Lifetime Pro; free up to 20 logged hours. Edge Functions: `supabase/functions/create-checkout-session`, `supabase/functions/stripe-webhook`. Entitlement state cached offline in `src/contexts/EntitlementContext.tsx` |
| PDF | `@react-pdf/renderer` client-side generation (`src/utils/pdf.tsx`, lazy-loaded) |
| Night detection | `suncalc` + state rules (`src/utils/suncalc.ts`, `src/hooks/useNightDetection.ts`) |
| PWA | vite-plugin-pwa + Workbox service worker |

## Commands

```bash
npm run dev        # Vite dev server (localhost:5173)
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # ESLint on src/
npm run typecheck  # tsc --noEmit
```

Run `npm run typecheck && npm run lint` after every change.

## Actual File Structure

```
src/
├── components/
│   ├── AuthModal.tsx          # Magic-link sign-in dialog
│   ├── DriveLogEntry.tsx      # Individual drive entry card
│   ├── DriveSummary.tsx       # Progress bars: total / day / night hours
│   ├── DriveTimer.tsx         # Live Start/Pause/Resume/Stop session timer
│   ├── MultiDriverForm.tsx    # Driver & vehicle profile manager
│   ├── PdfExport.tsx          # DMV PDF preview & download
│   ├── PwaInstallPrompt.tsx   # iOS/Android install sheet
│   ├── StateSelector.tsx      # 50-state DMV requirement selector
│   └── UpgradeModal.tsx       # $4.99 Lifetime Pro checkout modal
├── contexts/
│   ├── AuthContext.tsx        # Supabase auth provider
│   └── EntitlementContext.tsx # Free vs Pro entitlements (offline-cached)
├── hooks/
│   ├── useDriveTimer.ts       # Crash-resilient timer persisted to IndexedDB every second
│   ├── useDriveLog.ts         # IndexedDB CRUD for drive entries
│   ├── useNightDetection.ts   # Legal day/night classification per state
│   ├── useOnlineStatus.ts     # Connectivity listener
│   ├── usePwaInstall.ts       # beforeinstallprompt & standalone detection
│   ├── useSeo.ts              # Per-route meta tags & canonical URLs
│   └── useTheme.tsx           # Light/Dark/System theme
├── lib/supabase.ts            # Supabase client
├── pages/
│   ├── Home.tsx               # Dashboard, progress, start-drive CTA
│   ├── LogDrive.tsx           # Active timer + drive history w/ search & filters
│   ├── ExportDocs.tsx         # DMV PDF generator & compliance check
│   └── Settings.tsx           # Account, state goals, backup, appearance
├── types/index.ts             # All interfaces + 50-state requirements data
├── utils/db.ts                # IndexedDB schema & transactions
├── utils/pdf.tsx              # @react-pdf DMV document layout
└── utils/suncalc.ts           # State-based solar calculations

supabase/
├── functions/create-checkout-session/index.ts   # Stripe checkout creator
├── functions/stripe-webhook/index.ts            # Webhook processor
└── migrations/                                  # profiles_auth.sql, monetization_schema.sql
```

## Core Data Models (`src/types/index.ts`)

```typescript
interface DriveEntry {
  id: string;
  date: string;                // YYYY-MM-DD
  startTime: string; endTime: string;  // ISO datetime
  durationMinutes: number;
  miles: number;
  dayNight: 'day' | 'night';   // Legal classification (not clock-based)
  weather: string; roadType: string; notes: string;
  isVerified: boolean;         // Parent sign-off flag
  driverId: string; vehicleId: string; initials: string;
  state: string;               // 2-letter state code
}

interface DriverProfile { id, name, role: 'parent' | 'teen', phone, isPrimaryDriver }
interface VehicleProfile { id, name, make, model, year, licensePlate }
interface StateInfo { code, name, requiredHours, requiredNightHours, requiresSpecificApp, appName? }
```

All 50 states' hour requirements are configured in `src/types/index.ts` (e.g., CA: 50/10 night, ME: 70/10 highest, GA: 40/6).

## Key Business Logic

1. **Crash-resilient timer:** Timer state saved to IndexedDB every second; app restores exact state after crash/close/battery death.
2. **Legal night detection:** Uses SunCalc astronomical sunset per state coordinates + state rules (typically civil twilight +30 min), NOT fixed clock times.
3. **DMV PDF:** Fully client-side vector PDF with declaration blocks, supervisor signature fields, and per-entry initials — matches official DMV log formats.
4. **Freemium gate:** Free ≤ 20 hours logged; then $4.99 one-time Stripe unlock. Entitlement cached in IndexedDB so Pro features work offline.

## Design Language

- Colors: Deep Navy `#0F172A`, Warm Slate `#334155`, Accent Teal `#0D9488`
- Font: Inter / system stack, tabular mono numbers
- Tone: calm, high-contrast, large touch targets (≥64px primary buttons) — usable inside a car
- Motto: "It's not complicated, it's just a log"

## Conventions & Constraints

- Offline-first: never break functionality when there's no network; all data writes go to IndexedDB first.
- Strict TypeScript — no `any` unless unavoidable.
- PWA must remain installable on iOS Safari and Android Chrome.
- Never log or expose Supabase/Stripe keys (see `.env.example`).
- Deploy target: Vercel (`vercel.json`).

## DriveHours Specialized Agent Guides

Before modifying these surfaces, read the applicable guide:

- Premium UI, Tailwind, components, pages: `docs/agent-skills/premium-ui-ux.md`
- Timer, IndexedDB, service worker, PWA/install/offline flows: `docs/agent-skills/pwa-offline.md`
- Metadata, canonical URLs, sitemap, robots, JSON-LD, state guides: `docs/agent-skills/seo-schema.md`
- Any interactive UI, form, dialog, color, animation, or responsive change: `docs/agent-skills/accessibility.md`
- Vite config, route loading, images, PWA assets, bundle size, or performance work: `docs/agent-skills/performance.md`

These guides supplement this file. When guidance overlaps, preserve the stricter DriveHours constraint.
