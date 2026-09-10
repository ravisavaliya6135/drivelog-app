# Theme Provider Startup Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent the live DriveHours application from crashing when `AppShell` calls `useTheme()` during the first client render.

**Architecture:** Keep `ThemeProvider` mounted for every render. Its existing client effect continues to resolve and apply the saved light/dark/system preference after mount; only the conditional context-provider bypass is removed. A source-level regression test documents that the provider cannot return children without `ThemeContext.Provider`.

**Tech Stack:** React 18, TypeScript strict mode, Node built-in test runner, Tailwind CSS, Vite.

## Global Constraints

- Keep all functionality offline-first; no runtime network request is introduced.
- Preserve the `drivelog-theme` local-storage key and existing light/dark/system behavior.
- Do not alter timer, IndexedDB, entitlement, or payment logic.
- Use TypeScript strict mode with no `any`.
- Preserve existing visible focus and reduced-motion behavior.

---

### Task 1: Keep the theme context available during first render

**Files:**
- Modify: `tests/theme-provider-startup.test.mjs`
- Modify: `src/hooks/useTheme.tsx:62-70`

**Interfaces:**
- Consumes: `ThemeProvider({ children }: { children: ReactNode })` and `useTheme()` from `src/hooks/useTheme.tsx`.
- Produces: a provider that wraps `children` in `ThemeContext.Provider` for every render, allowing `AppShell` to read `resolvedTheme` immediately.

- [ ] **Step 1: Write the failing regression test**

Create `tests/theme-provider-startup.test.mjs` with a source assertion that rejects the unsafe early return and requires the provider wrapper:

```js
test('ThemeProvider keeps the context available before client effects run', async () => {
  const themeHook = await readFile(new URL('../src/hooks/useTheme.tsx', import.meta.url), 'utf8');

  assert.doesNotMatch(themeHook, /if \(!mounted\)\s*\{\s*return <>\{children\}<\/?>;?\s*\}/s);
  assert.match(themeHook, /return \(\s*<ThemeContext\.Provider value=\{\{ theme, resolvedTheme, setTheme \}\}>/s);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```powershell
& 'C:\Users\saval\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests/theme-provider-startup.test.mjs
```

Expected: FAIL because `ThemeProvider` currently returns `children` before mounting `ThemeContext.Provider`.

- [ ] **Step 3: Implement the minimal provider change**

Delete only this bypass from `src/hooks/useTheme.tsx`:

```tsx
if (!mounted) {
  return <>{children}</>;
}
```

Keep the following `ThemeContext.Provider` return intact.

- [ ] **Step 4: Run the regression test and verify it passes**

Run:

```powershell
& 'C:\Users\saval\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests/theme-provider-startup.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Verify the release artifact**

Run:

```powershell
& 'C:\Users\saval\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' 'C:\Users\saval\drivelog-app\node_modules\typescript\bin\tsc' --noEmit
& 'C:\Users\saval\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' 'C:\Users\saval\drivelog-app\node_modules\eslint\bin\eslint.js' src
& 'C:\Users\saval\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' 'C:\Users\saval\drivelog-app\node_modules\vite\bin\vite.js' build
& 'C:\Users\saval\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test (Get-ChildItem tests -Filter '*.test.mjs' | ForEach-Object { $_.FullName })
```

Expected: typecheck and build exit 0; lint has no errors; every test passes.

- [ ] **Step 6: Commit the implementation**

```powershell
git add -- src/hooks/useTheme.tsx tests/theme-provider-startup.test.mjs
git commit -m "fix: keep theme context available at startup"
```
