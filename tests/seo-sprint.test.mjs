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

test('state guide treats night-hour rules as state-specific', async () => {
  const guide = await source('src/pages/StateGuide.tsx');

  assert.match(guide, /States set their own night-hour rules/);
  assert.doesNotMatch(guide, /Most states — including/);
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

test('crawler-facing files use DriveHours and state guides avoid FAQPage markup', async () => {
  const indexHtml = await source('index.html');
  const llms = await source('public/llms.txt');
  const guide = await source('src/pages/StateGuide.tsx');

  assert.match(indexHtml, /<title>DriveHours — Supervised Teen Driving Hours Tracker & DMV Log<\/title>/);
  assert.match(indexHtml, /"name": "DriveHours — Teen Driving Hours Tracker"/);
  assert.doesNotMatch(indexHtml, /"@type": "FAQPage"/);
  assert.doesNotMatch(guide, /'@type': 'FAQPage'/);
  assert.match(llms, /^# DriveHours — Teen Driving Hours Tracker/m);
});

test('public component copy no longer calls the product DriveLog', async () => {
  const files = [
    'src/components/SiteFooter.tsx',
    'src/components/PwaInstallPrompt.tsx',
    'src/components/PdfExport.tsx',
    'src/pages/HelpCenter.tsx',
    'src/pages/ContactFeedback.tsx',
  ];

  for (const file of files) {
    assert.doesNotMatch(await source(file), /DriveLog/);
  }
});

test('built priority state pages and sitemap contain the SEO sprint output', () => {
  const pages = [
    ['dist/dmv/ca/index.html', 'California 50-Hour Driving Log: 10 Night Hours | DriveHours', 'ca'],
    ['dist/dmv/nc/index.html', 'North Carolina 60-Hour Driving Log: 10 Night Hours | DriveHours', 'nc'],
    ['dist/dmv/oh/index.html', 'Ohio 50-Hour Driving Log & BMV 5791 Affidavit | DriveHours', 'oh'],
  ];

  for (const [file, title, code] of pages) {
    const html = fs.readFileSync(path.resolve(file), 'utf8');
    const encodedTitle = title.replace(/&/g, '&amp;');

    assert.match(html, new RegExp(encodedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(html, new RegExp(`https://drivehours\\.app/dmv/${code}`));
    assert.doesNotMatch(html, /"@type":"FAQPage"/);
  }

  const sitemap = fs.readFileSync(path.resolve('dist/sitemap.xml'), 'utf8');
  const nightHoursUrl = 'https://drivehours.app/night-driving-hours';
  assert.strictEqual(sitemap.split(nightHoursUrl).length - 1, 1);
});
