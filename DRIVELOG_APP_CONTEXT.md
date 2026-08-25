# 🚗 DriveLog — Comprehensive Project & Technical Context

> **PWA Progressive Web App | Offline-first | DMV-Ready PDF | Parent-Teen Friendly**
> **Location on Host:** `C:\Users\saval\drivelog-app`
> *(A condensed version of this context lives in `AGENTS.md` for AI coding agents.)*

---

## 1. 🎯 Executive Summary & Value Proposition

### The Problem
In the United States, teenagers in nearly every state must log **40 to 70 supervised driving hours** (including 6–15 night hours) with a licensed adult before taking their road test for a provisional driver's license.

Existing solutions (like RoadReady or paper log sheets) fail due to several critical flaws:
- **Data Loss & Crashes:** Mobile web views crash and erase accumulated drive hours.
- **Aggressive Monetization & Ads:** Intrusive full-screen video ads interrupt drive logging.
- **No Offline Mode:** Fails in rural or poor-cell-reception driving environments.
- **Lack of Pause Feature:** Stopping for gas, drive-thrus, or traffic interruptions forces the user to cancel or restart sessions.
- **Inaccurate Night Detection:** Relying on simple clock times rather than official state rules (e.g., "30 minutes after sunset").
- **Non-Standard Exports:** Standard app summaries are often rejected at state DMV offices because they do not match official log formats.

### The Solution: DriveLog
**DriveLog** is an offline-first, parent-friendly Progressive Web App (PWA) designed to seamlessly track teen driving hours and output state-compliant, DMV-ready PDFs.

**Core Highlights:**
- ⏱️ **Resilient Drive Timer:** Start, pause, resume, and stop with automatic background state persistence in IndexedDB every second.
- 🌅 **Legal Night Detection:** Real-time calculation using `suncalc` to determine exact sunset/sunrise times based on geographic state rules.
- 👥 **Multi-Driver & Multi-Vehicle:** Separate tracking for teens, supervising parents, and family vehicles.
- 📄 **50-State DMV PDF Export:** Client-side vector PDF generation matching official DMV requirements with supervisor sign-off spaces.
- 🔐 **Supabase Auth:** Passwordless magic-link sign-in with PostgreSQL Row Level Security.
- 💰 **Freemium Pricing Model:** Free for the first 20 logged hours; one-time $4.99 lifetime unlock via Stripe Checkout.
- 📱 **Installable PWA:** Installs on iOS Safari and Android Chrome home screens without app store downloads or network requirements.

---

## 2. 🛠️ Complete Technical Stack

| Layer | Technology / Library | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `^18.3.1` | UI Component architecture |
| **Build System** | Vite + `@vitejs/plugin-react-swc` | `^5.4.10` / `^3.7.0` | Ultra-fast HMR and SWC compilation |
| **Language** | TypeScript | `^5.6.2` (strict) | Type safety across state and UI |
| **Styling** | Tailwind CSS + PostCSS + Autoprefixer | `^3.4.0` | Utility-first responsive design |
| **Icons** | Lucide React | `^0.452.0` | Accessible SVG icon suite |
| **Routing** | react-router-dom | `^7.x` | Single-Page Application client routing |
| **Local Database** | `idb` (IndexedDB Wrapper) | `^8.0.0` | High-performance offline storage |
| **Auth & Backend** | `@supabase/supabase-js` | `^2.x` | Passwordless magic-link auth + PostgreSQL RLS |
| **Payments** | Stripe Checkout via Supabase Edge Functions | — | $4.99 one-time Lifetime Pro unlock |
| **PDF Generation** | `@react-pdf/renderer` | `^3.4.0` | Client-side vector PDF rendering (lazy-loaded) |
| **Solar Calculations** | `suncalc` | `^1.9.0` | Astronomical calculations for legal day/night determination |
| **PWA & Caching** | `vite-plugin-pwa` | `^0.20.5` | Workbox service workers and web manifest generation |

---

## 3. 📁 File Architecture & Directory Mapping (Actual)

```
C:\Users\saval\drivelog-app/
├── index.html                        # App shell entry HTML
├── vite.config.ts                    # Vite bundler + PWA plugin settings
├── tailwind.config.js                # Tailwind custom color palette
├── tsconfig.json / tsconfig.node.json
├── vercel.json                       # Vercel deploy configuration
├── .env.example                      # Required env vars template
├── public/                           # Static assets (manifest, icons)
├── src/
│   ├── App.tsx                       # Root component: router + navigation shell + providers
│   ├── main.tsx                      # React DOM entry point
│   ├── index.tsx                     # Service worker registration
│   ├── index.css                     # Global Tailwind CSS imports & custom styles
│   ├── vite-env.d.ts                 # Vite client type declarations
│   ├── components/
│   │   ├── AuthModal.tsx             # Passwordless magic-link sign-in dialog
│   │   ├── DriveLogEntry.tsx         # Individual drive entry card view
│   │   ├── DriveSummary.tsx          # Progress bars: total / day / night hours
│   │   ├── DriveTimer.tsx            # Live Start/Pause/Resume/Stop session timer
│   │   ├── MultiDriverForm.tsx       # Driver & vehicle profile manager
│   │   ├── PdfExport.tsx             # Printable DMV PDF preview & download
│   │   ├── PwaInstallPrompt.tsx      # iOS/Android install sheet
│   │   ├── StateSelector.tsx         # 50-state DMV requirement selector
│   │   └── UpgradeModal.tsx          # $4.99 Lifetime Pro checkout modal
│   ├── contexts/
│   │   ├── AuthContext.tsx           # Supabase auth provider
│   │   └── EntitlementContext.tsx    # Free vs Pro entitlements (offline-cached in IndexedDB)
│   ├── hooks/
│   │   ├── useDriveTimer.ts          # Crash-resilient timer persisted to IndexedDB every second
│   │   ├── useDriveLog.ts            # IndexedDB CRUD hook for drive entries
│   │   ├── useNightDetection.ts      # Legal day/night classification per state
│   │   ├── useOnlineStatus.ts        # Network connectivity listener
│   │   ├── usePwaInstall.ts          # beforeinstallprompt & standalone detection
│   │   ├── useSeo.ts                 # Per-route meta tags & canonical URLs
│   │   └── useTheme.tsx              # Light/Dark/System theme provider
│   ├── lib/
│   │   └── supabase.ts               # Supabase client initialization
│   ├── pages/
│   │   ├── Home.tsx                  # Dashboard, progress, start-drive CTA
│   │   ├── LogDrive.tsx              # Active timer + drive history w/ search & filters
│   │   ├── ExportDocs.tsx            # DMV PDF generator & compliance check
│   │   └── Settings.tsx              # Account, state goals, backup, appearance
│   ├── styles/                       # Additional style modules
│   ├── types/
│   │   ├── index.ts                  # All interfaces + 50-state requirements data
│   │   └── suncalc.d.ts              # Type declarations for suncalc
│   └── utils/
│       ├── db.ts                     # IndexedDB schema & transactions
│       ├── pdf.tsx                   # @react-pdf DMV document layout
│       └── suncalc.ts                # State-based solar calculations
└── supabase/
    ├── functions/
    │   ├── create-checkout-session/index.ts   # Stripe checkout session creator
    │   └── stripe-webhook/index.ts            # Cryptographic webhook processor
    └── migrations/
        ├── 20260815_profiles_auth.sql         # Profiles schema with Row Level Security
        └── 20260815_monetization_schema.sql   # Entitlements schema & triggers
```

---

## 4. 📊 Data Models & Schema (`src/types/index.ts`)

### `DriveEntry` Interface
Represents a completed or in-progress drive session.
```typescript
export interface DriveEntry {
  id: string;
  date: string;               // ISO date string (YYYY-MM-DD)
  startTime: string;          // ISO datetime string
  endTime: string;            // ISO datetime string
  durationMinutes: number;    // Calculated duration in minutes
  miles: number;              // Odometer / distance logged
  dayNight: 'day' | 'night';  // Legal classification (not clock-based)
  weather: string;            // Weather condition (Clear, Rain, Snow, etc.)
  roadType: string;           // Driving environment (Highway, City, Rural, etc.)
  notes: string;              // Custom observations or skills practiced
  isVerified: boolean;        // Parent sign-off flag
  driverId: string;           // Associated DriverProfile ID
  vehicleId: string;          // Associated VehicleProfile ID
  initials: string;           // Supervising adult initials
  state: string;              // 2-letter state code (e.g., 'CA', 'TX')
}
```

### Supporting Entities
```typescript
export interface DriverProfile {
  id: string;
  name: string;
  role: 'parent' | 'teen';
  phone: string;
  isPrimaryDriver: boolean;
}

export interface VehicleProfile {
  id: string;
  name: string;             // e.g., "Family SUV"
  make: string;
  model: string;
  year: string;
  licensePlate: string;
}

export interface StateInfo {
  code: string;
  name: string;
  requiredHours: number;
  requiredNightHours: number;
  requiresSpecificApp: boolean;
  appName?: string;
}
```

### Supported Driving Options & Skills
- **Weather Options:** Clear, Cloudy, Rain, Snow, Fog, Windy.
- **Road Types:** Residential, City/Urban, Highway/Freeway, Rural, Parking Lot.
- **Skills Tracked:** Starting/Stopping, Turning, Lane Changes, Highway Merging, Parallel Parking, Perpendicular Parking, Angle Parking, Backing Up, Three-Point Turn, Night Driving, Rain/Wet Roads, Highway Driving, City Driving, Rural Roads, Roundabouts.

---

## 5. 🏛️ State Requirements Database (All 50 US States)

DriveLog includes pre-configured requirement benchmarks for all 50 US states (`src/types/index.ts`):

| State | Required Total Hours | Required Night Hours | Notes |
| :--- | :---: | :---: | :--- |
| **California (CA)** | 50 | 10 | None |
| **Texas (TX)** | 30 | 10 | ITTD / State Handbook |
| **Florida (FL)** | 50 | 10 | None |
| **New York (NY)** | 50 | 15 | None |
| **Pennsylvania (PA)** | 65 | 10 | None |
| **Illinois (IL)** | 50 | 10 | None |
| **Ohio (OH)** | 50 | 10 | Optional state log |
| **Georgia (GA)** | 40 | 6 | None |
| **Virginia (VA)** | 45 | 15 | None |
| **Maryland (MD)** | 60 | 10 | None |
| **North Carolina (NC)** | 60 | 10 | None |
| **Kentucky (KY)** | 60 | 10 | None |
| **Maine (ME)** | 70 | 10 | Highest total requirement |
| ... *(All 50 states configured in `src/types/index.ts`)* | | | |

---

## 6. ⚙️ Core Technical Features & Business Logic

### A. Resilient Drive Timer (`useDriveTimer.ts` + `utils/db.ts`)
- Saves timer state (active status, elapsed seconds, start timestamp, pause offsets) to IndexedDB **every second**.
- **Crash Recovery:** If the phone battery dies, browser crashes, or app closes, reopening restores the exact active drive state and accounts for background elapsed time.

### B. Legal Night Calculation (`useNightDetection.ts` + `utils/suncalc.ts`)
- Uses `suncalc` with the user's location coordinates or state center to determine astronomical sunset.
- Applies state-specific rules (typically civil twilight + 30 minutes) to automatically categorize sessions as **Day** or **Night** — never fixed clock times.

### C. Client-Side DMV PDF Export (`utils/pdf.tsx` + `components/PdfExport.tsx`)
- Uses `@react-pdf/renderer` directly in the browser (lazy-loaded chunk) to build clean, vector-formatted log sheets.
- Includes mandatory DMV declaration blocks, teen name, permit number, supervisor signature fields, and entry-by-entry supervisor initials.
- Zero server backend required; completely private and fast.

### D. Auth & Monetization
- **Auth:** Supabase passwordless magic link (`lib/supabase.ts`, `contexts/AuthContext.tsx`); profiles stored in PostgreSQL with Row Level Security (`supabase/migrations/20260815_profiles_auth.sql`).
- **Stripe Lifetime Pro ($4.99 one-time):** `create-checkout-session` Edge Function creates checkout; `stripe-webhook` verifies signature and records entitlements (`20260815_monetization_schema.sql`). Entitlement state cached offline in IndexedDB so Pro features work without network.

### E. Offline PWA Infrastructure (`vite-plugin-pwa`)
- Workbox service worker strategies (`CacheFirst` for assets, `StaleWhileRevalidate` for app shell).
- Fully functional without an active cellular or Wi-Fi connection; installable on iOS Safari and Android Chrome.

---

## 7. 🎨 Design Language & User Experience

- **Primary Colors:** Deep Navy (`#0F172A`), Warm Slate (`#334155`), Accent Teal (`#0D9488`).
- **Typography:** Inter / system UI font stack, tabular mono numbers for timers.
- **Tone & Ergonomics:** High-contrast, large touch targets (≥64px primary action buttons), calm non-distracting UI designed to be operated safely inside a vehicle.
- **Motto:** "It's not complicated, it's just a log"

---

## 8. 🛠️ Development & Operational Commands

```bash
cd C:\Users\saval\drivelog-app

npm run dev        # Vite dev server → http://localhost:5173
npm run build      # Production build
npm run preview    # Preview production build locally
npm run lint       # ESLint on src/
npm run typecheck  # tsc --noEmit
npm run lint:fix   # ESLint auto-fix
```

Run `npm run typecheck && npm run lint` after every change.

## Conventions & Constraints

- **Offline-first:** never break functionality without network; all data writes go to IndexedDB first.
- **Strict TypeScript:** no `any` unless unavoidable.
- **Never log or expose** Supabase/Stripe keys (see `.env.example`).
- **Deploy target:** Vercel (`vercel.json`).

---
*Generated & maintained for **Ravi Savaliya** (DriveLog Project Lead)*
