# Google Search Console verification tag

## Goal

Verify ownership of `drivehours.app` in Google Search Console using the provided HTML meta tag.

## Change

Add the exact tag below to the static `<head>` in `index.html`, alongside the existing primary metadata:

```html
<meta name="google-site-verification" content="pnEUUWqtUSWS3EVQPKb9nc0vwEIZhyGDio_9vhPzKfA" />
```

The static document head ensures the tag is present in the initial HTML response for Google's verification crawler. No React, SEO-hook, or runtime behavior will change.

## Verification

Run `npm run build`, then confirm the tag appears once in `index.html`. Stage all current work, commit with `chore: add Google Search Console verification tag`, and push `master` to `origin`.
