# DriveHours SEO Sprint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve qualified organic-search click potential through consistent DriveHours branding, enhanced CA/NC/OH state guides, and a prerendered night-driving-hours guide.

**Architecture:** A typed state-guide SEO module becomes the single metadata source for React and the post-build prerenderer. A new lazy-loaded, statically rendered guide uses the existing `US_STATES` data and internal links. Node built-in tests prove the route, metadata, public branding, schema cleanup, and static output contract.

**Tech Stack:** React 18, TypeScript strict mode, React Router, Vite 5, Tailwind CSS, Node built-in test runner, Vite SSR prerendering.

## Global Constraints

- Use `https://drivehours.app` for canonical, Open Graph, JSON-LD, sitemap, and robots URLs.
- Keep all public-facing product copy and generated filenames branded `DriveHours`.
- Do not rename `DriveLogDB`, `useDriveLog`, existing storage keys, analytics keys, or internal technical TypeScript identifiers.
- Use no CDN fetches or runtime network calls; all new public content must work offline.
- Keep TypeScript strict with zero `any`; add no dependency.
- Preserve the timer's one-second IndexedDB heartbeat and gate paid functionality at exactly `20.0` logged hours.
- Keep lazy-loaded routes, PWA behavior, client-side PDF lazy loading, and production performance intact.
- Meet WCAG AA contrast, use semantic headings and links, retain visible focus states, and make primary CTAs at least 64px tall.
- State-specific legal claims must be factual, linked to an official source when available, and tell users to verify current requirements.

---

## File structure

| Path | Responsibility |
| --- | --- |
| `src/content/stateGuideSeo.ts` | Typed default and CA/NC/OH state-guide SEO metadata and answer-first copy. |
| `src/pages/NightDrivingHoursGuide.tsx` | Accessible public guide rendering the existing state requirements table and internal state links. |
| `src/pages/StateGuide.tsx` | Consumes shared SEO content, displays priority-state detail, and retains only breadcrumb schema. |
| `src/pages/StateGuideIndex.tsx` | Promotes the nationwide night-hours guide from the state-guide hub. |
| `src/prerender/state-guide-ssr.tsx` | Adds the new public route to server rendering. |
| `src/App.tsx` | Adds a lazy public route for `/night-driving-hours`. |
| `scripts/prerender.mjs` | Uses shared metadata for static state guides, prerenders the new route, and writes it to sitemap output. |
| `index.html`, `public/llms.txt`, visible components | Applies the public DriveHours brand and removes FAQPage schema. |
| `tests/seo-sprint.test.mjs` | Verifies source and built SEO-sprint contracts. |

## Task 1: Establish shared state-guide SEO content and its source contract

**Files:**
- Create: `src/content/stateGuideSeo.ts`
- Modify: `src/pages/StateGuide.tsx:24-106`
- Modify: `scripts/prerender.mjs:105-107`
- Create: `tests/seo-sprint.test.mjs`

**Interfaces:**
- Consumes: `StateInfo` from `src/types/index.ts`.
- Produces: `getStateGuideSeo(state: StateInfo): StateGuideSeo`, where `StateGuideSeo` contains `title`, `description`, `intro`, and optional `details: readonly string[]`.
- Produces: `getStateGuideCanonical(state: StateInfo): string`, used by React and prerender code.
- Produces: re-exports of both functions from `src/prerender/state-guide-ssr.tsx`, so the CommonJS prerender script can obtain the compiled functions from `dist-ssr/state-guide-ssr.js`.

- [ ] **Step 1: Write the failing shared-SEO source test**

Create `tests/seo-sprint.test.mjs` with this harness and test:

```js
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = new URL('../', import.meta.url);
async function source(file) {
  return readFile(new URL(file, root), 'utf8');
}

test('state guide SEO has focused CA, NC, and OH copy and one shared source', async () => {
  const seo = await source('src/content/stateGuideSeo.ts');
  const guide = await source('src/pages/StateGuide.tsx');
  const prerender = await source('scripts/prerender.mjs');

  assert.match(seo, /California 50-Hour Driving Log: 10 Night Hours \| DriveHours/);
  assert.match(seo, /North Carolina 60-Hour Driving Log: 10 Night Hours \| DriveHours/);
  assert.match(seo, /Ohio 50-Hour Driving Log & BMV 5791 Affidavit \| DriveHours/);
  assert.match(guide, /getStateGuideSeo/);
  assert.match(prerender, /getStateGuideSeo/);
});
```

- [ ] **Step 2: Run the new test to verify it fails**

Run: `node --test tests/seo-sprint.test.mjs`

Expected: FAIL because `src/content/stateGuideSeo.ts` does not exist.

- [ ] **Step 3: Add the minimal typed SEO module**

Create `src/content/stateGuideSeo.ts` with this public shape:

```ts
import type { StateInfo } from '../types';

const SITE_URL = 'https://drivehours.app';

export interface StateGuideSeo {
  title: string;
  description: string;
  intro: string;
  details?: readonly string[];
}

export function getStateGuideCanonical(state: StateInfo): string {
  return SITE_URL + '/dmv/' + state.code.toLowerCase();
}

export function getStateGuideSeo(state: StateInfo): StateGuideSeo {
  // Return a safe state-name default, then override CA, NC, and OH by code.
}
```

Use these exact override titles and answer-first intros:

| State | Title | Intro |
| --- | --- | --- |
| CA | `California 50-Hour Driving Log: 10 Night Hours \| DriveHours` | California teen drivers need 50 hours of supervised practice, including 10 hours at night, before the driving test. |
| NC | `North Carolina 60-Hour Driving Log: 10 Night Hours \| DriveHours` | North Carolina teen drivers need a 60-hour driving log, including 10 nighttime hours, before moving to the next license level. |
| OH | `Ohio 50-Hour Driving Log & BMV 5791 Affidavit \| DriveHours` | Ohio teen drivers need 50 hours of driving, including 10 at night, and a completed BMV 5791 affidavit for the driving test. |

The CA, NC, and OH descriptions must respectively mention 50/10, 60/10 with digital or printed log, and 50/10 with BMV 5791. Do not introduce an unverified universal definition of night driving.

- [ ] **Step 4: Consume the shared metadata in React and prerender code**

In `StateGuide.tsx`, import the two functions and derive a `seo` object and canonical string before calling `useSeo`. Render `seo.intro` as the opening paragraph and render `seo.details` only when it exists.

In `src/prerender/state-guide-ssr.tsx`, re-export `getStateGuideSeo` and `getStateGuideCanonical`. In `scripts/prerender.mjs`, destructure those two compiled exports from `require(join(ssrDir, 'state-guide-ssr.js'))`. Replace local title, description, and canonical construction with the shared functions so prerendered state HTML exactly matches the client metadata.

- [ ] **Step 5: Run focused checks**

Run: `node --test tests/seo-sprint.test.mjs && npm run typecheck && npm run lint`

Expected: PASS.

- [ ] **Step 6: Commit the shared SEO contract**

```bash
git add tests/seo-sprint.test.mjs src/content/stateGuideSeo.ts src/pages/StateGuide.tsx scripts/prerender.mjs
git commit -m "feat: centralize state guide SEO copy"
```

## Task 2: Add the prerendered nationwide night-hours guide

**Files:**
- Create: `src/pages/NightDrivingHoursGuide.tsx`
- Modify: `src/App.tsx:12-21, 204-214`
- Modify: `src/prerender/state-guide-ssr.tsx:1-37`
- Modify: `scripts/prerender.mjs:47-55, 139-143`
- Modify: `src/pages/StateGuideIndex.tsx:1-65`
- Modify: `tests/seo-sprint.test.mjs`

**Interfaces:**
- Consumes: `US_STATES`, `StateInfo`, `useSeo`, and React Router `Link`.
- Produces: `NightDrivingHoursGuide` React component at `/night-driving-hours`.
- Produces: `dist/night-driving-hours/index.html` and exactly one sitemap entry.

- [ ] **Step 1: Write failing route and static-output tests**

Append:

```js
test('night-hours guide is routed, prerendered, and placed in the sitemap', async () => {
  const app = await source('src/App.tsx');
  const ssr = await source('src/prerender/state-guide-ssr.tsx');
  const prerender = await source('scripts/prerender.mjs');

  assert.match(app, /path="\\/night-driving-hours"/);
  assert.match(ssr, /NightDrivingHoursGuide/);
  assert.match(prerender, /How Many Night Driving Hours Are Required\\? \| DriveHours/);
});

test('built night-hours guide has static metadata and no FAQPage schema', () => {
  const page = fs.readFileSync(path.resolve('dist/night-driving-hours/index.html'), 'utf8');
  assert.match(page, /<link rel="canonical" href="https:\\/\\/drivehours\\.app\\/night-driving-hours"/);
  assert.match(page, /How Many Night Driving Hours Are Required\\? \| DriveHours/);
  assert.doesNotMatch(page, /"@type":"FAQPage"/);
});
```

- [ ] **Step 2: Run the source test to verify it fails**

Run: `node --test tests/seo-sprint.test.mjs`

Expected: FAIL because the component and route do not exist.

- [ ] **Step 3: Build the accessible guide component**

Create `NightDrivingHoursGuide.tsx` with:

- `useSeo` title `How Many Night Driving Hours Are Required? | DriveHours` and canonical `https://drivehours.app/night-driving-hours`.
- One `h1`, answer-first opening text, and a visible instruction to verify requirements with the official DMV.
- An accessible table with `scope="col"` headers for State, Total supervised hours, Night hours, and Guide. Each guide link goes to the state’s existing lowercase route.
- A CTA linking to `/` with the exact text `Start Logging for Free` and an `h-16` minimum touch target.
- Existing teal/slate design tokens only; no external calls or dependencies.

- [ ] **Step 4: Route and prerender the guide**

Add a lazy `NightDrivingHoursGuide` import and a public route in `App.tsx`. Add the same route to `renderPublicPage` in the SSR entry. Add the exact title/description tuple to `publicPages`, and add `/night-driving-hours` to `staticPaths` so the post-build script writes static HTML and a sitemap entry.

In `StateGuideIndex`, add a prominent internal link beneath the introduction with the text: `See night driving-hour requirements for every state`.

- [ ] **Step 5: Run source, type, and build checks**

Run: `node --test tests/seo-sprint.test.mjs && npm run typecheck && npm run lint && npm run build`

Expected: PASS and `dist/night-driving-hours/index.html` exists.

- [ ] **Step 6: Commit the guide**

```bash
git add tests/seo-sprint.test.mjs src/pages/NightDrivingHoursGuide.tsx src/App.tsx src/prerender/state-guide-ssr.tsx scripts/prerender.mjs src/pages/StateGuideIndex.tsx
git commit -m "feat: add night driving hours guide"
```

## Task 3: Remove non-priority FAQPage markup and deliver the public DriveHours brand

**Files:**
- Modify: `index.html:8-140`
- Modify: `src/pages/StateGuide.tsx:66-130`
- Modify: `public/llms.txt:1-66`
- Modify: `src/components/SiteFooter.tsx:45-48`
- Modify: `src/components/PwaInstallPrompt.tsx:31-122`
- Modify: `src/components/PdfExport.tsx:67`
- Modify: `src/pages/HelpCenter.tsx:34-168`
- Modify: `src/pages/ContactFeedback.tsx:21-24`
- Modify: `tests/seo-sprint.test.mjs`

**Interfaces:**
- Consumes: existing public strings and head metadata.
- Produces: consistent DriveHours public naming without changing storage identifiers or technical symbols.

- [ ] **Step 1: Write failing branding and schema tests**

Append:

```js
test('crawler-facing files use DriveHours and avoid FAQPage markup', async () => {
  const indexHtml = await source('index.html');
  const llms = await source('public/llms.txt');
  const guide = await source('src/pages/StateGuide.tsx');

  assert.match(indexHtml, /<title>DriveHours — Supervised Teen Driving Hours Tracker & DMV Log<\\/title>/);
  assert.match(indexHtml, /"name": "DriveHours — Teen Driving Hours Tracker"/);
  assert.doesNotMatch(indexHtml, /"@type": "FAQPage"/);
  assert.doesNotMatch(guide, /'@type': 'FAQPage'/);
  assert.match(llms, /^# DriveHours — Teen Driving Hours Tracker/m);
});

test('public component copy no longer calls the product DriveLog', async () => {
  const files = [
    'src/components/SiteFooter.tsx',
    'src/components/PwaInstallPrompt.tsx',
    'src/components/PdfExport.tsx',
    'src/pages/HelpCenter.tsx',
    'src/pages/ContactFeedback.tsx',
  ];
  for (const file of files) assert.doesNotMatch(await source(file), /DriveLog/);
});
```

- [ ] **Step 2: Run the branding test to verify it fails**

Run: `node --test tests/seo-sprint.test.mjs`

Expected: FAIL because public source still contains `DriveLog` and FAQPage scripts.

- [ ] **Step 3: Apply public-name replacements safely**

Replace visible product copy, SEO metadata, structured-data names, app-install labels, user-visible download filenames, `llms.txt`, Help Center copy, and footer copy with `DriveHours`.

Do not change occurrences in `src/utils/db.ts`, `src/hooks/useDriveLog.ts`, `src/hooks/useDriveTimer.ts`, `src/contexts/EntitlementContext.tsx`, `src/utils/analytics.ts`, `src/utils/feedback.ts`, or internal TypeScript component/function names.

- [ ] **Step 4: Remove FAQPage markup without disturbing useful schema**

Delete the FAQPage JSON-LD script from `index.html`. Delete the `faqSchema` object and its script tag from `StateGuide.tsx`. Retain WebApplication schema in `index.html` and BreadcrumbList schema in `StateGuide.tsx`; update only their public name/copy where required.

- [ ] **Step 5: Run the focused test suite**

Run: `node --test tests/seo-sprint.test.mjs tests/canonical-domain.test.mjs tests/ui-accessibility.test.mjs`

Expected: PASS.

- [ ] **Step 6: Commit the brand and schema cleanup**

```bash
git add index.html public/llms.txt src/pages/StateGuide.tsx src/components/SiteFooter.tsx src/components/PwaInstallPrompt.tsx src/components/PdfExport.tsx src/pages/HelpCenter.tsx src/pages/ContactFeedback.tsx tests/seo-sprint.test.mjs
git commit -m "fix: standardize public DriveHours branding"
```

## Task 4: Verify generated artifacts and deliver the sprint

**Files:**
- Modify: `tests/seo-sprint.test.mjs`
- Verify: `dist/night-driving-hours/index.html`, `dist/dmv/ca/index.html`, `dist/dmv/nc/index.html`, `dist/dmv/oh/index.html`, `dist/sitemap.xml`

**Interfaces:**
- Consumes: all source changes from Tasks 1–3 and `npm run build` output.
- Produces: reproducible production checks for sitemap, prerendered metadata, and the no-FAQPage contract.

- [ ] **Step 1: Add built-output metadata assertions**

Append a test that loops over:

```js
const pages = [
  ['dist/dmv/ca/index.html', 'California 50-Hour Driving Log: 10 Night Hours | DriveHours', 'ca'],
  ['dist/dmv/nc/index.html', 'North Carolina 60-Hour Driving Log: 10 Night Hours | DriveHours', 'nc'],
  ['dist/dmv/oh/index.html', 'Ohio 50-Hour Driving Log & BMV 5791 Affidavit | DriveHours', 'oh'],
];
```

For each page, assert the title, canonical `https://drivehours.app/dmv/` plus the code, and no FAQPage. Read `dist/sitemap.xml` and assert one occurrence of `https://drivehours.app/night-driving-hours`.

- [ ] **Step 2: Run the test before rebuilding to establish the expected failure**

Run: `node --test tests/seo-sprint.test.mjs`

Expected: FAIL until the production build is regenerated with the completed source changes.

- [ ] **Step 3: Build and execute all required checks**

Run:

```bash
npm run typecheck
npm run lint
npm run build
node --test tests/seo-sprint.test.mjs tests/production-build-integrity.test.mjs tests/canonical-domain.test.mjs tests/ui-accessibility.test.mjs
git diff --check
git status --short
```

Expected: every command passes; generated guide and the three prioritized state pages contain static metadata; no unexpected files are staged.

- [ ] **Step 4: Commit verification coverage**

```bash
git add tests/seo-sprint.test.mjs
git commit -m "test: verify SEO sprint build output"
```
