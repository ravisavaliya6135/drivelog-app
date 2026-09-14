# DriveHours Motion System and Reliability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the intended DriveHours motion visible, calm, accessible, and performant across every page and interaction while preserving timer and offline behavior.

**Architecture:** Keep the implementation dependency-free: Tailwind owns a small, named motion vocabulary and React owns presence only where an exit animation is needed. Shared primitives cover entry/exit timing and progress fills; pages and dialogs only select the appropriate primitive. All motion remains CSS `opacity`, `transform`, color, border, and shadow—never continuous decorative animation or layout animation around a live timer.

**Tech Stack:** React 18, TypeScript strict, Tailwind CSS 3.4, Vite 5, native Node test runner, existing `useAccessibleDialog` hook, PWA/Workbox.

## Global Constraints

- Use no new dependencies and no CDN resources.
- Keep every normal control animation between 150–250ms; use ease-out on entry and ease-in on exit.
- Preserve the existing global `prefers-reduced-motion` override in `src/index.css`; reduced-motion users must not wait for artificial exit timers.
- Keep all primary actions at least 64px high and all secondary interactive targets at least 44px high.
- Preserve keyboard focus, Escape close behavior, and focus return in every existing dialog.
- Preserve the timer’s one-second IndexedDB heartbeat and wall-clock calculations; do not animate time values, timer layout, or the active timer ring.
- Keep the app fully functional offline and preserve Vite PWA caching behavior.
- Keep TypeScript strict with zero `any`, keep Lighthouse Performance at or above 90, and do not use `transition-all` in newly touched UI.
- Use the existing Navy `#0F172A`, Slate `#334155`, and Teal `#0D9488` design system.

---

## Files and Responsibilities

| File | Responsibility |
| --- | --- |
| `tailwind.config.js` | Defines all named entry and exit keyframes plus stable motion durations. |
| `src/index.css` | Preserves the reduced-motion safety net and narrows reusable card/control transition properties. |
| `src/hooks/useAnimatedPresence.ts` | Keeps a closing overlay mounted only long enough to play an exit animation, then removes it. |
| `src/components/ProgressFill.tsx` | Renders a transform-based progress fill without changing layout width. |
| `src/components/{AuthModal,UpgradeModal,PwaInstallPrompt,MultiDriverForm,DriveTimer}.tsx` | Applies accessible entry and exit classes to component-owned dialogs and sheets. |
| `src/pages/{Home,LogDrive,HelpCenter,Settings}.tsx` | Applies presence to page-owned overlays, moves FAQ content smoothly, removes decorative pulses, and adopts progress fills. |
| `src/components/{DriveSummary,StateSelector,DriveLogEntry}.tsx` | Uses the shared progress primitive and narrow transition properties. |
| `src/App.tsx` | Narrows navigation and shell transitions; retains the temporary loading skeleton. |
| `tests/motion-system.test.mjs` | Guards the named motion contract, reduced-motion behavior, no forbidden decorative pulses, and no broad transitions in changed motion surfaces. |
| `docs/design/motion-system.md` | Documents the approved motion vocabulary and when it may be used. |

---

### Task 1: Establish the tested motion vocabulary

**Files:**

- Create: `tests/motion-system.test.mjs`
- Modify: `tailwind.config.js`
- Modify: `src/index.css`

**Interfaces:**

- Produces Tailwind classes `animate-fade-in`, `animate-fade-out`, `animate-slide-up`, and `animate-slide-down`.
- Produces CSS transition utilities that affect only explicit visual properties.
- Consumed by every later task; no JavaScript animation library is introduced.

- [ ] **Step 1: Write the failing motion-contract test**

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const source = (path) => readFile(new URL(path, root), 'utf8');

test('Tailwind defines every motion class used by DriveHours', async () => {
  const config = await source('tailwind.config.js');

  for (const name of ['fade-in', 'fade-out', 'slide-up', 'slide-down']) {
    assert.match(config, new RegExp(`['\"]${name}['\"]`));
  }
  assert.match(config, /keyframes/);
  assert.match(config, /transform: 'translateY\(16px\)'/);
});

test('global CSS keeps the reduced-motion safety net', async () => {
  const css = await source('src/index.css');
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /animation-duration: 0\.01ms !important/);
  assert.match(css, /transition-duration: 0\.01ms !important/);
});
```

- [ ] **Step 2: Run the test and confirm the missing-keyframe failure**

Run: `node --test tests/motion-system.test.mjs`

Expected: FAIL because `tailwind.config.js` does not yet define `fade-in`, `fade-out`, `slide-up`, or `slide-down`.

- [ ] **Step 3: Add the four small CSS-only animations to Tailwind**

Add this under `theme.extend` in `tailwind.config.js`:

```js
keyframes: {
  'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
  'fade-out': { from: { opacity: '1' }, to: { opacity: '0' } },
  'slide-up': {
    from: { opacity: '0', transform: 'translateY(16px)' },
    to: { opacity: '1', transform: 'translateY(0)' },
  },
  'slide-down': {
    from: { opacity: '1', transform: 'translateY(0)' },
    to: { opacity: '0', transform: 'translateY(12px)' },
  },
},
animation: {
  'fade-in': 'fade-in 180ms ease-out both',
  'fade-out': 'fade-out 140ms ease-in both',
  'slide-up': 'slide-up 220ms cubic-bezier(0.16, 1, 0.3, 1) both',
  'slide-down': 'slide-down 160ms ease-in both',
},
```

In `src/index.css`, replace reusable `transition-all` declarations with explicit properties. For example, change `.app-card` to `transition-[background-color,border-color,box-shadow] duration-200` and `.btn-primary` to `transition-[transform,background-color,box-shadow] duration-150`. Keep the existing reduced-motion block unchanged.

- [ ] **Step 4: Verify the source contract and generated production CSS**

Run:

```bash
node --test tests/motion-system.test.mjs
npm run build
node --test tests/production-build-integrity.test.mjs
```

Expected: all commands pass, and the generated stylesheet contains `@keyframes fade-in` and `@keyframes slide-up`.

- [ ] **Step 5: Commit the tested foundation**

```bash
git add tailwind.config.js src/index.css tests/motion-system.test.mjs
git commit -m "feat(ui): add accessible motion foundation"
```

### Task 2: Add a single accessible presence hook for overlay exits

**Files:**

- Create: `src/hooks/useAnimatedPresence.ts`
- Modify: `tests/motion-system.test.mjs`

**Interfaces:**

- Produces `useAnimatedPresence(isOpen: boolean, exitDurationMs?: number)`.
- Returns `{ shouldRender: boolean; phase: 'entering' | 'entered' | 'exiting' }`.
- Consumers keep `isOpen` as the accessibility truth; `shouldRender` is visual-only, and an exiting surface must receive `aria-hidden` plus `pointer-events-none`.

- [ ] **Step 1: Extend the failing test with the required hook contract**

```js
test('animated presence honors reduced motion and keeps exit state explicit', async () => {
  const hook = await source('src/hooks/useAnimatedPresence.ts');

  assert.match(hook, /export function useAnimatedPresence\(/);
  assert.match(hook, /'entering' \| 'entered' \| 'exiting'/);
  assert.match(hook, /prefers-reduced-motion: reduce/);
  assert.match(hook, /window\.setTimeout/);
});
```

- [ ] **Step 2: Run the test and confirm it fails because the hook does not exist**

Run: `node --test tests/motion-system.test.mjs`

Expected: FAIL with an `ENOENT` error for `src/hooks/useAnimatedPresence.ts`.

- [ ] **Step 3: Implement the hook without changing business state**

```ts
export type AnimatedPresencePhase = 'entering' | 'entered' | 'exiting';

export interface AnimatedPresence {
  shouldRender: boolean;
  phase: AnimatedPresencePhase;
}

export function useAnimatedPresence(isOpen: boolean, exitDurationMs = 160): AnimatedPresence {
  // Start mounted only when logically open; never delay an opening surface.
  // On close, return `exiting` until the timeout completes.
  // If `prefers-reduced-motion: reduce` matches, use a zero-millisecond exit.
  // Clear every pending timeout during cleanup.
}
```

The implementation must set `shouldRender` immediately when `isOpen` becomes true, use `phase: 'exiting'` only after a logical close, and set `shouldRender` false after the normal duration or immediately for reduced motion. It must not touch IndexedDB, routing, dialog focus, auth, payment, or timer state.

- [ ] **Step 4: Verify hook behavior and compile safety**

Run:

```bash
node --test tests/motion-system.test.mjs
npm run typecheck
npm run lint
```

Expected: all commands pass.

- [ ] **Step 5: Commit the reusable hook**

```bash
git add src/hooks/useAnimatedPresence.ts tests/motion-system.test.mjs
git commit -m "feat(ui): add accessible overlay exit presence"
```

### Task 3: Apply entry and exit motion to every dialog, sheet, and full-screen flow

**Files:**

- Modify: `src/components/AuthModal.tsx`
- Modify: `src/components/UpgradeModal.tsx`
- Modify: `src/components/PwaInstallPrompt.tsx`
- Modify: `src/components/MultiDriverForm.tsx`
- Modify: `src/components/DriveTimer.tsx`
- Modify: `src/pages/Home.tsx`
- Modify: `src/pages/LogDrive.tsx`
- Modify: `tests/ui-accessibility.test.mjs`
- Modify: `tests/motion-system.test.mjs`

**Interfaces:**

- Consumes `useAnimatedPresence` from Task 2.
- Keeps the existing `useAccessibleDialog(isOpen, onClose)` inputs tied to the logical open state, not the visual presence state.
- Produces consistent overlay classes: `animate-fade-in`/`animate-fade-out` and `animate-slide-up`/`animate-slide-down`.

- [ ] **Step 1: Write failing coverage for the exact motion and accessibility rules**

```js
test('all closable motion surfaces use the shared presence hook', async () => {
  const files = [
    'src/components/AuthModal.tsx',
    'src/components/UpgradeModal.tsx',
    'src/components/PwaInstallPrompt.tsx',
    'src/components/MultiDriverForm.tsx',
    'src/components/DriveTimer.tsx',
    'src/pages/Home.tsx',
    'src/pages/LogDrive.tsx',
  ];

  for (const path of files) {
    assert.match(await source(path), /useAnimatedPresence/);
  }
});

test('exiting dialogs are removed from pointer and assistive interaction', async () => {
  const combined = await Promise.all([
    source('src/components/AuthModal.tsx'),
    source('src/components/UpgradeModal.tsx'),
    source('src/components/PwaInstallPrompt.tsx'),
    source('src/components/MultiDriverForm.tsx'),
  ]);

  assert.match(combined.join('\n'), /aria-hidden=\{!isOpen\}/);
  assert.match(combined.join('\n'), /pointer-events-none/);
});
```

- [ ] **Step 2: Run tests and confirm every listed surface fails the new contract**

Run: `node --test tests/motion-system.test.mjs tests/ui-accessibility.test.mjs`

Expected: FAIL because the current dialogs unmount immediately when their `isOpen` values become false.

- [ ] **Step 3: Convert each conditional render to logical-open plus visual-presence rendering**

Use this pattern in each component that owns its conditional surface:

```tsx
const presence = useAnimatedPresence(isOpen);

if (!presence.shouldRender) return null;

const isExiting = presence.phase === 'exiting';

return (
  <div
    aria-hidden={!isOpen}
    className={cn(
      'fixed inset-0 ...',
      isExiting ? 'animate-fade-out pointer-events-none' : 'animate-fade-in',
    )}
  >
    <div className={isExiting ? 'animate-slide-down' : 'animate-slide-up'}>...</div>
  </div>
);
```

For `Home.tsx` and `LogDrive.tsx`, apply the hook at the component that owns `showTimer` or `selectedEntry`, so the child component is not unmounted before its exit animation can play. Keep `DriveTimer` actions and its timer hook unchanged. The full-screen timer may use only fade in/fade out; it must not translate the active driving controls.

- [ ] **Step 4: Test keyboard and mobile behavior after every group of overlays**

Run:

```bash
node --test tests/motion-system.test.mjs tests/ui-accessibility.test.mjs
npm run typecheck
npm run lint
```

Manually verify at a 390px viewport: open and close sign-in, upgrade, quick log, timer, history detail, driver, vehicle, iOS install, and discard-confirmation surfaces. For every surface, verify Escape closes it, focus returns to the initiating control, and an exiting surface cannot receive a click or screen-reader focus.

- [ ] **Step 5: Commit the overlay system**

```bash
git add src/components/AuthModal.tsx src/components/UpgradeModal.tsx src/components/PwaInstallPrompt.tsx src/components/MultiDriverForm.tsx src/components/DriveTimer.tsx src/pages/Home.tsx src/pages/LogDrive.tsx tests/ui-accessibility.test.mjs tests/motion-system.test.mjs
git commit -m "feat(ui): animate dialogs and sheets safely"
```

### Task 4: Make disclosures and selectors feel responsive without hiding content from assistive technology

**Files:**

- Modify: `src/pages/HelpCenter.tsx`
- Modify: `src/components/StateSelector.tsx`
- Modify: `tests/ui-accessibility.test.mjs`
- Modify: `tests/motion-system.test.mjs`

**Interfaces:**

- `AccordionItem` retains its `aria-expanded`, `aria-controls`, `role="region"`, and stable `id` relationship.
- Closed FAQ content has `aria-hidden="true"`; opened content has `aria-hidden="false"`.
- State selector keeps its existing button semantics and only receives the shared fade utility.

- [ ] **Step 1: Write failing disclosure tests**

```js
test('the Help accordion animates content as well as its chevron', async () => {
  const help = await source('src/pages/HelpCenter.tsx');

  assert.match(help, /grid-rows-\[0fr\]/);
  assert.match(help, /grid-rows-\[1fr\]/);
  assert.match(help, /transition-\[grid-template-rows,opacity\]/);
  assert.match(help, /aria-hidden=\{!isOpen\}/);
});

test('state selector uses the defined fade-in utility', async () => {
  const selector = await source('src/components/StateSelector.tsx');
  assert.match(selector, /animate-fade-in/);
});
```

- [ ] **Step 2: Run the tests and confirm the FAQ content contract fails**

Run: `node --test tests/motion-system.test.mjs tests/ui-accessibility.test.mjs`

Expected: FAIL because the current FAQ uses `hidden={!isOpen}`, which removes content immediately and leaves only the chevron animated.

- [ ] **Step 3: Replace immediate FAQ hiding with a grid-row/opacity transition**

Keep the answer in a grid wrapper and use an inner `min-h-0 overflow-hidden` element:

```tsx
<div
  id={`help-panel-${item.id}`}
  role="region"
  aria-label={item.question}
  aria-hidden={!isOpen}
  className={cn(
    'grid transition-[grid-template-rows,opacity] duration-200 ease-out',
    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none',
  )}
>
  <div className="min-h-0 overflow-hidden">
    <div className="px-4 pb-4 pt-3 ml-1 text-sm leading-relaxed space-y-2 border-t ...">
      {item.answer}
    </div>
  </div>
</div>
```

Do not use `transition-all`, JavaScript-measured heights, or an animation that delays the answer from becoming readable. Keep the 200ms chevron rotation and update it to the same `ease-out` timing.

- [ ] **Step 4: Verify FAQ behavior and selector behavior**

Run:

```bash
node --test tests/motion-system.test.mjs tests/ui-accessibility.test.mjs
npm run typecheck
npm run lint
```

Manually verify that only one FAQ panel is visible, keyboard activation changes `aria-expanded` immediately, and state selection remains usable with reduced motion.

- [ ] **Step 5: Commit the disclosure refinement**

```bash
git add src/pages/HelpCenter.tsx src/components/StateSelector.tsx tests/ui-accessibility.test.mjs tests/motion-system.test.mjs
git commit -m "feat(ui): refine disclosure motion"
```

### Task 5: Replace broad progress and surface transitions with performant primitives

**Files:**

- Create: `src/components/ProgressFill.tsx`
- Modify: `src/pages/Home.tsx`
- Modify: `src/components/DriveSummary.tsx`
- Modify: `src/components/UpgradeModal.tsx`
- Modify: `src/pages/Settings.tsx`
- Modify: `src/components/DriveLogEntry.tsx`
- Modify: `src/App.tsx`
- Modify: `tests/motion-system.test.mjs`

**Interfaces:**

- Produces `ProgressFill({ value, className, duration = 'standard' })` where `value` is a percentage from 0 to 100.
- `ProgressFill` uses `transform: scaleX(value / 100)` with `transformOrigin: 'left center'`; callers retain their current outer progress semantics and labels.
- Components touched by this task expose no new `transition-all` strings.

- [ ] **Step 1: Write failing source-level performance tests**

```js
test('progress surfaces use transform rather than animated layout width', async () => {
  const fill = await source('src/components/ProgressFill.tsx');

  assert.match(fill, /scaleX/);
  assert.match(fill, /transformOrigin: 'left center'/);
  assert.doesNotMatch(fill, /transition-all/);
});

test('motion-critical surfaces do not use transition-all', async () => {
  const files = [
    'src/App.tsx', 'src/pages/Home.tsx', 'src/pages/Settings.tsx',
    'src/components/DriveSummary.tsx', 'src/components/DriveLogEntry.tsx',
    'src/components/UpgradeModal.tsx',
  ];
  for (const path of files) {
    assert.doesNotMatch(await source(path), /transition-all/);
  }
});
```

- [ ] **Step 2: Run the tests and confirm the component does not exist and broad transitions are found**

Run: `node --test tests/motion-system.test.mjs`

Expected: FAIL with an `ENOENT` error for `ProgressFill.tsx` and one or more `transition-all` matches.

- [ ] **Step 3: Implement the transform-based fill and migrate all four progress locations**

```tsx
interface ProgressFillProps {
  value: number;
  className: string;
  duration?: 'fast' | 'standard';
}

export function ProgressFill({ value, className, duration = 'standard' }: ProgressFillProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn('h-full w-full origin-left transition-transform ease-out', duration === 'fast' ? 'duration-150' : 'duration-300', className)}
      style={{ transform: `scaleX(${clampedValue / 100})`, transformOrigin: 'left center' }}
    />
  );
}
```

Migrate Home dashboard total/day/night bars, `DriveSummary`, `UpgradeModal`, and Settings. Replace every touched `transition-all` with the smallest property list that matches its visual change, such as `transition-[transform,border-color,box-shadow] duration-150` for a tappable card and `transition-[background-color,color] duration-150` for navigation.

- [ ] **Step 4: Verify progress values, performance safety, and build output**

Run:

```bash
node --test tests/motion-system.test.mjs
npm run typecheck
npm run lint
npm run build
node --test tests/production-build-integrity.test.mjs
```

Manually log a short sample drive, change its verification state, and confirm all displayed totals and progress percentages remain correct. Inspect the active timer while it is running: the timer digits and ring must not move or resize because of this task.

- [ ] **Step 5: Commit the performance refinements**

```bash
git add src/components/ProgressFill.tsx src/pages/Home.tsx src/components/DriveSummary.tsx src/components/UpgradeModal.tsx src/pages/Settings.tsx src/components/DriveLogEntry.tsx src/App.tsx tests/motion-system.test.mjs
git commit -m "perf(ui): use targeted motion and transform progress"
```

### Task 6: Remove distracting continuous motion and preserve useful feedback

**Files:**

- Modify: `src/components/DriveTimer.tsx`
- Modify: `src/pages/LogDrive.tsx`
- Modify: `tests/motion-system.test.mjs`

**Interfaces:**

- The active timer status remains identifiable through text and a static green dot; it does not use `animate-pulse`.
- The empty History illustration is static; temporary skeletons and explicit loading spinners remain allowed.
- Existing `aria-live`, button labels, and toast behavior stay intact.

- [ ] **Step 1: Write the failing guard against decorative infinite pulse effects**

```js
test('driving status and empty states do not use continuous decorative pulses', async () => {
  const timer = await source('src/components/DriveTimer.tsx');
  const log = await source('src/pages/LogDrive.tsx');

  assert.doesNotMatch(timer, /bg-emerald-400 animate-pulse/);
  assert.doesNotMatch(log, /animate-pulse/);
});

test('loading feedback remains available', async () => {
  const app = await source('src/App.tsx');
  const pdf = await source('src/components/PdfExport.tsx');

  assert.match(app, /animate-pulse/);
  assert.match(pdf, /animate-spin/);
});
```

- [ ] **Step 2: Run the test and confirm the existing timer and empty History pulse fail**

Run: `node --test tests/motion-system.test.mjs`

Expected: FAIL because both non-loading surfaces currently use `animate-pulse`.

- [ ] **Step 3: Replace only decorative pulses**

In `DriveTimer.tsx`, remove `animate-pulse` from the active dot and retain the green dot, its shadow, and the adjacent explicit state text. In `LogDrive.tsx`, remove `animate-pulse` from the empty-state icon. Do not remove `animate-pulse` from `PageSkeleton` or `animate-spin` from genuine waiting states.

- [ ] **Step 4: Verify motion remains purposeful**

Run:

```bash
node --test tests/motion-system.test.mjs tests/ui-accessibility.test.mjs
npm run typecheck
npm run lint
```

Manually start, pause, resume, and stop a sample drive. Confirm the status label, button label, toast, and timer values make each state clear without relying on a moving dot.

- [ ] **Step 5: Commit the driving-safe motion changes**

```bash
git add src/components/DriveTimer.tsx src/pages/LogDrive.tsx tests/motion-system.test.mjs
git commit -m "fix(ui): remove distracting continuous motion"
```

### Task 7: Document, verify across pages, and gate release on a clean startup

**Files:**

- Create: `docs/design/motion-system.md`
- Modify: `tests/motion-system.test.mjs`

**Interfaces:**

- Documents the only allowed motion classes and durations: tap 150ms, content 180–200ms, sheet entry 220ms, sheet exit 140–160ms.
- Documents prohibited motion: parallax, looping decoration, animated timer digits/ring, layout-width progress, and new `transition-all` usage.
- Release gate records whether the previously observed transient `useTheme` error can be reproduced; it is not “fixed” without a reproducible cause.

- [ ] **Step 1: Write the final release-contract test**

```js
test('motion documentation records accessibility and driving-safety rules', async () => {
  const docs = await source('docs/design/motion-system.md');

  assert.match(docs, /prefers-reduced-motion/);
  assert.match(docs, /150ms/);
  assert.match(docs, /220ms/);
  assert.match(docs, /No parallax/);
  assert.match(docs, /Do not animate timer digits or the timer ring/);
});
```

- [ ] **Step 2: Run the test and confirm it fails because the documentation file is absent**

Run: `node --test tests/motion-system.test.mjs`

Expected: FAIL with an `ENOENT` error for `docs/design/motion-system.md`.

- [ ] **Step 3: Write the motion guide and run full verification**

Document the named classes, their intended use, allowed properties, timing table, reduced-motion behavior, the dialog presence pattern, and the driving-app restrictions from this plan. Then run:

```bash
node --test tests/motion-system.test.mjs tests/ui-accessibility.test.mjs tests/theme-provider-startup.test.mjs tests/production-build-integrity.test.mjs
npm run typecheck
npm run lint
npm run build
node --test tests/production-build-integrity.test.mjs
```

Expected: every command passes after the production build.

- [ ] **Step 4: Perform production-style acceptance checks before deployment**

Use a fresh local production preview and test desktop plus a 390px mobile viewport. Check Home, History, Export, Settings, Help, About, Contact, all three new driving guides, State Guide Index, one `/dmv/:stateCode` route, every dialog/sheet, theme toggle, state selector, and PDF loading. For each surface, verify entry motion is short, closing motion completes, controls remain instantly keyboard-operable, and reduced-motion CSS is present in the built stylesheet.

Reload the preview five times from a clean application state. If `useTheme must be used within a ThemeProvider` appears even once, stop this release task and create a separate systematic-debugging investigation with the repeatable steps, browser console output, deployed asset version, service-worker status, and current git commit. Do not guess at a fix or bundle it with the motion release.

- [ ] **Step 5: Commit documentation and release evidence**

```bash
git add docs/design/motion-system.md tests/motion-system.test.mjs
git commit -m "docs(ui): document DriveHours motion system"
```

## Coverage Review

- Missing animation definitions: Task 1.
- Abrupt overlay closures: Tasks 2 and 3.
- FAQ answer appearing abruptly: Task 4.
- Broad transitions and width-animated progress bars: Task 5.
- Distracting timer and empty-state pulse animations: Task 6.
- Reduced-motion, mobile, all-page, production-build, and startup reliability checks: Task 7.
- No heavy animation dependency, parallax, or decorative looping motion: enforced by Global Constraints and Task 7 documentation.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-09-14-motion-system-and-reliability.md`. Two execution options:

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task and review each task before the next.
2. **Inline Execution** — execute tasks in this session with checkpoints after Tasks 1, 3, 5, and 7.
