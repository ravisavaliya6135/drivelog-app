import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), 'utf8');
}

test('the application shell and footer share the DriveLog logo', async () => {
  const app = await source('src/App.tsx');
  const footer = await source('src/components/SiteFooter.tsx');

  assert.match(app, /import \{ DriveLogLogo \} from '.\/components\/DriveLogLogo'/);
  assert.match(app, /<DriveLogLogo/);
  assert.match(footer, /import \{ DriveLogLogo \} from '.\/DriveLogLogo'/);
  assert.match(footer, /<DriveLogLogo/);
});

test('mobile destination links have explicit accessible names', async () => {
  const app = await source('src/App.tsx');

  for (const label of ['Home', 'Driving history', 'Export documents', 'Settings']) {
    assert.match(app, new RegExp(`aria-label="${label}"`));
  }
});

test('DriveLog logo exposes the road marking and optional title semantics', async () => {
  const logo = await source('src/components/DriveLogLogo.tsx');

  assert.match(logo, /strokeDasharray=/);
  assert.match(logo, /title \? <title/);
  assert.match(logo, /aria-hidden=\{title \? undefined : true\}/);
  assert.match(logo, /aria-labelledby=\{title \? titleId : undefined\}/);
});
