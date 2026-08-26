# Google Search Console Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the provided Google Search Console verification tag to the static application document head.

**Architecture:** `index.html` is Vite's initial HTML document, so a static `<meta>` element makes the token available to Google's verification crawler before React runs. The change has no runtime state or API dependencies.

**Tech Stack:** Vite 5, static HTML, npm production build.

## Global Constraints

- Add exactly `<meta name="google-site-verification" content="pnEUUWqtUSWS3EVQPKb9nc0vwEIZhyGDio_9vhPzKfA" />` inside `index.html`'s `<head>`.
- Do not modify React runtime behavior or add external dependencies.
- Run `npm run build` before committing.
- Commit with exactly `chore: add Google Search Console verification tag` and push `master` to `origin`.

---

## File Structure

- Modify: `index.html` — static HTML head and SEO metadata.

### Task 1: Add and verify the Search Console ownership tag

**Files:**
- Modify: `index.html`
- Test: static HTML token assertion and Vite production build

**Interfaces:**
- Consumes: Google's provided Search Console token `pnEUUWqtUSWS3EVQPKb9nc0vwEIZhyGDio_9vhPzKfA`.
- Produces: an initial HTML response containing one matching `google-site-verification` meta tag.

- [ ] **Step 1: Confirm the verification tag is absent**

Run:

```powershell
node -e "const html=require('fs').readFileSync('index.html','utf8'); if (html.includes('google-site-verification')) process.exit(1)"
```

Expected: Exit code `0`.

- [ ] **Step 2: Insert the exact static head tag**

Add the following line after the existing `<meta name="robots" ... />` tag in `index.html`:

```html
<meta name="google-site-verification" content="pnEUUWqtUSWS3EVQPKb9nc0vwEIZhyGDio_9vhPzKfA" />
```

- [ ] **Step 3: Verify the exact tag appears once**

Run:

```powershell
node -e "const html=require('fs').readFileSync('index.html','utf8'); const tag='<meta name=\"google-site-verification\" content=\"pnEUUWqtUSWS3EVQPKb9nc0vwEIZhyGDio_9vhPzKfA\" />'; if ((html.match(/google-site-verification/g) ?? []).length !== 1 || !html.includes(tag)) process.exit(1)"
```

Expected: Exit code `0`.

- [ ] **Step 4: Run the production build**

Run:

```powershell
npm run build
```

Expected: Exit code `0`.

- [ ] **Step 5: Commit and push the requested change**

Run:

```powershell
git add .
git commit -m "chore: add Google Search Console verification tag"
git push origin master
```

Expected: The remote accepts the `master` push.
