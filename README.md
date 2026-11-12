# Udalla

Business registration and compliance for founders in Nigeria, the United Kingdom and the United States. One guided order from country and structure through to certificate, then reminders and compliance filings handled by licensed partner lawyers.

- Brand: Udalla
- Legal name: Udalla Global Concepts (confirm the legal ending with the owner)
- Domain: udalla.org
- Live preview: https://site-47eca64bf48843c49e8be2cdd3730edc.freebuff.page

Brand name, legal name, domain and contact details live in one file: `src/config/brand.ts`.

## Stack

- Next.js App Router (16.x) with TypeScript strict, server rendered, not a static export
- Tailwind CSS v4, custom design system in `src/app/globals.css`
- Fraunces, Instrument Sans and IBM Plex Mono through `next/font`
- One store interface with two adapters: Supabase and a demo adapter
- Zod validation, signed session cookies, private document storage with 60 second signed links
- Vitest for the authorisation and signed link tests

## Run locally in 10 minutes

```bash
git clone <repo> udalla && cd udalla
npm ci
cp .env.example .env.local
```

Open `.env.local` and set:

```bash
DEMO_MODE=true
SESSION_SECRET=replace-with-openssl-rand-hex-32
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Then:

```bash
npm run dev
```

Open http://localhost:3000. Go to `/login` and use the demo accounts:

| Role | Email | Use |
| --- | --- | --- |
| Customer | demo.customer@udalla.org | Two orders, one compliance matter, calendar |
| Lawyer | demo.lawyer@udalla.org | Only matters assigned to this lawyer |
| Admin | demo.admin@udalla.org | Orders, pricing, content, lawyers, leads, outbox |

Demo sign in is a button on the login page, no password. The demo store lives in memory and resets when the server restarts. On the hosted preview it also writes to a small D1 table (`demo_state`), so drafts, orders and admin edits survive across server instances. Reset it by clearing that row, or set `DEMO_MODE=false` to turn the whole demo off.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint, including Next.js rules |
| `npm run typecheck` | `tsc --noEmit` with strict mode |
| `npm test` | Vitest: document access, signed link expiry |
| `npm run format` | Prettier over the repo |
| `npm run crawl` | Crawl every page from the sitemap and check status and copy |
| `npm run audit:copy` | Fail on em dashes, banned wording, forbidden fonts |

## Environment

Everything is optional for the demo. Production without Supabase keys and without `DEMO_MODE=true` shows a configuration error page, never demo data.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Yes in production | Canonical origin, sitemap, Open Graph. Defaults to https://udalla.org |
| `DEMO_MODE` | No | Only the literal `true` turns on the demo adapter and banner |
| `SESSION_SECRET` | Yes in production | Signs session cookies. 32 bytes, never commit it |
| `CONTACT_EMAIL` | No | Overrides the brand default |
| `CONTACT_PHONE` | No | Overrides the brand default |
| `WHATSAPP_NUMBER` | No | Digits only, used for wa.me links |
| `NEXT_PUBLIC_SUPABASE_URL` | For live data | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For live data | Browser safe key, used for auth |
| `SUPABASE_SERVICE_ROLE_KEY` | For live data | Server only, privileged writes and storage |
| `SUPABASE_STORAGE_BUCKET` | For live data | Private bucket, defaults to `documents` |
| `PAYSTACK_SECRET_KEY` | For live payments | Naira checkout and webhook signature |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | For live payments | Optional, reserved for inline checkout |
| `SECOND_GATEWAY_SECRET_KEY` | No | Slot for the second payment provider |
| `SECOND_GATEWAY_WEBHOOK_SECRET` | No | Signature secret for that provider |
| `CRON_SECRET` | For reminders | Required by `/api/cron/reminders` |
| `RESEND_API_KEY` | For live email | Without it, email is logged to the admin outbox |
| `EMAIL_FROM` | No | Sender address, defaults to notifications@udalla.org |
| `RATE_LIMIT_WINDOW_SECONDS` | No | Default 60 |
| `RATE_LIMIT_MAX_REQUESTS` | No | Default 20 |

## Deploy

### Vercel

1. Import the repository, framework preset Next.js, Node 22.
2. Set every production variable from the table above. At minimum `NEXT_PUBLIC_SITE_URL`, `SESSION_SECRET`, and either the Supabase pair or `DEMO_MODE=true`.
3. Deploy from `main`. Every pull request gets a preview deployment.

### Supabase

1. Create a project, then run the SQL in order: `supabase/migrations/0001_init.sql`, then `0002_seed.sql`.
2. Create a private storage bucket named `documents` (the migration does this) and confirm it is not public.
3. Put the project URL and keys in the environment. The Supabase adapter activates automatically when both keys exist.
4. Test row level security with two real accounts before accepting real documents. The policies are in `0001_init.sql`.

### Payments

Set `PAYSTACK_SECRET_KEY` and point the Paystack webhook at `https://your-domain/api/payments/paystack`. The handler verifies the signature on the raw body and is idempotent. With no key, checkout shows a clearly labelled test payment that creates the order without charging anything.

### Reminders

`POST /api/cron/reminders` with `Authorization: Bearer $CRON_SECRET` or `?secret=$CRON_SECRET`. Schedule it daily. It sends the 30 day and 7 day reminders and skips anything already sent. The admin outbox button runs the same code for testing.

## How to add a country

1. Add the country to `src/config/countries.ts` with its currency, starting price, mark and government line.
2. Add its services in `src/config/pricing.ts`, each with packages, government fee, add-ons, steps and FAQs.
3. Add compliance services for it in the same file.
4. The header, footer, home country tabs, pricing table, sitemap and checkout all read those collections, so no page changes are needed.

## How to add a service

Add one object to `services` in `src/config/pricing.ts`:

- `slug`, `country`, `name`, `navLabel`, `shortDescription`, `description`
- `currency`, `governmentFee`, `governmentFeeFrom`, `governmentFeeLabel`, `processing`
- `packages` built with `buildPackages` so the tier copy stays consistent
- `addOns`, `steps`, `includes`, `faqs`

Then add the document checklist entry in `REQUIRED_DOCUMENTS` in `src/app/start/[country]/[service]/page.tsx`. The service list, pricing table, sitemap and checkout pick it up.

## How to add a package tier

Edit `packageOrder` and `PACKAGE_NAMES` in `src/config/pricing.ts`, add a price to each `buildPackages` call, and add the feature rows in `FEATURE_ROWS` on the pricing page. Prices still exist in one place.

## Pricing and price history

`src/config/pricing.ts` is the only place a price is written. `src/lib/catalog.ts` merges that with admin overrides stored in the database:

- package prices: `settings.packagePrices["service:tier"]`
- government fees and waivers: `settings.governmentFees`, `settings.governmentFeeWaived`
- compliance prices: `settings.compliancePrices`
- website ranges: `settings.websiteRanges`
- service names and short descriptions: `settings.serviceCopy`

Every admin change writes a row to `price_changes`. The admin pricing page shows the history.

## Security notes

- Documents are private. Downloads go through `/api/documents/[id]`, which checks ownership and returns a signed URL that expires after 60 seconds with `no-store`.
- Uploads are checked by magic bytes (PDF, JPG, PNG, WEBP), capped at 10 MB, and stored under a UUID key.
- Sessions are HMAC signed httpOnly cookies. No passwords are stored.
- Every data form has a consent checkbox that is not pre-ticked.
- Security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy) are set in `next.config.ts`.
- Audit entries are append only and shown in the admin outbox.

## Still missing before real customer documents are accepted

These are deliberate, and listed so nobody assumes otherwise:

1. Staff two factor authentication. Admin and lawyer sessions are single factor today.
2. Malware scanning on uploads. File type, signature and size are checked, content is not scanned.
3. Live row level security tests against a real Supabase project with two accounts.
4. A CSP without `unsafe-inline` for scripts, using a nonce. Documented in `docs/ARCHITECTURE.md`.
5. Object storage retention and deletion jobs.
6. Uptime monitoring and error tracking.
7. A signed engagement letter flow for partner lawyers.
8. Lighthouse run on a real device profile, which was not executed here.

## Deployment notes for this build

- This environment had no GitHub credentials and no Vercel token, so the repository could not be pushed and Vercel could not be used. The app is deployed on Freebuff Sites (Cloudflare Workers through OpenNext) at the preview URL above, with `DEMO_MODE=true` and a generated `SESSION_SECRET`.
- Commits use the identity `EO Isama <eoisama@gmail.com>` as requested. Change it with `git config user.name` and `git config user.email` if that is not the preferred name.
- The legal ending of `Udalla Global Concepts` is a placeholder pending confirmation from the owner.
- UK confirmation statement and US annual report prices were not supplied, so they are shown as "By quote" until an admin sets an amount.
- The `NEXT_PUBLIC_SITE_URL` default is https://udalla.org. On the Cloudflare preview the canonical origin therefore points at the intended domain rather than the preview host.
