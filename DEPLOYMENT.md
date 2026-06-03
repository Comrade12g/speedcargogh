# Deploy Speed Cargo with Backend

The site backend is hosted in Lovable Cloud. Cloudflare or Vercel only needs to build and serve this app with the correct environment variables.

## Required environment variables

Add these in your host dashboard before deploying:

| Name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://rqmxolzibpoiqpqvhigj.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6InJxbXhvbHppYnBvaXFwcXZoaWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNjIxMTQsImV4cCI6MjA5NTYzODExNH0.Je1IXnfRlazgux_pwtV2aiEa-s1FVyXQTpDSGy7nb_8` |
| `VITE_SUPABASE_PROJECT_ID` | `rqmxolzibpoiqpqvhigj` |
| `SUPABASE_URL` | `https://rqmxolzibpoiqpqvhigj.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | same value as `VITE_SUPABASE_PUBLISHABLE_KEY` |

Only add `SUPABASE_SERVICE_ROLE_KEY` if you later add server-side admin operations. Do not prefix it with `VITE_`.

## Cloudflare Pages

1. Create a **Pages** project connected to the GitHub repo.
2. Set **Build command** to:
   ```bash
   bun run build:cloudflare
   ```
3. Set **Build output directory** to:
   ```bash
   dist
   ```
4. Add all required environment variables above in **Settings → Environment variables** for Production and Preview.
5. Redeploy.

## Vercel

1. Import the GitHub repo in Vercel.
2. Keep the default install command, or use `bun install`.
3. `vercel.json` already sets the build command and output directory.
4. Add all required environment variables above in **Settings → Environment Variables** for Production, Preview, and Development.
5. Redeploy.

## What should work after deploy

- Public website content loads from the backend.
- Quote forms save into the backend.
- `/login` signs in admins.
- `/admin` can edit site content and manage quote requests.

If the deployed site shows a 500 error, the missing variable is usually `SUPABASE_URL` or `SUPABASE_PUBLISHABLE_KEY`. If the public site loads but admin login fails, check the `VITE_` variables.