# DriveHours Domain Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redirect the legacy Vercel hostname to DriveHours and verify all production URL references use `https://drivehours.app`.

**Architecture:** The production URL is already the canonical source in static SEO artifacts and route metadata. A single, host-scoped Vercel redirect will preserve incoming paths from `drivelog-app.vercel.app`, sending them to `https://drivehours.app` with a 301 without affecting requests already on the custom domain.

**Tech Stack:** Vercel project configuration, React 18, TypeScript, Vite 5, npm scripts.

## Global Constraints

- Preserve all existing offline-first behavior and do not introduce network dependencies.
- The redirect must target only `drivelog-app.vercel.app` and preserve its request path.
- Use explicit HTTP 301 status, not Vercel's default permanent 308.
- All public production URLs must use exactly `https://drivehours.app`.
- Run `npm run typecheck`, `npm run lint`, and `npm run build` before committing.

---

## File Structure

- Modify: `vercel.json` — Vercel routing rules; add the legacy-host redirect before rewrites.
- Inspect: `src/hooks/useSeo.ts`, `src/pages/StateGuide.tsx`, `index.html`, `public/robots.txt`, `public/sitemap.xml` — canonical production URLs.

### Task 1: Add and verify the legacy-domain redirect

**Files:**
- Modify: `vercel.json`
- Test: `vercel.json` parsed with Node's JSON parser

**Interfaces:**
- Consumes: requests whose `Host` value matches `drivelog-app.vercel.app`.
- Produces: `301 Location: https://drivehours.app/<requested-path>` routing behavior at Vercel's edge.

- [ ] **Step 1: Verify the configuration lacks the required redirect**

Run:

```powershell
node -e "const c=require('./vercel.json'); if ((c.redirects ?? []).some(r => r.has?.some(h => h.type === 'host' && h.value === 'drivelog-app\\\\.vercel\\\\.app') && r.statusCode === 301)) process.exit(1)"
```

Expected: Exit code `0`, confirming the redirect is not yet configured.

- [ ] **Step 2: Add the minimal redirect configuration**

Insert this top-level property before `rewrites` in `vercel.json`:

```json
"redirects": [
  {
    "source": "/:path*",
    "has": [
      {
        "type": "host",
        "value": "drivelog-app\\.vercel\\.app"
      }
    ],
    "destination": "https://drivehours.app/:path*",
    "statusCode": 301
  }
]
```

- [ ] **Step 3: Validate the redirect configuration**

Run:

```powershell
node -e "const c=require('./vercel.json'); const r=c.redirects?.[0]; if (!r || r.source !== '/:path*' || r.destination !== 'https://drivehours.app/:path*' || r.statusCode !== 301 || r.has?.[0]?.type !== 'host' || r.has?.[0]?.value !== 'drivelog-app\\.vercel\\.app') process.exit(1)"
```

Expected: Exit code `0`.

### Task 2: Audit public production URL references and verify the application

**Files:**
- Inspect: `src/hooks/useSeo.ts`
- Inspect: `src/pages/StateGuide.tsx`
- Inspect: `index.html`
- Inspect: `public/robots.txt`
- Inspect: `public/sitemap.xml`

**Interfaces:**
- Consumes: repository source, configuration, and static public assets.
- Produces: a verified build with no legacy-domain references.

- [ ] **Step 1: Scan for legacy domains**

Run:

```powershell
rg -n -i --glob '!node_modules' --glob '!dist' 'drivelog\.app|drivelog-app\.vercel\.app' .
```

Expected: The only match is the intentionally configured host condition in `vercel.json` and the documentation that describes it.

- [ ] **Step 2: Confirm the required static files contain DriveHours URLs**

Run:

```powershell
rg -n 'https://drivehours\.app' src/hooks/useSeo.ts src/pages/StateGuide.tsx index.html public/robots.txt public/sitemap.xml
```

Expected: Each file reports its canonical, social, structured-data, robots, or sitemap DriveHours URL.

- [ ] **Step 3: Run static checks and production build**

Run:

```powershell
npm run typecheck
npm run lint
npm run build
```

Expected: All three commands exit with code `0`.

- [ ] **Step 4: Commit and push the requested cleanup**

Run:

```powershell
git add .
git commit -m "chore: production domain cleanup for drivehours.app"
git push origin master
```

Expected: The commit is created on `master` and the remote accepts the push.
