# Udalla

Business registration and compliance for Nigeria, the United Kingdom and the United States.

## Stack

- Next.js 16 (App Router) with TypeScript strict
- Tailwind CSS v4
- Supabase for auth, Postgres and private document storage (adapter ready)
- Demo store when `DEMO_MODE=true` (in-memory in dev, D1-backed in hosted preview)
- Vitest, ESLint and Prettier
- GitHub Actions CI

## Running the app

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000. With no Supabase keys and `DEMO_MODE=false` the app shows a configuration screen instead of falling back to demo data. Set `DEMO_MODE=true` for the preview with demo accounts and sample orders.

## Environment

See `.env.example` for every variable. Key values:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public origin for canonical URLs, sitemap and robots |
| `DEMO_MODE` | `true` enables the demo store and demo sign in |
| `SESSION_SECRET` | Signs session cookies (`openssl rand -hex 32`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase public key (fallback: `NEXT_PUBLIC_SUPABASE_ANON_KEY`) |
| `SUPABASE_SECRET_KEY` | Server key (fallback: `SUPABASE_SERVICE_ROLE_KEY`) |
| `PAYSTACK_SECRET_KEY` | Live Paystack payments (absent uses the test payment path) |
| `RESEND_API_KEY` | Transactional email (absent logs to the demo outbox) |
| `CRON_SECRET` | Bearer token for the reminder endpoint |

## Supabase

Schema, row level security policies and storage rules are in `supabase/migrations`.

1. Create a project and copy the URL and keys into `.env.local`.
2. Run `supabase db push` or apply the SQL in `0001_init.sql`.
3. Keep the `documents` bucket private. Uploads go through the server and downloads use signed URLs that expire after 60 seconds.

RLS is enabled on every table and defaults to deny. Customers read and write their own rows, lawyers read matters assigned to them, and admins have full access through the `profiles.role` claim.

## Scripts

```bash
npm run dev          # development
npm run build        # production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm test             # vitest
npm run audit:copy   # wording and dash audit
npm run crawl http://localhost:3000
```

## Project notes

- Prices, government fees and contact details live in `src/config/pricing.ts` and `src/config/brand.ts`. Admin overrides are applied in `src/lib/catalog.ts`.
- The data store is behind a single interface in `src/lib/store`. `getStore()` returns the Supabase adapter when configured, or the demo adapter when `DEMO_MODE=true`.
- Wording: no em dashes, no emoji, real apostrophes, short sentences. `Udalla Global Concepts is not a law firm and does not provide legal advice.` Filings are prepared and submitted by Udalla's filing team. Licensed partner lawyers handle regulatory compliance.

## Known gaps

- Demo mode stores preview data in memory or the preview D1 state; it is not a durable production record.
- `sessionStorage` is used for client convenience; server-side state remains authoritative.
- Payment and email integrations are wired behind providers but need production credentials and webhook verification in the target environment.
- Live registry filing, document review and lawyer assignment are operational workflows; the app tracks and surfaces them but does not replace them.
