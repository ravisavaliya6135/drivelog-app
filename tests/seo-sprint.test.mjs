import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
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
