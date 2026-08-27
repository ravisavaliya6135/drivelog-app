# DriveLog UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved premium, mobile-first DriveLog design system across every existing route and user-facing component without changing offline persistence, timing, entitlements, PDF generation, or SEO behavior.

**Architecture:** Establish one reusable local SVG logo and a small set of semantic Tailwind primitives, then apply them progressively to the app shell, product pages, account flows, and information pages. Existing page and domain components remain responsible for all data, timer, payment, and PDF logic; this work changes their markup and styling only.

**Tech Stack:** React 18, TypeScript strict mode, Vite 5, Tailwind CSS 3.4, React Router, Lucide React, node:test.

## Global Constraints

- Use no CDN fetches or runtime network dependencies; use only local SVG and the installed Lucide icon set.
- Preserve the one-second IndexedDB timer heartbeat, wall-clock calculations, current URL modal behavior, and active-drive distraction-free mode.
- Keep the free entitlement gate at exactly `20.0` hours and preserve all Stripe/Supabase behavior.
- Preserve route-level lazy loading and lazy client-side PDF generation; add no new package.
- Meet WCAG AA 4.5:1 normal-text contrast, retain skip/focus/dialog behavior, and provide labels for every icon-only control.
- Keep primary driving actions at least 64px tall and other interactive targets at least 44px.
- Support light and dark themes, safe areas, 375px mobile, landscape, tablet, desktop, and reduced motion.
- Do not stage or change the pre-existing modifications in `src/contexts/AuthContext.tsx`, `src/contexts/EntitlementContext.tsx`, `src/lib/supabase.ts`, or `tests/ui-accessibility.test.mjs`.

---

### Task 1: Establish the shared logo, shell, and visual primitives

**Files:**

- Create: `src/components/DriveLogLogo.tsx`
- Modify: `src/index.css`
- Modify: `src/App.tsx`
- Modify: `src/components/SiteFooter.tsx`
- Modify: `.gitignore`
- Create: `tests/ui-redesign.test.mjs`

**Interfaces:**

- Produces: `DriveLogLogo({ className?: string; title?: string }): JSX.Element`, a local decorative SVG when `title` is absent and a labelled SVG when it is supplied.
- Produces: reusable CSS classes `page-header`, `section-kicker`, `app-card`, `app-card-elevated`, `btn-primary`, `btn-secondary`, `btn-quiet`, and `nav-item-active`.
- Consumes: existing `NavLink` state callbacks in `App.tsx` and `SiteFooter.tsx`.

- [ ] **Step 1: Write failing source-level tests for the shared system**

~~~js
test('the app shell uses the DriveLog SVG mark and labelled mobile navigation', async () => {
  const app = await source('src/App.tsx');
  const logo = await source('src/components/DriveLogLogo.tsx');
  assert.match(app, /DriveLogLogo/);
  assert.match(app, /aria-label="Home"/);
  assert.match(app, /aria-label="Driving history"/);
  assert.match(logo, /strokeDasharray/);
  assert.match(logo, /<title>/);
});
~~~

- [ ] **Step 2: Run the test and verify it fails because the logo module does not exist**

Run: `node --test tests/ui-redesign.test.mjs`  
Expected: FAIL with an `ENOENT` error for `src/components/DriveLogLogo.tsx`.

- [ ] **Step 3: Add the logo and design primitives**

~~~tsx
export function DriveLogLogo({ className = 'h-9 w-9', title }: DriveLogLogoProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      <rect width="32" height="32" rx="10" fill="#0F172A" />
      <path d="M8 5h7.5c5.4 0 9.5 4.2 9.5 11s-4.1 11-9.5 11H8z" stroke="white" strokeWidth="2.8" />
      <path d="M14.5 8.5v4.1m0 6.8v4.1" stroke="#2DD4BF" strokeWidth="2.8" strokeLinecap="round" strokeDasharray="2.2 3.1" />
    </svg>
  );
}
~~~

Add the approved 4/8px spacing, solid-surface, button, header, status-badge, and active-navigation styles in `src/index.css`; replace the text-initial brand block in `App.tsx` with `DriveLogLogo`; give every mobile navigation link a Lucide icon and accessible label; keep the center record-drive shortcut; use the logo in `SiteFooter`; and add `.superpowers/` to `.gitignore` so local visual-companion files are never staged.

- [ ] **Step 4: Run the focused test and static checks**

Run: `node --test tests/ui-redesign.test.mjs && npm run typecheck && npm run lint`  
Expected: all commands exit `0`.

- [ ] **Step 5: Commit the shared visual system only**

~~~bash
git add .gitignore src/components/DriveLogLogo.tsx src/index.css src/App.tsx src/components/SiteFooter.tsx tests/ui-redesign.test.mjs
git commit -m "feat: establish DriveLog visual system"
~~~

### Task 2: Rebuild the Home dashboard as the driving cockpit

**Files:**

- Modify: `src/pages/Home.tsx`
- Modify: `src/components/DriveSummary.tsx`
- Modify: `tests/ui-redesign.test.mjs`

**Interfaces:**

- Consumes: existing `useDriveLog()` totals, `useEntitlement()` limits, `DriveTimer`, `DriveLogEntry`, `UpgradeModal`, URL modal state, and `US_STATES` requirements.
- Produces: a Home layout that keeps `handleTimerComplete`, `handleLogEntrySave`, `timerDialogRef`, and `logEntryDialogRef` unchanged while exposing the approved progress-first hierarchy.

- [ ] **Step 1: Add a failing dashboard contract test**

~~~js
test('home presents the approved cockpit hierarchy without changing drive controls', async () => {
  const home = await source('src/pages/Home.tsx');
  assert.match(home, /License goal/);
  assert.match(home, /Start a driving session/);
  assert.match(home, /Day driving/);
  assert.match(home, /Night driving/);
  assert.match(home, /DriveTimer/);
  assert.match(home, /timer-drive-data/);
});
~~~

- [ ] **Step 2: Run the dashboard test and verify it fails on the new cockpit copy**

Run: `node --test tests/ui-redesign.test.mjs`  
Expected: FAIL because `License goal` and `Start a driving session` are absent.

- [ ] **Step 3: Apply the Home hierarchy without moving domain logic**

Keep all state and handlers in place. Reorder only the JSX into: page greeting and selected-state context; navy goal card with total/target, percentage, bar, remaining hours and remaining night hours; one `btn-primary` 64px start button; two day/night cards; latest drive; setup/sign-off/upgrade/empty states. Update `DriveSummary` to use the same card and badge primitives where it is rendered. Preserve the existing full-screen timer and accessible log-entry dialog markup.

~~~tsx
<button type="button" onClick={() => updateModalUrl('timer')} className="btn-primary w-full text-base">
  <Play className="h-5 w-5" aria-hidden="true" />
  Start a driving session
</button>
~~~

- [ ] **Step 4: Run the test, typecheck, lint, and manual timer regression**

Run: `node --test tests/ui-redesign.test.mjs && npm run typecheck && npm run lint`  
Manual check: start, pause, resume, and stop a drive; reload while a drive is active; verify the timer restores and a completed session still opens the entry form.

- [ ] **Step 5: Commit the dashboard change only**

~~~bash
git add src/pages/Home.tsx src/components/DriveSummary.tsx tests/ui-redesign.test.mjs
git commit -m "feat: redesign driving dashboard"
~~~

### Task 3: Align driving history, entries, and timer states

**Files:**

- Modify: `src/pages/LogDrive.tsx`
- Modify: `src/components/DriveLogEntry.tsx`
- Modify: `src/components/DriveTimer.tsx`
- Modify: `tests/ui-redesign.test.mjs`

**Interfaces:**

- Consumes: existing history filters, `getActiveTimerRecord`, `addDrive`, `onSave`, `onCancel`, and timer recovery/discard logic.
- Produces: a shared list-row, filter, form, active-drive, and modal surface treatment with the same event callbacks and data fields.

- [ ] **Step 1: Add a failing history/form accessibility test**

~~~js
test('history and drive-entry controls use the shared visual primitives', async () => {
  const history = await source('src/pages/LogDrive.tsx');
  const entry = await source('src/components/DriveLogEntry.tsx');
  assert.match(history, /Driving History/);
  assert.match(history, /aria-pressed/);
  assert.match(entry, /form-label/);
  assert.match(entry, /btn-primary/);
});
~~~

- [ ] **Step 2: Run the test and verify it fails on filter semantics**

Run: `node --test tests/ui-redesign.test.mjs`  
Expected: FAIL because the day/night filter buttons do not yet expose `aria-pressed`.

- [ ] **Step 3: Restyle history, forms, and timer presentation**

Apply `page-header` to History; make the search/filter card quiet and use `aria-pressed={filterType === 'day'}` (and equivalent all/night states); emphasize duration, legal classification, and supervisor/vehicle metadata in each list row; preserve click-to-edit behavior. Bring `DriveLogEntry` labels, grouping, validation, and submit row to the shared form/button system. Restyle `DriveTimer` recovery, active, paused, discard, and completed states only; do not edit timer calculations, IndexedDB calls, heartbeat scheduling, or pause/resume/stop handlers.

- [ ] **Step 4: Verify behavior and static checks**

Run: `node --test tests/ui-redesign.test.mjs && npm run typecheck && npm run lint`  
Manual check: filter All/Day/Night by keyboard, open and cancel an entry, edit and save an entry, and exercise the timer discard confirmation.

- [ ] **Step 5: Commit the driving-flow surfaces only**

~~~bash
git add src/pages/LogDrive.tsx src/components/DriveLogEntry.tsx src/components/DriveTimer.tsx tests/ui-redesign.test.mjs
git commit -m "feat: unify history and drive entry design"
~~~

### Task 4: Redesign export readiness and settings/profile flows

**Files:**

- Modify: `src/pages/ExportDocs.tsx`
- Modify: `src/pages/Settings.tsx`
- Modify: `src/components/StateSelector.tsx`
- Modify: `src/components/MultiDriverForm.tsx`
- Modify: `src/components/PdfExport.tsx`
- Modify: `tests/ui-redesign.test.mjs`

**Interfaces:**

- Consumes: `generatePDF`, `downloadPDF`, selected-state local storage, profile CRUD callbacks, current entitlement state, and PDF export props.
- Produces: consistent readiness, settings-section, selector, profile-sheet, and PDF action surfaces while retaining all existing callbacks and disabled states.

- [ ] **Step 1: Add a failing export/settings contract test**

~~~js
test('export and settings expose a readable readiness and labelled-section hierarchy', async () => {
  const exportPage = await source('src/pages/ExportDocs.tsx');
  const settings = await source('src/pages/Settings.tsx');
  assert.match(exportPage, /Document readiness/);
  assert.match(exportPage, /Generate Official DMV PDF/);
  assert.match(settings, /page-header/);
  assert.match(settings, /form-label/);
});
~~~

- [ ] **Step 2: Run the test and verify it fails on the new readiness heading**

Run: `node --test tests/ui-redesign.test.mjs`  
Expected: FAIL because `Document readiness` is absent.

- [ ] **Step 3: Apply the readiness and settings visual system**

Keep PDF loading and generation code unchanged. Add an explicit `Document readiness` heading to Export; use a status badge with an icon and text; keep target state, total, day, and night checks readable; make the primary PDF action visually dominant and preserve its current disabled/loading state. In Settings, retain each tab and existing account/data/profile/theme/upgrade behavior while applying consistent `page-header`, `section-kicker`, card, field, and quiet-action primitives. Use the same menu, sheet, labels, and 44px target treatment in `StateSelector`, `MultiDriverForm`, and `PdfExport`.

- [ ] **Step 4: Verify flows and static checks**

Run: `node --test tests/ui-redesign.test.mjs && npm run typecheck && npm run lint`  
Manual check: change a state, add/edit a driver and vehicle, switch theme, open an export preview, generate a PDF, and verify the 20-hour gate remains unchanged.

- [ ] **Step 5: Commit the export/settings work only**

~~~bash
git add src/pages/ExportDocs.tsx src/pages/Settings.tsx src/components/StateSelector.tsx src/components/MultiDriverForm.tsx src/components/PdfExport.tsx tests/ui-redesign.test.mjs
git commit -m "feat: redesign export and settings flows"
~~~

### Task 5: Unify authentication, Pro, install, and recovery surfaces

**Files:**

- Modify: `src/components/AuthModal.tsx`
- Modify: `src/components/UpgradeModal.tsx`
- Modify: `src/components/PwaInstallPrompt.tsx`
- Modify: `src/components/ErrorBoundary.tsx`
- Modify: `tests/ui-redesign.test.mjs`

**Interfaces:**

- Consumes: existing dialog refs, sign-in, checkout, PWA install, and reload callbacks.
- Produces: branded and accessible sheets/dialogs with unchanged `role="dialog"`, `aria-modal="true"`, focus handling, and state transitions.

- [ ] **Step 1: Add a failing branded-dialog test**

~~~js
test('account and recovery surfaces use the DriveLog logo and retain dialog semantics', async () => {
  const auth = await source('src/components/AuthModal.tsx');
  const upgrade = await source('src/components/UpgradeModal.tsx');
  const errorBoundary = await source('src/components/ErrorBoundary.tsx');
  assert.match(auth, /DriveLogLogo/);
  assert.match(upgrade, /DriveLogLogo/);
  assert.match(auth, /aria-modal="true"/);
  assert.match(errorBoundary, /DriveLogLogo/);
});
~~~

- [ ] **Step 2: Run the test and verify it fails because the logo is not used in these surfaces**

Run: `node --test tests/ui-redesign.test.mjs`  
Expected: FAIL on the first `DriveLogLogo` assertion.

- [ ] **Step 3: Apply shared branded-sheet styling**

Use `DriveLogLogo` as the compact visual anchor where a brand icon currently appears; normalize sheets to the approved solid surface, border, scrim, close-button, status, and button treatments. Keep every existing dialog role, title connection, close action, disabled condition, loading state, and focus ref intact. Retain the PWA prompt's safe-area placement and ErrorBoundary's offline-safe reload behavior.

- [ ] **Step 4: Verify dialog behavior and static checks**

Run: `node --test tests/ui-redesign.test.mjs tests/ui-accessibility.test.mjs && npm run typecheck && npm run lint`  
Manual check: open/close auth, upgrade, and install sheets with mouse and keyboard; confirm Escape/focus behavior and the ErrorBoundary reload button remain available.

- [ ] **Step 5: Commit the shared dialogs only**

~~~bash
git add src/components/AuthModal.tsx src/components/UpgradeModal.tsx src/components/PwaInstallPrompt.tsx src/components/ErrorBoundary.tsx tests/ui-redesign.test.mjs
git commit -m "feat: unify branded account surfaces"
~~~

### Task 6: Apply the system to every guide, support, and legal route

**Files:**

- Modify: `src/pages/StateGuide.tsx`
- Modify: `src/pages/StateGuideIndex.tsx`
- Modify: `src/pages/HelpCenter.tsx`
- Modify: `src/pages/ContactFeedback.tsx`
- Modify: `src/pages/About.tsx`
- Modify: `src/pages/PrivacyPolicy.tsx`
- Modify: `src/pages/TermsOfUse.tsx`
- Modify: `tests/ui-redesign.test.mjs`

**Interfaces:**

- Consumes: existing state-guide data, SEO hooks, help accordion state, feedback submission code, and legal/support copy.
- Produces: content-first pages with shared headers/cards/callouts and unchanged routes, canonical metadata, accordion behavior, and form submission logic.

- [ ] **Step 1: Add a failing public-route system test**

~~~js
test('public routes use the shared content header and retain semantic landmarks', async () => {
  for (const path of ['src/pages/StateGuide.tsx', 'src/pages/HelpCenter.tsx', 'src/pages/ContactFeedback.tsx', 'src/pages/PrivacyPolicy.tsx']) {
    const page = await source(path);
    assert.match(page, /page-header/);
  }
  const help = await source('src/pages/HelpCenter.tsx');
  assert.match(help, /aria-expanded/);
});
~~~

- [ ] **Step 2: Run the test and verify it fails because pages do not yet use the shared header class**

Run: `node --test tests/ui-redesign.test.mjs`  
Expected: FAIL on a missing `page-header` match.

- [ ] **Step 3: Restyle content routes without changing copy or behavior**

Apply `page-header`, `section-kicker`, readable `max-w-3xl` measures, and consistent card/callout styles to all seven routes. Keep the state directory's 50 links, breadcrumbs, state data, CTA routes, `useSeo` values, Help accordion `aria-expanded` state, ContactFeedback labels and offline messages, and legal content unchanged. Use Lucide icons already imported or add a suitable existing Lucide icon only when it clarifies the heading.

- [ ] **Step 4: Verify responsive/semantic behavior and static checks**

Run: `node --test tests/ui-redesign.test.mjs tests/ui-accessibility.test.mjs && npm run typecheck && npm run lint`  
Manual check: keyboard-toggle a Help item, submit an empty Contact message to check native validation, traverse a state card grid, and read Privacy/Terms at mobile and desktop widths.

- [ ] **Step 5: Commit the content-route redesign only**

~~~bash
git add src/pages/StateGuide.tsx src/pages/StateGuideIndex.tsx src/pages/HelpCenter.tsx src/pages/ContactFeedback.tsx src/pages/About.tsx src/pages/PrivacyPolicy.tsx src/pages/TermsOfUse.tsx tests/ui-redesign.test.mjs
git commit -m "feat: apply design system to content routes"
~~~

### Task 7: Validate the completed system and update design documentation

**Files:**

- Modify: `docs/agent-skills/accessibility.md`
- Modify: `docs/agent-skills/performance.md`
- Modify: `docs/agent-skills/premium-ui-ux.md`
- Modify: `docs/superpowers/specs/2026-08-27-drivelog-ui-redesign-design.md`
- Modify: `docs/superpowers/plans/2026-08-27-drivelog-ui-redesign.md`
- Modify: `tests/ui-redesign.test.mjs`

**Interfaces:**

- Consumes: the approved design spec and all shared components/classes implemented in Tasks 1–6.
- Produces: final documented verification requirements and regression assertions for logo, navigation semantics, focus, reduced motion, form labels, and lazy-loading boundaries.

- [ ] **Step 1: Add failing regression assertions for the final system**

~~~js
test('the production shell preserves semantic navigation and reduced-motion support', async () => {
  const app = await source('src/App.tsx');
  const css = await source('src/index.css');
  assert.match(app, /<nav/);
  assert.match(app, /aria-label="Record driving session"/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /min-h-16/);
});
~~~

- [ ] **Step 2: Run the complete test suite before the final documentation pass**

Run: `node --test tests/ui-accessibility.test.mjs tests/ui-redesign.test.mjs`  
Expected: PASS after Tasks 1–6; if an assertion fails, correct only the associated source or test expectation before continuing.

- [ ] **Step 3: Record final UI, accessibility, and performance guardrails**

Update the three agent guides so future UI changes must use the `DriveLogLogo`, icon-labelled navigation, shared primitives, 64px driving actions, `prefers-reduced-motion`, local assets, and existing lazy-loading boundaries. Mark the design spec and this plan as implemented only after all verification commands pass.

- [ ] **Step 4: Run the final verification matrix**

Run: `npm run typecheck && npm run lint && npm run build && node --test tests/ui-accessibility.test.mjs tests/ui-redesign.test.mjs`  
Expected: all commands exit `0`.

Manual matrix: inspect Home, History, Export, Settings, state guides, Help, Contact, About, Privacy, and Terms at 375px, 768px, and desktop widths in light/dark themes; verify a 64px primary drive action, 44px icon controls, keyboard focus, reduced motion, no horizontal overflow, and no content behind fixed navigation.

- [ ] **Step 5: Commit verification and documentation**

~~~bash
git add docs/agent-skills/accessibility.md docs/agent-skills/performance.md docs/agent-skills/premium-ui-ux.md docs/superpowers/specs/2026-08-27-drivelog-ui-redesign-design.md docs/superpowers/plans/2026-08-27-drivelog-ui-redesign.md tests/ui-redesign.test.mjs
git commit -m "docs: complete DriveLog UI redesign guidance"
~~~
