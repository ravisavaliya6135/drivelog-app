# UI/UX Audit Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve the UI/UX audit findings without changing driving-timer or entitlement behavior.

**Architecture:** Add a reusable dialog behavior hook for modal semantics, Escape handling, focus trapping, and focus restoration. Apply semantic and sizing fixes at shared style/component boundaries, then adjust route components that contain non-semantic interactions.

**Tech Stack:** React 18, TypeScript strict, Tailwind CSS 3.4, Node built-in test runner.

## Global Constraints

- Preserve the 1-second IndexedDB timer heartbeat and wall-clock duration math.
- Preserve the paywall boundary at exactly 20.0 hours.
- Keep all UI functionality offline-first with no CDN dependencies.
- Maintain WCAG AA contrast and 64px primary touch targets.

### Task 1: Add regression coverage

**Files:**
- Create: `tests/ui-accessibility.test.mjs`

- [ ] Add assertions for dialog semantics, reduced motion, skip navigation, explicit label associations, semantic recent-drive controls, and no emoji icons.
- [ ] Run `node --test tests/ui-accessibility.test.mjs` and confirm red failures.

### Task 2: Add accessible dialog behavior

**Files:**
- Create: `src/hooks/useAccessibleDialog.ts`
- Modify: modal-owning components and pages

- [ ] Trap focus inside open dialogs, restore trigger focus on close, handle Escape, and expose dialog props.
- [ ] Apply `role="dialog"`, `aria-modal`, labelled heading IDs, and labelled close buttons.

### Task 3: Repair interaction and visual policy findings

**Files:**
- Modify: `src/App.tsx`, `src/index.css`, `src/pages/Home.tsx`, form components, selector, modal components, timer-related display components

- [ ] Remove the non-functional role switcher.
- [ ] Use buttons/links for all interactive cards; make state selection keyboard-operable.
- [ ] Enforce touch targets, visible focus, min 12px helper text, AA muted text, and reduced motion.
- [ ] Replace structural emoji with Lucide icons.

### Task 4: Verify and deliver

**Files:**
- Modify: affected source and test files only

- [ ] Run source regression tests, `npm run typecheck`, `npm run lint`, and `npm run build`.
- [ ] Commit and push the verified remediation.
