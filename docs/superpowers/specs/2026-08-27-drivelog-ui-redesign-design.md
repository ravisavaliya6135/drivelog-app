# DriveLog UI Redesign Design

**Date:** 2026-08-27  
**Status:** Approved visual direction; pending implementation planning

## Purpose

Unify the entire DriveLog PWA around a calm, premium, mobile-first "driving cockpit" design. The redesign must make the next safe action obvious, make DMV progress readable at a glance, and preserve all existing offline-first, timer, entitlement, and PDF behavior.

## Approved Visual Direction

- **Brand mark:** a compact navy rounded-square containing a white outlined `D` and teal dashed centre line. The `D` reads as both DriveLog and a road. It must work at favicon, app-icon, header, and small navigation sizes without relying on raster art.
- **Palette:** navy `#0F172A` anchors primary progress and the brand mark; slate supplies readable neutral text; teal `#0D9488`/`#0F766E` is reserved for progress, active navigation, focus, and the primary action. Day and night states retain amber and indigo cues respectively, with text or labels in addition to color.
- **Surfaces:** light neutral application background, clear white cards, quiet borders, and modest shadow/elevation. Dark mode mirrors the same hierarchy with dark solid surfaces and visible separators. Glass effects remain subtle enough that text and status never lose contrast.
- **Type and spacing:** system/Inter typography, tabular numerals for durations, a 4/8px spacing rhythm, 16px minimum body text, and 22–32px page headings. Pages use a compact top-level heading, then 16–24px section gaps.
- **Interaction:** large, high-confidence controls. All primary driving actions are at least 64px tall; icon controls retain labelled accessible names and at least 44px hit targets. Transitions are limited to 150–250ms opacity/elevation/color changes and are disabled or reduced by `prefers-reduced-motion`.

## Shared Shell

### Header and brand

The sticky header displays the SVG DriveLog mark, product name, current state context where useful, and desktop navigation. The brand mark is implemented once as a reusable component so its proportions are consistent across the header, install surfaces, errors, and future app metadata.

### Navigation

- Desktop keeps four named destinations: Home, History, Export, and Settings.
- Mobile uses the same four destinations in a fixed bottom bar, with a consistent Lucide icon above each label. The active destination has a teal icon/label treatment and a non-color cue such as a filled surface or weight change.
- The center record-drive control remains a prominent, accessible shortcut to the live timer and keeps the current URL/deep-link behavior.
- Header, bottom navigation, and main content preserve safe-area spacing and leave enough bottom padding for the fixed mobile bar.

## Page Designs

### Home dashboard

The dashboard is the canonical "driving cockpit":

1. A brief, state-aware greeting and current requirement context.
2. A navy license-goal card with hours completed, total target, visible progress bar, completion percentage, remaining total hours, and remaining night hours.
3. A single full-width teal **Start a driving session** control.
4. Two compact day/night progress cards and a latest-drive card for supportive detail.
5. Existing setup, sign-off, upgrade, empty, and modal states styled in the same hierarchy without altering business logic.

The active timer remains a distraction-free full-screen experience. No dashboard animation, paywall flow, or presentation layer may change its one-second IndexedDB heartbeat or wall-clock calculation.

### Driving History

Use the same page header hierarchy, a clear **Log past drive** secondary action, and a card-based chronological list. Each entry presents duration first, legal day/night badge, date, supervisor, vehicle, and a concise condition/note preview. Search and filters remain keyboard accessible and become visually quiet segmented controls. Active-drive focus mode remains intact and offers one unambiguous return-to-timer action.

### Export documents

Use a progress-to-readiness layout: show the selected DMV format/state, validation/compliance status, a plain-language next step, and a prominent export action. Keep the existing lazy-loaded client-side PDF generation intact. Preview, incomplete-log states, and Pro gates use the shared cards, badges, and action hierarchy.

### Settings and profiles

Group settings into calm, labelled sections: account and backup, state requirement, drivers and vehicles, appearance, and support. Preserve all current forms and offline behavior. Inputs have visible labels, helper text, error messages adjacent to fields, and 44px+ interactive regions.

### Support, legal, and state-guide pages

State guides, Help, Contact, About, Privacy, and Terms inherit the shared header, readable content measure, heading scale, callouts, and card treatment. They remain content-first; no dashboard-only progress presentation appears on informational pages.

## Component Boundaries

- Add a reusable `DriveLogLogo` SVG component for the approved mark.
- Centralize repeated visual primitives in Tailwind component classes or narrowly scoped shared components: page heading, section label, card, status badge, primary/secondary/quiet buttons, and icon navigation item.
- Preserve domain components (`DriveTimer`, `DriveLogEntry`, `PdfExport`, profile management, and entitlement surfaces) as behavioral owners. Visual refactors must not move or duplicate persistence, payment, timer, or PDF logic.
- Use only the bundled Lucide icon set and local SVG. No icon font, CDN, or new UI dependency is required.

## Accessibility and Responsive Requirements

- Meet WCAG AA 4.5:1 contrast for normal text in both themes.
- Use semantic links, buttons, headings, forms, dialogs, and status messaging; never substitute a clickable `div` for a button.
- Preserve skip link, focus management, keyboard operation, dialog focus restoration, meaningful labels for icon-only controls, and non-color state cues.
- Validate at 375px, large phone, tablet, and desktop widths, including landscape. No content may sit behind fixed header or bottom navigation.
- Preserve mobile safe areas and the app's ≥64px primary drive actions.

## Performance and Verification

- Preserve existing route-level lazy loading and client-side lazy PDF loading.
- Add no runtime network dependency and no design dependency outside the installed stack.
- Avoid layout shift, heavy artwork, and layout-affecting animations.
- Verify typecheck, lint, production build, light and dark modes, keyboard flow, reduced motion, and the critical timer/paywall boundaries after implementation.

## Scope and Non-Goals

This project changes presentation and interaction consistency across all existing routes and shared components. It does not change DriveEntry data, state requirements, timer logic, IndexedDB schema, Supabase/Stripe integration, paid threshold, or PDF document semantics.
