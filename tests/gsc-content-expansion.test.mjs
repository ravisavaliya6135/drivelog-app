import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const guideRoutes = [
  ['/50-hour-driving-log', '50-Hour Driving Log: How to Track Supervised Practice | DriveHours'],
  ['/does-dmv-check-driving-hours', 'Does the DMV Check Your Driving Hours? | DriveHours'],
  ['/night-driving-hours', 'How Many Night Driving Hours Are Required? | DriveHours'],
];

async function source(file) {
  return readFile(new URL(file, root), 'utf8');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test('GSC content cluster is routed and rendered before JavaScript', async () => {
  const [app, ssr, prerender] = await Promise.all([
    source('src/App.tsx'),
    source('src/prerender/state-guide-ssr.tsx'),
    source('scripts/prerender.mjs'),
  ]);

  for (const [route, title] of guideRoutes) {
    assert.match(app, new RegExp(`path="${route}"`));
    assert.match(prerender, new RegExp(escapeRegExp(title)));
  }

  assert.match(ssr, /FiftyHourDrivingLogGuide/);
  assert.match(ssr, /DmvDrivingHoursVerificationGuide/);
});

test('priority state guides expose useful national-guide links', async () => {
  const guide = await source('src/pages/StateGuide.tsx');

  assert.match(guide, /priorityContentStateCodes/);
  assert.match(guide, /to="\/50-hour-driving-log"/);
  assert.match(guide, /to="\/does-dmv-check-driving-hours"/);
  assert.match(guide, /to="\/night-driving-hours"/);
});

test('built GSC guide pages have static metadata and no FAQPage schema', () => {
  for (const [route, title] of guideRoutes) {
    const html = fs.readFileSync(path.resolve(`dist${route}/index.html`), 'utf8');
    assert.match(html, new RegExp(escapeRegExp(title)));
    assert.match(html, new RegExp(`<link rel="canonical" href="https://drivehours\\.app${route}"`));
    assert.doesNotMatch(html, /"@type":"FAQPage"/);
  }
});
