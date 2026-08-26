import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), 'utf8');
}

test('global styles support reduced motion and visible keyboard focus', async () => {
  const css = await source('src/index.css');
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /:focus-visible/);
});

test('app navigation includes a skip link and has no decorative role switcher', async () => {
  const app = await source('src/App.tsx');
  assert.match(app, /Skip to main content/);
  assert.doesNotMatch(app, /activeRole/);
});

test('all user-facing modal shells expose dialog semantics', async () => {
  const files = [
    'src/components/AuthModal.tsx',
    'src/components/UpgradeModal.tsx',
    'src/components/PwaInstallPrompt.tsx',
    'src/components/DriveTimer.tsx',
  ];

  for (const path of files) {
    const component = await source(path);
    assert.match(component, /role="dialog"/);
    assert.match(component, /aria-modal="true"/);
  }
});

test('forms use explicit label associations and mobile-sized fields', async () => {
  const files = [
    'src/components/AuthModal.tsx',
    'src/components/DriveLogEntry.tsx',
    'src/components/MultiDriverForm.tsx',
  ];

  for (const path of files) {
    const component = await source(path);
    assert.match(component, /htmlFor=/);
  }

  const css = await source('src/index.css');
  assert.match(css, /min-h-\[44px\]/);
});

test('home drive editing uses semantic controls and no structural emoji', async () => {
  const home = await source('src/pages/Home.tsx');
  const upgrade = await source('src/components/UpgradeModal.tsx');
  const summary = await source('src/components/DriveSummary.tsx');
  const timer = await source('src/components/DriveTimer.tsx');

  assert.doesNotMatch(home, /<div[^>]*onClick=/);
  assert.doesNotMatch(`${home}${upgrade}${summary}${timer}`, /[🎉📝ℹ️]/);
});
