import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), 'utf8');
}

test('AuthModal has removed the inline orange warning banner', async () => {
  const authModal = await source('src/components/AuthModal.tsx');
  assert.doesNotMatch(authModal, /Supabase Auth keys are pending in environment/);
  assert.doesNotMatch(authModal, /will simulate login for local testing/);
});

test('AuthModal uses DriveHours branding and quiet console.warn', async () => {
  const authModal = await source('src/components/AuthModal.tsx');
  assert.match(authModal, /DriveHours/);
  assert.match(authModal, /console\.warn/);
});

test('AuthContext gracefully falls back with console.warn when Supabase keys are missing', async () => {
  const authContext = await source('src/contexts/AuthContext.tsx');
  assert.match(authContext, /console\.warn\('\[DriveHours Auth\]/);
  assert.match(authContext, /return \{ error: null \}/);
});

test('AuthModal displays clean success message on submission', async () => {
  const authModal = await source('src/components/AuthModal.tsx');
  assert.match(authModal, /Magic link sent! Check your inbox/);
  assert.match(authModal, /Check Your Email/);
});
