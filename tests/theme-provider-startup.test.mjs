import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('ThemeProvider keeps the context available before client effects run', async () => {
  const themeHook = await readFile(new URL('../src/hooks/useTheme.tsx', import.meta.url), 'utf8');

  assert.doesNotMatch(themeHook, /if \(!mounted\)\s*\{\s*return <>\{children\}<\/?\>;?\s*\}/s);
  assert.match(themeHook, /return \(\s*<ThemeContext\.Provider value=\{\{ theme, resolvedTheme, setTheme \}\}>/s);
});
