# Deployment

## Current deployment risk

The live `sales-forecasting-web.pages.dev` site has been observed serving the legacy static app from the repository root `public/` directory instead of the intended `app_v2` Next.js app.

The legacy failure signature is:

```text
Uncaught SyntaxError: The requested module './js/auth.js' does not provide an export named 'initAuth'
```

That error belongs to the legacy static bundle:

- `public/index.html`
- `public/main.js`
- `public/js/auth.js`

It is not produced by the intended Next.js application under `app_v2`.

## Intended deployment target

The operational Employee Hub application is:

```text
app_v2/
```

Do not deploy the repository root `public/` directory as the production Employee Hub.

## Local development

```bash
cd app_v2
npm install
npm run dev
```

## Required environment variables

Set these in the deployment environment. Do not commit secrets.

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
IMPORT_TOKEN
SUPABASE_SERVICE_ROLE_KEY
```

`IMPORT_TOKEN` and `SUPABASE_SERVICE_ROLE_KEY` are only required if the `/api/ingest/actuals` route remains enabled in the deployed environment.

## Cloudflare direction

Because `app_v2` is a Next.js app with app routes and an API route, it should be deployed with a Next.js-capable Cloudflare Workers/OpenNext path, not as a static Pages upload of `public/`.

Recommended deployment root:

```text
app_v2
```

Recommended production verification:

1. The deployed app should serve Next.js routes, not `/main.js` from repository-root `public/`.
2. `/auth/login` should load from the Next app.
3. `/goals` should require authentication after the auth-guard PR is merged.
4. `/admin/goals` should require admin access after the auth-guard PR is merged.

## Legacy static app

The root `public/` directory is retained only as a legacy artifact until intentionally removed or archived. It should not be the production Employee Hub deployment target.

Do not patch the legacy static login flow unless a temporary emergency fallback is explicitly required.
