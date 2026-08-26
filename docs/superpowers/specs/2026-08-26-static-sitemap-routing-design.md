# Static sitemap and crawler-file routing

## Root cause

`vercel.json` ends with a `/(.*)` rewrite to `index.html`, which also matches static filenames such as `sitemap.xml` and `robots.txt`. In addition, `public/sitemap.xml` contains only ten static routes; the build-time sitemap generator supplies the fifty state-guide routes only in `dist`.

## Change

- Populate `public/sitemap.xml` with the ten existing static routes and the fifty lowercase state-guide routes.
- Preserve `public/robots.txt` with `Sitemap: https://drivehours.app/sitemap.xml`.
- Restrict the SPA fallback in `vercel.json` to paths with no file extension, preserving direct delivery of static files including XML, text, web manifests, images, scripts, and stylesheets.

## Verification

Run `npm run build`. Confirm `dist/sitemap.xml` exists, begins with XML, and includes all sixty URLs. Confirm the Vercel fallback excludes file paths. Commit and push the requested fix to `master`.
