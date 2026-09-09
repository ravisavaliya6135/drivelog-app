import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), 'utf8');
}

test('vercel.json configures permanent 301 redirect from www to non-www canonical domain', async () => {
  const vercelRaw = await source('vercel.json');
  const vercel = JSON.parse(vercelRaw);
  
  const wwwRedirect = vercel.redirects?.find(r => 
    r.has?.some(h => h.type === 'host' && h.value === 'www\\.drivehours\\.app')
  );
  
  assert.ok(wwwRedirect, 'Missing redirect rule for www.drivehours.app');
  assert.strictEqual(wwwRedirect.statusCode, 301, 'www redirect status code must be 301');
  assert.strictEqual(wwwRedirect.source, '/:path*');
  assert.strictEqual(wwwRedirect.destination, 'https://drivehours.app/:path*');
});

test('public/sitemap.xml contains only non-www https://drivehours.app URLs', async () => {
  const sitemap = await source('public/sitemap.xml');
  
  assert.doesNotMatch(sitemap, /www\.drivehours\.app/, 'sitemap.xml must not contain www.drivehours.app');
  assert.match(sitemap, /<loc>https:\/\/drivehours\.app\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/drivehours\.app\/about<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/drivehours\.app\/help<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/drivehours\.app\/privacy<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/drivehours\.app\/terms<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/drivehours\.app\/contact<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/drivehours\.app\/dmv<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/drivehours\.app\/dmv\/ca<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/drivehours\.app\/dmv\/tx<\/loc>/);
});

test('public/robots.txt points to non-www sitemap.xml', async () => {
  const robots = await source('public/robots.txt');
  
  assert.doesNotMatch(robots, /www\.drivehours\.app/);
  assert.match(robots, /Sitemap:\s+https:\/\/drivehours\.app\/sitemap\.xml/);
});

test('public/llms.txt uses non-www https://drivehours.app URLs', async () => {
  const llms = await source('public/llms.txt');
  
  assert.doesNotMatch(llms, /www\.drivehours\.app/);
  assert.match(llms, /https:\/\/drivehours\.app\//);
});

test('index.html uses non-www domain for canonical, open graph, twitter, and schema', async () => {
  const indexHtml = await source('index.html');
  
  assert.doesNotMatch(indexHtml, /www\.drivehours\.app/);
  assert.match(indexHtml, /<link rel="canonical" href="https:\/\/drivehours\.app\/" \/>/);
  assert.match(indexHtml, /<meta property="og:url" content="https:\/\/drivehours\.app\/" \/>/);
  assert.match(indexHtml, /<meta property="og:image" content="https:\/\/drivehours\.app\/og-image\.png" \/>/);
  assert.match(indexHtml, /<meta name="twitter:url" content="https:\/\/drivehours\.app\/" \/>/);
  assert.match(indexHtml, /<meta name="twitter:image" content="https:\/\/drivehours\.app\/og-image\.png" \/>/);
  assert.match(indexHtml, /"@id":\s*"https:\/\/drivehours\.app\/#webapp"/);
  assert.match(indexHtml, /"url":\s*"https:\/\/drivehours\.app\/"/);
});

test('prerender script and SEO hooks use non-www SITE_URL', async () => {
  const prerender = await source('scripts/prerender.mjs');
  assert.match(prerender, /const SITE_URL = 'https:\/\/drivehours\.app';/);
  assert.doesNotMatch(prerender, /www\.drivehours\.app/);

  const useSeo = await source('src/hooks/useSeo.ts');
  assert.match(useSeo, /const SITE_URL = 'https:\/\/drivehours\.app';/);
  assert.doesNotMatch(useSeo, /www\.drivehours\.app/);

  const stateGuide = await source('src/pages/StateGuide.tsx');
  assert.match(stateGuide, /const SITE_URL = 'https:\/\/drivehours\.app';/);
  assert.match(stateGuide, /canonicalUrl:\s*getStateGuideCanonical\(seoState\)/);
  assert.doesNotMatch(stateGuide, /www\.drivehours\.app/);
});

test('React pages use non-www canonical URLs', async () => {
  const pages = [
    ['src/pages/Home.tsx', 'https://drivehours.app/'],
    ['src/pages/About.tsx', 'https://drivehours.app/about'],
    ['src/pages/ContactFeedback.tsx', 'https://drivehours.app/contact'],
    ['src/pages/ExportDocs.tsx', 'https://drivehours.app/export'],
    ['src/pages/HelpCenter.tsx', 'https://drivehours.app/help'],
    ['src/pages/LogDrive.tsx', 'https://drivehours.app/log'],
    ['src/pages/PrivacyPolicy.tsx', 'https://drivehours.app/privacy'],
    ['src/pages/Settings.tsx', 'https://drivehours.app/settings'],
    ['src/pages/StateGuideIndex.tsx', 'https://drivehours.app/dmv'],
    ['src/pages/TermsOfUse.tsx', 'https://drivehours.app/terms'],
  ];

  for (const [file, canonical] of pages) {
    const content = await source(file);
    assert.doesNotMatch(content, /www\.drivehours\.app/, `${file} must not contain www.drivehours.app`);
    assert.match(content, new RegExp(`canonicalUrl:\\s*['"]${canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`));
  }
});

test('PDF generation and Edge functions use non-www domain', async () => {
  const pdf = await source('src/utils/pdf.tsx');
  assert.doesNotMatch(pdf, /www\.drivehours\.app/);
  assert.match(pdf, /drivehours\.app/);

  const edgeFunc = await source('supabase/functions/create-checkout-session/index.ts');
  assert.doesNotMatch(edgeFunc, /www\.drivehours\.app/);
  assert.match(edgeFunc, /https:\/\/drivehours\.app/);
});
