# Static Sitemap Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve crawler-facing static files directly on Vercel and publish all 60 sitemap routes from both source and build output.

**Architecture:** The source sitemap lists the canonical static and state-guide URLs. The Vercel SPA fallback only handles extensionless paths, which leaves filename requests to static output. The existing prerender step continues to generate an identical 60-URL sitemap in `dist`.

**Tech Stack:** Vercel project configuration, static XML/text, Vite build, Node assertions.

## Global Constraints

- `public/sitemap.xml` must be valid XML with 10 static routes plus all 50 `/dmv/:stateCode` routes.
- `public/robots.txt` must include `Sitemap: https://drivehours.app/sitemap.xml`.
- Static filename requests must not be rewritten to `index.html`.
- `npm run build` must produce raw XML at `dist/sitemap.xml` with 60 URLs.
- Commit exactly `fix: static route exception for sitemap.xml and robots.txt in vercel.json` and push `master`.

---

## File Structure

- Modify: `public/sitemap.xml` — canonical crawler sitemap source.
- Inspect: `public/robots.txt` — sitemap directive.
- Modify: `vercel.json` — extensionless SPA rewrite fallback.

### Task 1: Publish static crawler files without SPA rewriting

**Files:**
- Modify: `public/sitemap.xml`
- Modify: `vercel.json`
- Inspect: `public/robots.txt`
- Test: built `dist/sitemap.xml` and configuration assertions

**Interfaces:**
- Consumes: 50 two-letter state codes and static route paths.
- Produces: 60 canonical sitemap URLs and static-file-safe Vercel routing.

- [ ] **Step 1: Confirm the current sitemap omission and broad fallback**

Run:

```powershell
node -e "const x=require('fs').readFileSync('public/sitemap.xml','utf8'); if ((x.match(/<loc>/g) ?? []).length >= 60) process.exit(1)"
```

Expected: Exit code `0`.

- [ ] **Step 2: Add all canonical sitemap URLs and restrict the SPA fallback**

Make `public/sitemap.xml` list the ten static routes and one lowercase `/dmv/<code>` route for each of the 50 states. Replace the broad Vercel catch-all with an extensionless-path matcher that routes only SPA paths to `/index.html`.

- [ ] **Step 3: Assert static routing and source sitemap contents**

Run a Node assertion that confirms `vercel.json` has an extension-excluding fallback, `robots.txt` points to the canonical sitemap URL, the source sitemap begins with `<?xml`, contains 60 `<loc>` tags, and includes all 50 `/dmv/<code>` URLs.

- [ ] **Step 4: Build and assert the generated sitemap**

Run:

```powershell
npm run build
```

Then confirm `dist/sitemap.xml` exists, begins with `<?xml`, and contains 60 `<loc>` tags.

- [ ] **Step 5: Commit and push**

Run:

```powershell
git add .
git commit -m "fix: static route exception for sitemap.xml and robots.txt in vercel.json"
git push origin master
```
