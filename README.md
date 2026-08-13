# 🚗 DriveLog — Teen Driving Hours Tracker

> **PWA Progressive Web App | Offline-first | DMV-Ready PDF | Parent-Teen Friendly**

---

## 🎯 The Problem

US teens must log **40–60 supervised driving hours** before getting a license. Official apps like **RoadReady** are broken:
- **Crash** and lose all logged hours
- **Ads** every drive, no offline mode
- **No pause button** — stop for gas = start a new drive
- **No night detection** — uses sunset, not legal "30 mins after sunset"
- **No state-specific DMV PDF export**

## ✅ The Solution

**DriveLog** — a simple, offline-first, parent-friendly driving log app that works like a **website you install on your phone**. No ads, no subscriptions, no data loss.

**Key features:**
- **Timer** (Start/Pause/Resume/Stop) — works offline
- **Auto night detection** — calculates legal night hours per state
- **Multi-driver** — parents and teens log separately
- **50-state DMV PDF export** — printable, ready for DMV forms
- **PWA** — add to home screen, works without internet
- **Zero cost** — free for first 20 hours, then $4.99 lifetime

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React 18 + Vite + TypeScript + Tailwind CSS |
| **Storage** | `idb` (IndexedDB) — offline persistence |
| **PDF** | `@react-pdf/renderer` — client-side generation |
| **Time** | `SunCalc` (sunrise/sunset per state) |
| **Icons** | `lucide-react` |
| **PWA** | Vite PWA plugin + Workbox |
| **Deployment** | Vercel / Netlify |

---

## 🚀 Quick Start

```bash
# 1. Clone the project
git clone <your-repo-url>
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
│   ├── DriveTimer.tsx          # Start/Pause/Resume/Stop
│   ├── DriveLogEntry.tsx        # Single drive log entry
│   ├── MultiDriverForm.tsx      # Parent/teen selector
│   ├── StateSelector.tsx        # 50-state selector
│   ├── DriveSummary.tsx         # Day/night split display
│   └── PdfExport.tsx            # DMV PDF generation
├── hooks/
│   ├── useDriveTimer.ts         # Timer logic with IndexedDB persistence
│   ├── useDriveLog.ts           # CRUD for drive entries
│   └── useNightDetection.ts      # Sunset/sunrise calculations
├── pages/
│   ├── Home.tsx                 # Dashboard (today's hours)
│   ├── LogDrive.tsx             # Log a new drive session
│   ├── ExportDocs.tsx           # Export PDF to print
│   └── Settings.tsx             # App preferences
├── utils/
│   ├── sunCalc.ts               # State-based sunset/sunrise
│   ├── db.ts                    # IndexedDB wrapper
│   └── pdf.ts                   # PDF generation
├── public/
│   ├── manifest.json
│   └── sw.js                    # Service Worker
```

---

## 🎨 Design Language

- **Color:** Navy blue + warm white + accent teal (#0D9488)
- **Font:** Inter (system font stack)
- **Tone:** Clean, calm, trustworthy — no medical jargon
- **Mood:** "It's not complicated, it's just a log"

---

## 📝 License

MIT

---

*Built for parents who want to keep their teen driver safe — no ads, no bugs, no lost data.*
