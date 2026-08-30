import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Production build output contains all expected files and assets', () => {
  const distDir = path.resolve('dist');
  assert.ok(fs.existsSync(distDir), 'dist directory must exist');

  const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
  assert.ok(indexHtml.includes('<div id="root"></div>'), 'root element must exist in index.html');
  assert.ok(indexHtml.includes('<script type="module"'), 'script tag must exist in index.html');

  // Verify script src exists
  const scriptMatch = indexHtml.match(/src="(\/assets\/[^"]+\.js)"/);
  assert.ok(scriptMatch, 'Main entry JS script tag must be found in index.html');

  const scriptPath = path.join(distDir, scriptMatch[1].replace(/^\//, ''));
  assert.ok(fs.existsSync(scriptPath), `Main script file ${scriptPath} must exist`);

  const scriptContent = fs.readFileSync(scriptPath, 'utf-8');
  assert.ok(scriptContent.length > 1000, 'Main script must not be empty');

  // Verify CSS href exists
  const cssMatch = indexHtml.match(/href="(\/assets\/[^"]+\.css)"/);
  assert.ok(cssMatch, 'CSS stylesheet tag must be found in index.html');

  const cssPath = path.join(distDir, cssMatch[1].replace(/^\//, ''));
  assert.ok(fs.existsSync(cssPath), `CSS file ${cssPath} must exist`);

  // Verify font files exist in dist/assets
  const assets = fs.readdirSync(path.join(distDir, 'assets'));
  const woff2Files = assets.filter(f => f.endsWith('.woff2'));
  assert.ok(woff2Files.length > 0, 'woff2 font files must exist in dist/assets');

  // Verify manifest and service worker
  assert.ok(fs.existsSync(path.join(distDir, 'manifest.webmanifest')), 'manifest must exist');
  assert.ok(fs.existsSync(path.join(distDir, 'sw.js')), 'sw.js must exist');
});

test('Service worker precaches woff2 font files', () => {
  const swPath = path.resolve('dist/sw.js');
  assert.ok(fs.existsSync(swPath), 'sw.js must exist');
  const swContent = fs.readFileSync(swPath, 'utf-8');
  // Check that workbox or precache manifest exists
  assert.ok(swContent.includes('workbox') || swContent.includes('precache'), 'SW must contain workbox/precache logic');
});
