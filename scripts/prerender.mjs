/**
 * Post-build SSG prerender step for DriveLog.
 *
 * Generates fully static HTML for all 50 /dmv/:stateCode routes so crawlers
 * see complete content (H1, table, meta tags, canonical URL, CTA) without
 * executing JavaScript. The rest of the app remains client-rendered.
 *
 * Usage: node scripts/prerender.mjs   (run after `vite build`)
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(rootDir, 'dist');
const ssrDir = join(rootDir, 'dist-ssr');

const { renderStateGuide, renderPublicPage, stateData } = require(join(ssrDir, 'state-guide-ssr.js'));

const SITE_URL = 'https://drivehours.app';
const template = readFileSync(join(distDir, 'index.html'), 'utf8');

if (!template.includes('<div id="root"></div>')) {
  throw new Error('Prerender: index.html template does not contain an empty <div id="root"></div>');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function setMetaContent(html, attr, key, value) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern =
    attr === 'property'
      ? new RegExp(`<meta\\s+property="${escapedKey}"\\s+content="[^"]*"\\s*/?>`)
      : new RegExp(`<meta\\s+(?:name|property)="${escapedKey}"\\s+content="[^"]*"\\s*/?>`);
  if (pattern.test(html)) {
    return html.replace(pattern, `<meta ${attr}="${key}" content="${escapeHtml(value)}" />`);
  }
  return html;
}

let generated = 0;

const publicPages = [
  ['/dmv', 'Teen Driving Log Requirements by State (All 50) | DriveHours', 'Browse supervised driving hour requirements, night-hour rules, and official DMV log forms for all 50 US states.'],
  ['/about', 'About DriveHours — Why We Built It | DriveHours', "Why we built an offline-first, ad-free driving hours tracker for teens and parents."],
  ['/help', 'Help Center | DriveHours', 'Answers about logging drives, night hours, parent verification, offline PDF export, and DriveHours Pro.'],
  ['/privacy', 'Privacy Policy | DriveHours', 'What DriveHours stores on your device, what leaves it, and why.'],
  ['/terms', 'Terms of Use | DriveHours', 'Terms for using DriveHours, the offline-first teen driving hours tracker.'],
  ['/contact', 'Contact & Feedback | DriveHours', 'Questions, bugs, or DMV feedback about DriveHours? Contact the team.'],
];

for (const [routePath, title, description] of publicPages) {
  const canonical = `${SITE_URL}${routePath}`;
  const appHtml = renderPublicPage(routePath);
  let html = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
  html = html
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonical}" />`);
  html = setMetaContent(html, 'name', 'title', title);
  html = setMetaContent(html, 'name', 'description', description);
  html = setMetaContent(html, 'property', 'og:title', title);
  html = setMetaContent(html, 'property', 'og:description', description);
  html = setMetaContent(html, 'property', 'og:url', canonical);
  html = setMetaContent(html, 'name', 'twitter:title', title);
  html = setMetaContent(html, 'name', 'twitter:description', description);
  html = setMetaContent(html, 'name', 'twitter:url', canonical);
  const outDir = join(distDir, routePath);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html);
}

const noindexAppPages = [
  ['/log', 'Driving History & Practice Log | DriveHours', 'Chronological log of supervised teen driving sessions with day/night filtering, road conditions, and supervisor signatures.'],
  ['/export', 'DMV Driving Log PDF Export & 50-State Compliance | DriveHours', 'Generate an official state DMV-compliant supervised driving practice log PDF report for your road test licensing appointment.'],
  ['/settings', 'State DMV Requirements & App Settings | DriveHours', 'Configure your state driving targets, manage student drivers and supervisor profiles, and customize app appearance.'],
];

for (const [routePath, title, description] of noindexAppPages) {
  const canonical = `${SITE_URL}${routePath}`;
  let html = template
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta name="robots" content="[^"]*" \/>/, '<meta name="robots" content="noindex, follow" />');
  html = setMetaContent(html, 'name', 'title', title);
  html = setMetaContent(html, 'name', 'description', description);
  html = setMetaContent(html, 'property', 'og:title', title);
  html = setMetaContent(html, 'property', 'og:description', description);
  html = setMetaContent(html, 'property', 'og:url', canonical);
  html = setMetaContent(html, 'name', 'twitter:title', title);
  html = setMetaContent(html, 'name', 'twitter:description', description);
  html = setMetaContent(html, 'name', 'twitter:url', canonical);
  const outDir = join(distDir, routePath);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html);
}

for (const state of stateData) {
  const code = state.code.toLowerCase();
  const routePath = `/dmv/${code}`;
  const canonical = `${SITE_URL}${routePath}`;
  const title = `${state.name} Teen Driving Log Requirements | DriveHours`;
  const description = `Track your ${state.name} supervised driving hours with legal night detection. DMV-ready PDF export. Free to start.`;

  // Render the full page content server-side (no JS execution needed)
  const appHtml = renderStateGuide(routePath);

  let html = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

  // Bake per-state meta tags into the static payload
  html = html
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonical}" />`);

  html = setMetaContent(html, 'name', 'title', title);
  html = setMetaContent(html, 'name', 'description', description);
  html = setMetaContent(html, 'property', 'og:title', title);
  html = setMetaContent(html, 'property', 'og:description', description);
  html = setMetaContent(html, 'property', 'og:url', canonical);
  html = setMetaContent(html, 'name', 'twitter:title', title);
  html = setMetaContent(html, 'name', 'twitter:description', description);
  html = setMetaContent(html, 'name', 'twitter:url', canonical);

  const outDir = join(distDir, 'dmv', code);
  mkdirSync(outDir, { recursive: true });
  // Directory form: served at /dmv/<code> by Vercel/nginx (directory index)
  writeFileSync(join(outDir, 'index.html'), html);
  // Flat form: guarantees a real static file for `vite preview` and any host
  // without directory-index resolution
  writeFileSync(join(distDir, 'dmv', `${code}.html`), html);
  generated++;
}

console.log(`[prerender] Generated ${generated} static /dmv/:stateCode pages into dist/dmv/`);

// Regenerate sitemap.xml including all state guide URLs (replaces public/sitemap.xml in dist)
const staticPaths = ['/', '/about', '/help', '/privacy', '/terms', '/contact', '/dmv'];
const today = new Date().toISOString().split('T')[0];
const urls = [
  ...staticPaths.map(
    p =>
      `  <url><loc>${SITE_URL}${p}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${p === '/' ? '1.0' : '0.8'}</priority></url>`
  ),
  ...stateData.map(
    s =>
      `  <url><loc>${SITE_URL}/dmv/${s.code.toLowerCase()}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>`
  ),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
writeFileSync(join(distDir, 'sitemap.xml'), sitemap);
console.log(`[prerender] Regenerated sitemap.xml with ${urls.length} URLs`);

// Remove the temporary SSR bundle — it is not needed at runtime
if (existsSync(ssrDir)) {
  rmSync(ssrDir, { recursive: true, force: true });
  console.log('[prerender] Cleaned up dist-ssr/');
}
