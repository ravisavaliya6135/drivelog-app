# GSC Content Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish three connected, prerendered DriveHours guides that answer the Search Console demand for supervised-driving logs and improve the CA, NC, and OH reader journey.

**Architecture:** Keep each guide as a focused React article page using `useSeo` and factual BreadcrumbList JSON-LD. The existing post-build renderer will render the two new routes and refreshed night-hours guide into static HTML, while priority state guides expose descriptive links into the national content cluster.

**Tech Stack:** React 18, TypeScript strict mode, React Router, Tailwind CSS, Lucide React, Vite SSR prerender, Node test runner.

## Global Constraints

- Use `https://drivehours.app` for canonical, Open Graph, structured-data, and sitemap URLs.
- Use the `blog` skill’s purpose-first structure, source discipline, useful internal linking, and reader-first quality standards; do not fabricate statistics or legal requirements.
- State DMV/licensing agencies remain the source of truth; state rules can change.
- Do not claim DriveHours is an official DMV form, a licensing authority, or guaranteed to be accepted.
- No runtime network requests, new dependencies, timer changes, authentication changes, or PWA behavior changes.
- Preserve strict TypeScript, WCAG-AA contrast, meaningful heading order, and 64px primary CTA targets.
- Do not add FAQPage markup as a rich-result tactic.

---

### Task 1: Create the evidence-backed content brief

**Files:**
- Create: `docs/seo/2026-09-13-gsc-content-brief.md`
- Read: `C:/Users/saval/Downloads/https___drivehours.app_-Performance-on-Search-2026-09-13.xlsx`
- Read: `src/content/stateGuideSeo.ts`
- Read: `src/types/index.ts`

**Interfaces:**
- Consumes: the user-provided GSC export and the existing `US_STATES`/`StateGuideSeo` facts.
- Produces: a factual source-and-copy brief used by Tasks 2–4; it does not add runtime application behavior.

- [ ] **Step 1: Record the observed query and page evidence**

Create a short table with the relevant GSC themes and their intent:

```markdown
| Query theme | Evidence | Reader intent | Planned route |
| --- | --- | --- | --- |
| Night supervised-driving hours | Top impression query asks how many supervised hours must be at night | Learn state-dependent night-hour target | `/night-driving-hours` |
| 50-hour / permit driving log | Queries include `dmv 50 hour log sheet` and `drivers permit hours log` | Complete a usable practice record | `/50-hour-driving-log` |
| DMV verification | Query asks whether the DMV knows a teen drove 50 hours | Understand documentation and state review expectations | `/does-dmv-check-driving-hours` |
```

- [ ] **Step 2: Collect only primary-source rules needed for state-specific copy**

Use the existing official CA, NC, and OH URLs in `src/content/stateGuideSeo.ts`. Record each title, URL, retrieval date, the specific requirement it supports, and whether it is already represented by local `US_STATES` data. Do not add a claim to a public guide unless the source record supports it.

- [ ] **Step 3: Write answer-first copy constraints for every guide**

Document these required facts and exclusions:

```markdown
- `/50-hour-driving-log`: 50 hours is common but not universal; direct the reader to their state guide.
- `/does-dmv-check-driving-hours`: requirements and review practices vary by state; use no claim about how an individual DMV enforces records.
- `/night-driving-hours`: retain the state-by-state table; no fixed national clock time defines night driving.
- Every guide: DriveHours organizes a practice record and does not replace official state instructions.
```

- [ ] **Step 4: Review the brief with the blog-quality checklist**

Confirm every factual statement is either (a) sourced to an official agency, (b) derived from local `US_STATES` data already tied to the relevant state guide, or (c) a non-factual explanation of how to keep a record. Remove any unsupported claim, statistic, or legal conclusion.

- [ ] **Step 5: Commit the brief**

```bash
git add docs/seo/2026-09-13-gsc-content-brief.md
git commit -m "docs: brief GSC-driven guide content"
```

### Task 2: Add failing route, prerender, and content-contract tests

**Files:**
- Create: `tests/gsc-content-expansion.test.mjs`
- Read: `tests/seo-sprint.test.mjs`
- Read: `src/App.tsx`
- Read: `src/prerender/state-guide-ssr.tsx`
- Read: `scripts/prerender.mjs`

**Interfaces:**
- Consumes: source-file layout and post-build `dist` structure.
- Produces: static-source and built-output checks that Tasks 3–5 must satisfy.

- [ ] **Step 1: Write the failing test**

Create `tests/gsc-content-expansion.test.mjs` with checks for the two new routes, the refreshed national cluster, prerender registration, and the priority state-link contract:

```js
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const guideRoutes = [
  ['/50-hour-driving-log', '50-Hour Driving Log: How to Track Supervised Practice | DriveHours'],
  ['/does-dmv-check-driving-hours', 'Does the DMV Check Your Driving Hours? | DriveHours'],
  ['/night-driving-hours', 'How Many Night Driving Hours Are Required? | DriveHours'],
];

async function source(file) {
  return readFile(new URL(file, root), 'utf8');
}

test('GSC content cluster is routed and rendered before JavaScript', async () => {
  const [app, ssr, prerender] = await Promise.all([
    source('src/App.tsx'),
    source('src/prerender/state-guide-ssr.tsx'),
    source('scripts/prerender.mjs'),
  ]);

  for (const [route, title] of guideRoutes) {
    assert.match(app, new RegExp(`path="${route}"`));
    assert.match(prerender, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(ssr, /FiftyHourDrivingLogGuide/);
  assert.match(ssr, /DmvDrivingHoursVerificationGuide/);
});

test('priority state guides expose useful national-guide links', async () => {
  const guide = await source('src/pages/StateGuide.tsx');

  assert.match(guide, /priorityContentStateCodes/);
  assert.match(guide, /to="\/50-hour-driving-log"/);
  assert.match(guide, /to="\/does-dmv-check-driving-hours"/);
  assert.match(guide, /to="\/night-driving-hours"/);
});

test('built GSC guide pages have static metadata and no FAQPage schema', () => {
  for (const [route, title] of guideRoutes) {
    const html = fs.readFileSync(path.resolve(`dist${route}/index.html`), 'utf8');
    assert.match(html, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(html, new RegExp(`<link rel="canonical" href="https://drivehours\\.app${route}"`));
    assert.doesNotMatch(html, /"@type":"FAQPage"/);
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/gsc-content-expansion.test.mjs`

Expected: FAIL because the two page modules, routes, SSR routes, prerender metadata, and state links do not exist yet.

- [ ] **Step 3: Keep the test scoped to public, reader-facing content**

Do not assert copy that is unrelated to the approved three-guide cluster. The test must not read internal storage keys, timer code, payments, or auth code.

- [ ] **Step 4: Commit the red test**

```bash
git add tests/gsc-content-expansion.test.mjs
git commit -m "test: define GSC content cluster contract"
```

### Task 3: Build the two new answer-first national guides and refresh the night-hours guide

**Files:**
- Create: `src/pages/FiftyHourDrivingLogGuide.tsx`
- Create: `src/pages/DmvDrivingHoursVerificationGuide.tsx`
- Modify: `src/pages/NightDrivingHoursGuide.tsx`

**Interfaces:**
- Consumes: Task 1 evidence brief; `Link` from `react-router-dom`; `useSeo`; existing `app-card` Tailwind classes; `CheckCircle2`, `FileText`, `Moon`, and `ArrowLeft` icons.
- Produces: named React exports `FiftyHourDrivingLogGuide` and `DmvDrivingHoursVerificationGuide`, each safe for SSR via `renderToString` and each with an explicit `https://drivehours.app/<route>` canonical URL.

- [ ] **Step 1: Implement the 50-hour-driving-log guide**

Create `FiftyHourDrivingLogGuide.tsx` with this component shape:

```tsx
export function FiftyHourDrivingLogGuide() {
  useSeo({
    title: '50-Hour Driving Log: How to Track Supervised Practice | DriveHours',
    description: 'Learn what to record in a supervised driving log, how to track day and night practice, and where to check your state’s required hours.',
    canonicalUrl: 'https://drivehours.app/50-hour-driving-log',
  });

  return (
    <article className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* BreadcrumbList JSON-LD, one H1, answer-first introduction, useful record checklist, state-variation notice, related-guide links, one CTA */}
    </article>
  );
}
```

The visible opening must say that a 50-hour log is a record of supervised practice and that the required total differs by state. Include a concise table or checklist for date, start/end time, duration, supervising adult, day/night classification, notes, and signatures when a state requires them. Link to `/dmv`, `/night-driving-hours`, and `/does-dmv-check-driving-hours` with descriptive text.

- [ ] **Step 2: Implement the DMV-verification guide**

Create `DmvDrivingHoursVerificationGuide.tsx` with this component shape:

```tsx
export function DmvDrivingHoursVerificationGuide() {
  useSeo({
    title: 'Does the DMV Check Your Driving Hours? | DriveHours',
    description: 'Understand how to prepare a clear supervised-practice record, when signatures or affidavits may be needed, and why you should check your state’s rules.',
    canonicalUrl: 'https://drivehours.app/does-dmv-check-driving-hours',
  });

  return (
    <article className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* BreadcrumbList JSON-LD, one H1, state-variation notice, preparation steps, related-guide links, one CTA */}
    </article>
  );
}
```

State clearly that review and documentation requirements differ by state. Explain how to prepare a complete, legible log and direct users to their state guide and official agency source. Do not speculate about enforcement or say that a DMV always verifies a record.

- [ ] **Step 3: Refresh the existing night-hours guide without duplicating it**

Modify `NightDrivingHoursGuide.tsx` to add an answer-first first sentence and a compact `Related guides` section that links to `/50-hour-driving-log` and `/does-dmv-check-driving-hours`. Preserve the `US_STATES` table, existing state-source notice, and `Start Logging for Free` CTA.

- [ ] **Step 4: Apply the blog quality rules in component copy**

Verify all three pages have one H1; hierarchical H2/H3 sections; concise, self-contained answers at the start of material sections; no unsupported statistics; no keyword stuffing; descriptive internal links; and one focused CTA after useful guidance.

- [ ] **Step 5: Run type and lint checks**

Run: `npm run typecheck && npm run lint`

Expected: EXIT 0, with any existing lint warnings reported separately from errors.

- [ ] **Step 6: Commit the guide components**

```bash
git add src/pages/FiftyHourDrivingLogGuide.tsx src/pages/DmvDrivingHoursVerificationGuide.tsx src/pages/NightDrivingHoursGuide.tsx
git commit -m "feat: add supervised driving content guides"
```

### Task 4: Register, prerender, and sitemap the national guide cluster

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/prerender/state-guide-ssr.tsx`
- Modify: `scripts/prerender.mjs`
- Modify: `public/sitemap.xml`

**Interfaces:**
- Consumes: `FiftyHourDrivingLogGuide` and `DmvDrivingHoursVerificationGuide` exports from Task 3.
- Produces: lazy routes, SSR route coverage, built HTML at `/50-hour-driving-log/index.html` and `/does-dmv-check-driving-hours/index.html`, and one canonical sitemap entry per route.

- [ ] **Step 1: Add lazy imports and public routes**

In `src/App.tsx`, add lazy imports matching the existing pattern and insert the public routes before the dynamic `/dmv/:stateCode` route:

```tsx
const FiftyHourDrivingLogGuide = lazy(() => import('./pages/FiftyHourDrivingLogGuide').then(m => ({ default: m.FiftyHourDrivingLogGuide })));
const DmvDrivingHoursVerificationGuide = lazy(() => import('./pages/DmvDrivingHoursVerificationGuide').then(m => ({ default: m.DmvDrivingHoursVerificationGuide })));

<Route path="/50-hour-driving-log" element={<FiftyHourDrivingLogGuide />} />
<Route path="/does-dmv-check-driving-hours" element={<DmvDrivingHoursVerificationGuide />} />
```

- [ ] **Step 2: Mirror both pages in the SSR router**

In `src/prerender/state-guide-ssr.tsx`, import both components and add exact routes inside `renderPublicPage`:

```tsx
<Route path="/50-hour-driving-log" element={<FiftyHourDrivingLogGuide />} />
<Route path="/does-dmv-check-driving-hours" element={<DmvDrivingHoursVerificationGuide />} />
```

- [ ] **Step 3: Add static metadata and prerender entries**

In `scripts/prerender.mjs`, add both routes to `publicPages` with the exact titles and descriptions from Task 3. Add both paths to `staticPaths` so the generated `dist/sitemap.xml` contains them once.

- [ ] **Step 4: Keep the checked-in sitemap aligned**

Insert these canonical URLs once in `public/sitemap.xml` near `/night-driving-hours`:

```xml
<url><loc>https://drivehours.app/50-hour-driving-log</loc></url>
<url><loc>https://drivehours.app/does-dmv-check-driving-hours</loc></url>
```

- [ ] **Step 5: Run the route-contract test**

Run: `node --test tests/gsc-content-expansion.test.mjs`

Expected: source-level assertions pass; the built-page assertion may still fail until the production build in Task 5.

- [ ] **Step 6: Commit routing and crawlability changes**

```bash
git add src/App.tsx src/prerender/state-guide-ssr.tsx scripts/prerender.mjs public/sitemap.xml
git commit -m "feat: prerender GSC content guides"
```

### Task 5: Link the highest-impression state pages to the national guides

**Files:**
- Modify: `src/pages/StateGuide.tsx`
- Test: `tests/gsc-content-expansion.test.mjs`

**Interfaces:**
- Consumes: `state.code` in `StateGuide` and the route paths from Tasks 3–4.
- Produces: a reader-visible `Related driving-log guides` section only for CA, NC, and OH.

- [ ] **Step 1: Add an explicit priority-state set**

Near the module constants in `StateGuide.tsx`, define:

```tsx
const priorityContentStateCodes = new Set(['CA', 'NC', 'OH']);
```

Inside `StateGuide`, derive `showContentCluster` after `state` is known:

```tsx
const showContentCluster = priorityContentStateCodes.has(state.code);
```

- [ ] **Step 2: Render useful, descriptive links in the priority state pages**

Immediately after the state-specific night-driving section, add this conditional section:

```tsx
{showContentCluster && (
  <section className="app-card p-5 space-y-3" aria-labelledby="related-driving-log-guides">
    <h2 id="related-driving-log-guides" className="text-base font-bold text-slate-900 dark:text-white">
      Helpful driving-log guides
    </h2>
    <ul className="space-y-2 text-sm">
      <li><Link to="/night-driving-hours">See how night driving hours vary by state</Link></li>
      <li><Link to="/50-hour-driving-log">Learn what to include in a 50-hour driving log</Link></li>
      <li><Link to="/does-dmv-check-driving-hours">Prepare a clear record for your licensing appointment</Link></li>
    </ul>
  </section>
)}
```

Use the existing teal link and dark-mode class conventions so the links remain accessible and visibly interactive.

- [ ] **Step 3: Extend the static test for the priority-state guard**

Add assertions confirming the guard includes exactly `CA`, `NC`, and `OH`, and that all three `Link` destinations appear in `StateGuide.tsx`. Do not test unrelated states or infer a legal requirement from the internal-linking UI.

- [ ] **Step 4: Run the focused test**

Run: `node --test tests/gsc-content-expansion.test.mjs`

Expected: source-level route and internal-link assertions pass; built-page assertions wait for Task 6’s build.

- [ ] **Step 5: Commit priority-page links**

```bash
git add src/pages/StateGuide.tsx tests/gsc-content-expansion.test.mjs
git commit -m "feat: connect priority state guides to content cluster"
```

### Task 6: Build, review, and verify the published-content output

**Files:**
- Verify: `dist/50-hour-driving-log/index.html`
- Verify: `dist/does-dmv-check-driving-hours/index.html`
- Verify: `dist/night-driving-hours/index.html`
- Verify: `dist/dmv/ca/index.html`
- Verify: `dist/dmv/nc/index.html`
- Verify: `dist/dmv/oh/index.html`
- Verify: `dist/sitemap.xml`

**Interfaces:**
- Consumes: all implementation files and tests from Tasks 1–5.
- Produces: verified static HTML and a build that is safe to publish; no new runtime interface.

- [ ] **Step 1: Run the full production build**

Run: `npm run build`

Expected: Vite builds both client and SSR bundles; prerendering generates the two new guide directories, 50 state-guide pages, and a sitemap containing all public routes.

- [ ] **Step 2: Run all relevant automated checks**

Run:

```bash
npm run typecheck
npm run lint
node --test tests/seo-sprint.test.mjs tests/gsc-content-expansion.test.mjs
```

Expected: typecheck and tests pass. Lint has no errors; disclose any pre-existing warnings.

- [ ] **Step 3: Inspect crawler-facing output**

For each national guide, confirm the built file includes its exact title, canonical URL, visible answer-first content, a `BreadcrumbList`, and no `FAQPage`. Confirm CA, NC, and OH built pages include the three guide links. Confirm each new canonical URL appears exactly once in `dist/sitemap.xml` and `public/sitemap.xml`.

- [ ] **Step 4: Apply the blog editorial review before delivery**

Review every public guide against the installed `blog` skill: facts trace to Task 1’s source brief, headings do not skip levels, the first paragraph answers the page question, internal links are useful, no claim implies official endorsement, and copy contains no keyword stuffing. Correct any problem before delivery.

- [ ] **Step 5: Commit the verified implementation**

```bash
git add src/App.tsx src/pages src/prerender/state-guide-ssr.tsx scripts/prerender.mjs public/sitemap.xml tests/gsc-content-expansion.test.mjs docs/seo/2026-09-13-gsc-content-brief.md
git commit -m "feat: publish GSC-driven driving log guides"
```

## Plan self-review

- **Spec coverage:** Tasks 1–6 cover source discipline, the refreshed night-hours page, two new guides, CA/NC/OH links, routes, SSR, sitemap, tests, and build verification.
- **Placeholder scan:** The plan contains no deferred implementation markers; every code change, path, test command, and required public claim is specified.
- **Type consistency:** The two page export names used by `App.tsx` and the SSR router are identical. Route paths, canonical URLs, prerender metadata, sitemap entries, and test fixtures use the same strings.
