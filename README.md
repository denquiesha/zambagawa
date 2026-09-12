# ZambaGawa

ZambaGawa is a database-backed local-services booking MVP for Zambales. It helps residents find nearby providers by service and municipality, compare rates and ratings, and send a booking request with a reference number.

## What works

- Provider directory loaded from Supabase
- Search by provider, service, or category
- Municipality and category filtering
- Responsive provider cards
- Booking form with server-side validation
- Persistent booking records and unique references
- Graceful preview mode before database connection

## Stack

- HTML, CSS, and browser JavaScript
- Vercel Node.js Functions under `/api`
- Supabase PostgreSQL via its REST API

No database secrets are exposed in browser code. The Supabase secret key is used only inside Vercel Functions.

## Run the database

1. Create a free Supabase project.
2. Open **SQL Editor** in Supabase.
3. Copy and run [`supabase/schema.sql`](supabase/schema.sql). This creates the provider and booking tables and inserts the portfolio sample providers.
4. In Supabase, copy the project URL and a secret key from **Project Settings → API Keys**.

## Deploy on Vercel

1. In Vercel, select **Add New → Project**.
2. Import `denquiesha/zambagawa` from GitHub.
3. Leave the framework preset as **Other** and deploy.
4. In the Vercel project, open **Settings → Environment Variables** and add:

   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`

5. Redeploy the latest deployment.
6. Check `/api/health`. It should return `{"status":"ok","databaseConfigured":true}`.

Git integration is enabled for this project. Vercel will automatically publish new production deployments whenever changes are pushed to `main`.

## Local preview

The page can be opened through any local static server. Without Vercel Functions and Supabase variables it intentionally displays portfolio preview data; booking submissions require the deployed backend.

## Important

- Never commit `.env` or the Supabase secret key.
- The displayed providers are fictional portfolio sample data.
- Before accepting real public bookings, add spam protection, privacy terms, provider consent, and an admin workflow.

## Designer and developer

Daniele Quiesha E. Diaz — UI/UX and web design, Zambales, Philippines.
