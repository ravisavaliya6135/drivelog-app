import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = new URL('../', import.meta.url);

async function source(file) {
  return readFile(new URL(file, root), 'utf8');
}

test('state guide SEO has focused CA, NC, and OH copy and one shared source', async () => {
  const seo = await source('src/content/stateGuideSeo.ts');
  const guide = await source('src/pages/StateGuide.tsx');
  const prerender = await source('scripts/prerender.mjs');

  assert.match(seo, /California 50-Hour Driving Log: 10 Night Hours \| DriveHours/);
  assert.match(seo, /North Carolina 60-Hour Driving Log: 10 Night Hours \| DriveHours/);
  assert.match(seo, /Ohio 50-Hour Driving Log & BMV 5791 Affidavit \| DriveHours/);
  assert.match(guide, /getStateGuideSeo/);
  assert.match(prerender, /getStateGuideSeo/);
});

test('night-hours guide is routed, prerendered, and placed in the sitemap', async () => {
  const app = await source('src/App.tsx');
  const ssr = await source('src/prerender/state-guide-ssr.tsx');
  const prerender = await source('scripts/prerender.mjs');

  assert.match(app, /path="\/night-driving-hours"/);
  assert.match(ssr, /NightDrivingHoursGuide/);
  assert.match(prerender, /How Many Night Driving Hours Are Required\? \| DriveHours/);
});

test('built night-hours guide has static metadata and no FAQPage schema', () => {
  const page = fs.readFileSync(path.resolve('dist/night-driving-hours/index.html'), 'utf8');

  assert.match(page, /<link rel="canonical" href="https:\/\/drivehours\.app\/night-driving-hours"/);
  assert.match(page, /How Many Night Driving Hours Are Required\? \| DriveHours/);
  assert.doesNotMatch(page, /"@type":"FAQPage"/);
});
