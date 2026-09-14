import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const source = (path) => readFile(new URL(path, root), 'utf8');

test('Tailwind defines every motion class used by DriveHours', async () => {
  const config = await source('tailwind.config.js');

  for (const name of ['fade-in', 'fade-out', 'slide-up', 'slide-down']) {
    assert.match(config, new RegExp(`[\'\"]${name}[\'\"]`));
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

test('animated presence honors reduced motion and keeps exit state explicit', async () => {
  const hook = await source('src/hooks/useAnimatedPresence.ts');

  assert.match(hook, /export function useAnimatedPresence\(/);
  assert.match(hook, /'entering' \| 'entered' \| 'exiting'/);
  assert.match(hook, /prefers-reduced-motion: reduce/);
  assert.match(hook, /window\.setTimeout/);
});
