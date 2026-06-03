# Deployment

## Intended deployment target

The operational Employee Hub application is the Next.js app in:

```text
app_v2/
```

Do not deploy the repository root `public/` directory as the production Employee Hub. That directory contains an older static app artifact.

## Local development

```bash
cd app_v2
npm install
npm run dev
```

## Cloudflare deployment commands

Until the package lockfile is regenerated in a dependency hygiene PR, use `npm install` rather than `npm ci`.

```bash
cd app_v2
npm install
npm run preview:cf
npm run deploy:cf
```

## Required environment variables

Set these in the deployment environment. Do not commit secrets.

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
IMPORT_TOKEN
SUPABASE_SERVICE_ROLE_KEY
```

`IMPORT_TOKEN` and `SUPABASE_SERVICE_ROLE_KEY` are only required if the actuals ingestion API route remains enabled in the deployed environment.

## Cloudflare direction

Because `app_v2` is a Next.js app with app routes and an API route, deploy it with a Next.js-capable Cloudflare Workers/OpenNext path, not as a static Pages upload of `public/`.

Recommended deployment root:

```text
app_v2
```

Production verification:

1. The deployed app should serve Next.js routes, not root static assets from `public/`.
2. The login route should load from the Next app.
3. Store goal routes should require authentication after the auth-guard PR is merged.
4. Admin goal routes should require admin access after the auth-guard PR is merged.
