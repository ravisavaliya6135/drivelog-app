# 🚗 DriveLog — Comprehensive Project & Technical Context

> **PWA Progressive Web App | Offline-first | DMV-Ready PDF | Parent-Teen Friendly**
> **Location on Host:** `C:\Users\saval\drivelog-app`

---

## 1. 🎯 Executive Summary & Value Proposition

### The Problem
In the United States, teenagers in nearly every state must log **40 to 60 supervised driving hours** (including 10–15 night hours) with a licensed adult before taking their road test for a provisional driver's license. 

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
- ⏱️ **Resilient Drive Timer:** Start, pause, resume, and stop with automatic background state persistence in IndexedDB.
- 🌅 **Legal Night Detection:** Real-time calculation using `SunCalc` to determine exact sunset/sunrise times based on geographic state rules.
- 👥 **Multi-Driver & Multi-Vehicle:** Separate tracking for teens, supervising parents, and family vehicles.
- 📄 **50-State DMV PDF Export:** Client-side vector PDF generation matching official DMV requirements with supervisor sign-off spaces.
- 📱 **Installable PWA:** Installs on iOS and Android home screens without app store downloads or network requirements.
- 💰 **Freemium Pricing Model:** Free for the first 20 logged hours; one-time $4.99 lifetime unlock thereafter.

---

## 2. 🛠️ Complete Technical Stack

| Layer | Technology / Library | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `^18.3.1` | UI Component architecture |
| **Build System** | Vite + `@vitejs/plugin-react-swc` | `^5.4.10` / `^3.7.0` | Ultra-fast HMR and SWC compilation |
| **Language** | TypeScript | `^5.6.2` | Strict type safety across state and UI |
| **Styling** | Tailwind CSS + Autoprefixer + PostCSS | `^3.4.0` | Utility-first responsive design |
| **Icons** | Lucide React | `^0.452.0` | Accessible SVG icon suite |
| **Local Database** | `idb` (IndexedDB Wrapper) | `^8.0.0` | High-performance offline storage |
| **PDF Generation** | `@react-pdf/renderer` | `^3.4.0` | Client-side vector PDF rendering |
| **Solar Calculations** | `suncalc` | `^1.9.0` | Astronomical calculations for legal day/night determination |
| **PWA & Caching** | `vite-plugin-pwa` | `^0.20.5` | Workbox service workers and web manifest generation |
| **Routing** | `react-router-dom` | `^6.27.0` | Single-Page Application client routing |

---

## 3. 📁 File Architecture & Directory Mapping

```
C:\Users\saval\drivelog-app/
├── public/
│   ├── manifest.json              # Web app manifest for PWA installation
│   └── sw.js                      # Service worker for offline caching
├── src/
│   ├── components/
│   │   ├── DriveTimer.tsx          # Real-time active session timer (Start/Pause/Resume/Stop)
│   │   ├── DriveLogEntry.tsx        # Individual drive entry card view
│   │   ├── MultiDriverForm.tsx      # Driver & vehicle selector / editor
│   │   ├── StateSelector.tsx        # 50-state selection dropdown with rules display
│   │   ├── DriveSummary.tsx         # Total progress, Day vs. Night hour progress bars
│   │   └── PdfExport.tsx            # Printable DMV PDF preview & download component
│   ├── hooks/
│   │   ├── useDriveTimer.ts         # Persistent timer hook backed by IndexedDB
│   │   ├── useDriveLog.ts           # CRUD operations hook for driving entries
│   │   ├── useNightDetection.ts      # Automated day/night calculation hook
│   │   ├── useOnlineStatus.ts       # Network connectivity listener
│   │   └── useTheme.tsx             # UI theme provider
│   ├── pages/
│   │   ├── Home.tsx                 # Dashboard view (Quick start, active hours, recent drives)
│   │   ├── LogDrive.tsx             # Manual drive entry & active timer page
│   │   ├── ExportDocs.tsx           # DMV PDF document export and preview page
│   │   └── Settings.tsx             # State settings, driver profiles, vehicle profiles
│   ├── utils/
│   │   ├── db.ts                    # IndexedDB schema initialization & transaction logic
│   │   ├── pdf.ts                   # @react-pdf document styling & layout definitions
│   │   └── suncalc.ts               # Solar calculations for state-specific night thresholds
│   ├── types/
│   │   └── index.ts                 # Full TypeScript interfaces & constants
│   ├── App.tsx                      # Root component with router & navigation shell
│   ├── main.tsx                     # Entry point rendering React DOM
│   ├── index.css                    # Global Tailwind CSS imports & custom styles
│   └── index.tsx                    # Service worker registration
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
├── tailwind.config.js               # Tailwind custom color palette & styling config
├── vite.config.ts                   # Vite bundler & PWA plugin settings
└── README.md                        # High-level overview
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
  dayNight: 'day' | 'night';  // Legal classification
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

DriveLog includes pre-configured requirement benchmarks for all 50 US states:

| State | Required Total Hours | Required Night Hours | Special DMV App Mandate |
| :--- | :---: | :---: | :--- |
| **California (CA)** | 50 | 10 | None |
| **Texas (TX)** | 30 | 10 | Requires ITTD / State Handbook |
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

### A. Resilient Drive Timer (`useDriveTimer.ts` & `db.ts`)
- Leverages IndexedDB (`idb`) to save timer state (active status, elapsed seconds, start timestamp, pause offsets) every second.
- **Crash Recovery:** If the phone battery dies, browser crashes, or the app is closed, opening the app restores the exact active drive state and accounts for background elapsed time.

### B. Legal Night Calculation (`useNightDetection.ts` & `suncalc.ts`)
- Standard apps use static time (e.g., 7:00 PM). DriveLog uses `suncalc` with the user's location coordinates or state center to determine astronomical sunset.
- Applies state-specific rules (typically civil twilight + 30 minutes) to automatically categorize driving sessions into **Day** or **Night**.

### C. Client-Side DMV PDF Export (`pdf.ts` & `PdfExport.tsx`)
- Uses `@react-pdf/renderer` directly in the browser to build clean, vector-formatted log sheets.
- Includes mandatory DMV declaration blocks, teen name, permit number, supervisor signature fields, and entry-by-entry supervisor initials.
- Zero server backend required; completely private and fast.

### D. Offline PWA Infrastructure (`vite-plugin-pwa`)
- Caches all static assets (JS, CSS, HTML, Web Fonts) via Workbox service worker strategies (`CacheFirst` for assets, `StaleWhileRevalidate` for application state).
- Fully functional without an active cellular or Wi-Fi connection.

---

## 7. 🎨 Design Language & User Experience

- **Primary Colors:** Deep Navy (`#0F172A`), Warm Slate (`#334155`), Accent Teal (`#0D9488`).
- **Typography:** Inter / System UI font stack for optimal legibility while driving or viewing outdoors.
- **Tone & Ergonomics:** High-contrast, large touch targets (64px minimum for primary action buttons), calm non-distracting UI designed to be operated safely inside a vehicle.

---

## 8. 🛠️ Development & Operational Commands

```bash
# Navigate to project directory
cd C:\Users\saval\drivelog-app

# Install dependencies
npm install

# Run Vite local development server
npm run dev

# Build production bundle with TypeScript check
npm run build

# Preview production build locally
npm run preview
```

---

## 9. 📈 Maintenance History & Resolved Issues

- **TypeScript SWC Fixes:** Resolved build issues with SWC integration and type definitions for `@react-pdf/renderer`.
- **Diagnostic Isolation:** Environment tested and verified under Node / Vite runtime; resolved white-screen issues related to script paths and missing IndexedDB fallbacks.
- **FCC / Claude Integration:** Configured for automated development tasks using isolated Free Claude Code executions.

---
*Generated & maintained for **Ravi Savaliya** (DriveLog Project Lead)*
