# DriveHours production domain cleanup

## Goal

Use `https://drivehours.app` as the production URL throughout the repository and redirect the legacy Vercel hostname to it.

## Current state

The inspected SEO hook, state-guide page, root HTML, robots file, and sitemap already contain the DriveHours production URL. No remaining `drivelog.app` or `drivelog-app.vercel.app` references were found in the repository search.

## Change

Add a host-scoped Vercel redirect in `vercel.json` that:

- matches requests whose host is `drivelog-app.vercel.app`;
- preserves the requested path;
- redirects to the corresponding `https://drivehours.app` URL; and
- uses status code 301.

The host constraint avoids applying the redirect to requests already served from the production domain.

## Verification

After the configuration update, rescan tracked source and configuration files for both legacy domains, validate `vercel.json` as JSON, then run:

```powershell
npm run typecheck
npm run lint
npm run build
```

Finally, stage all current work as requested, commit with `chore: production domain cleanup for drivehours.app`, and push `master` to `origin`.
