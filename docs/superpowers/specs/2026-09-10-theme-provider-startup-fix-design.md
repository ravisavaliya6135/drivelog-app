# Theme Provider Startup Fix

## Goal

Restore every DriveHours route by ensuring `useTheme()` always reads from a mounted `ThemeProvider` on the first client render.

## Scope

- Keep the existing light, dark, and system theme choices.
- Keep the existing local-storage preference key and DOM theme-class behavior.
- Remove the first-render path where `ThemeProvider` returns its children without a context provider.
- Add a regression test that identifies the unsafe provider-bypass path.

## Design

`ThemeProvider` will always render `ThemeContext.Provider`. Its initial `resolvedTheme` remains the existing light default until the client effect resolves the saved or system preference. This keeps the provider available to `AppShell`, which reads `useTheme()` to configure toast styling, while retaining the current post-mount theme resolution.

No route, timer, IndexedDB, entitlement, or visual-layout behavior changes. This work fixes only the startup crash found on the live site.

## Validation

1. A new source-level regression test fails against the current conditional provider return.
2. The smallest provider change makes that test pass.
3. TypeScript, lint, production build, and the full test suite pass.
