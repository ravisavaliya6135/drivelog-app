# 🚗 DriveLog — Teen Driving Hours Tracker

> **PWA Progressive Web App | Offline-First | DMV-Ready PDF | Parent-Teen Friendly**

---

## 🎯 The Problem

US teens must log **40–60 supervised driving hours** before getting a license. Official apps like **RoadReady** are broken:
- **Crash** and lose all logged hours
- **Ads** every drive, no offline mode
- **No pause button** — stop for gas = start a new drive
- **No night detection** — uses sunset, not legal "30 mins after sunset"
- **No state-specific DMV PDF export**

## ✅ The Solution

**DriveLog** — a simple, offline-first, parent-friendly driving log app that works like a **native app you install on your phone**. No ads, no recurring subscriptions, no data loss.

**Key features:**
- **Distraction-Free Timer** (Start/Pause/Resume/Stop) — 100% offline
- **Auto Night Detection** — calculates legal twilight & sunset hours per state
- **Multi-Driver & Vehicles** — parents and teens log separately with vehicle tags
- **50-State DMV PDF Export** — printable, formatted for state DMV licensing requirements
- **PWA Installation** — install on iOS Safari and Android with offline caching
- **Fair Pricing** — free for first 20 hours, then $4.99 one-time Lifetime Pro

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite + TypeScript + Tailwind CSS |
| **Icons** | Lucide React |
| **Storage** | `idb` (IndexedDB) — 100% offline persistence |
| **Backend & Auth** | Supabase Auth (Passwordless Magic Link) + PostgreSQL RLS |
| **Payments** | Stripe Checkout ($4.99 one-time) + Server-side Webhook |
| **PDF** | `@react-pdf/renderer` (Lazy-loaded client-side generation) |
| **Solar Calc** | `SunCalc` (legal twilight/sunset per state coordinates) |
| **PWA** | Vite PWA Plugin + Workbox Service Worker |

---

## 🚀 Quick Start

```bash
# 1. Clone the project
git clone https://github.com/ravisavaliya6135/drivelog-app.git
cd drivelog-app

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
# → opens http://localhost:5173

# 4. Build for production
npm run build
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── DriveTimer.tsx          # High-contrast live driving clock & telemetry
│   ├── DriveLogEntry.tsx       # Celebratory save drive & condition selector
│   ├── MultiDriverForm.tsx     # Supervisor and vehicle manager
│   ├── StateSelector.tsx       # 50-state DMV target selector
│   ├── PwaInstallPrompt.tsx    # iOS 3-step & Android native install sheet
│   ├── AuthModal.tsx           # Passwordless magic-link sign-in dialog
│   └── UpgradeModal.tsx        # Lifetime Pro ($4.99) checkout modal
├── contexts/
│   ├── AuthContext.tsx         # Supabase Auth provider
│   └── EntitlementContext.tsx  # Free vs Lifetime Pro state & caching
├── hooks/
│   ├── useDriveLog.ts          # IndexedDB CRUD state
│   ├── useNightDetection.ts    # Legal night solar calculations
│   ├── usePwaInstall.ts        # beforeinstallprompt & standalone detection
│   ├── useSeo.ts               # Dynamic route metadata & canonical tags
│   └── useTheme.ts             # Light / Dark / System theme switcher
├── pages/
│   ├── Home.tsx                # Dashboard, hero progress & start drive CTA
│   ├── LogDrive.tsx            # Driving History hub with search & filters
│   ├── ExportDocs.tsx          # DMV PDF generator & compliance check
│   └── Settings.tsx            # Account, state goals, backup & appearance
├── utils/
│   ├── db.ts                   # IndexedDB database wrapper
│   ├── pdf.tsx                 # DMV PDF export layout (on-demand chunk)
│   └── sunCalc.ts              # State-based astronomical calculations
supabase/
├── functions/
│   ├── create-checkout-session # Secure Stripe checkout session creator
│   └── stripe-webhook          # Cryptographic Stripe webhook processor
└── migrations/
    ├── 20260815_profiles_auth.sql # Profiles schema with Row Level Security
    └── 20260815_monetization_schema.sql # Entitlements schema & triggers
```

---

## 🎨 Design Language

- **Color:** Deep Navy (`#0F172A`) + Warm Slate (`#334155`) + Accent Teal (`#0D9488`)
- **Font:** Inter (system font stack) + Tabular Mono numbers
- **Tone:** Clean, calm, trustworthy, high contrast for outdoor use
- **Mood:** "It's not complicated, it's just a log"

---

## 📝 License

MIT

---

*Built for parents and teen drivers — no ads, no recurring subscriptions, no lost data.*
