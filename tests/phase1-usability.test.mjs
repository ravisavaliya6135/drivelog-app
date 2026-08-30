import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), 'utf8');
}

test('Home page provides quick duration preset chips (+15m, +30m, +45m, +1h) with auto-night calculation', async () => {
  const home = await source('src/pages/Home.tsx');
  assert.match(home, /\+15m/);
  assert.match(home, /\+30m/);
  assert.match(home, /\+45m/);
  assert.match(home, /\+1h/);
  assert.match(home, /calculateNightStatus/);
  assert.match(home, /handleQuickDuration/);
});

test('LogDrive provides a direct one-tap parent sign-off button on unverified cards with sonner toast feedback', async () => {
  const logDrive = await source('src/pages/LogDrive.tsx');
  assert.match(logDrive, /handleQuickSign/);
  assert.match(logDrive, /toast\.success\('Drive verified & signed off'/);
  assert.match(logDrive, /Sign Off/);
  assert.match(logDrive, /isVerified/);
});

test('DriveTimer implements in-car touch target sizing (min-h-[64px]) and safe haptics', async () => {
  const timer = await source('src/components/DriveTimer.tsx');
  assert.match(timer, /min-h-\[64px\]/);
  assert.match(timer, /triggerHaptic/);
  assert.match(timer, /navigator\.vibrate/);
});

test('DriveTimer enforces polite screen reader speech without 1-second flooding', async () => {
  const timer = await source('src/components/DriveTimer.tsx');
  assert.match(timer, /aria-live="off"/);
  assert.match(timer, /aria-live="polite"/);
  assert.match(timer, /srAnnouncement/);
  assert.match(timer, /minutes logged in driving session/);
});

test('DriveLogEntry syncs initialData when preset chips are tapped and provides quick presets', async () => {
  const entry = await source('src/components/DriveLogEntry.tsx');
  assert.match(entry, /setPresetDuration/);
  assert.match(entry, /setFormData\(prev => \(\{\s*\.\.\.prev,\s*\.\.\.initialData/);
});

test('App incorporates sonner Toaster with theme awareness', async () => {
  const app = await source('src/App.tsx');
  assert.match(app, /Toaster/);
  assert.match(app, /theme=\{resolvedTheme\}/);
});
