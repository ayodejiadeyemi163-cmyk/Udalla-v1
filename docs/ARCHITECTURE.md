# Architecture

## The shape of the app

```
src/
  app/                 routes, server actions, API handlers
  components/          site shell, checkout steps, mocks, dashboard pieces
  config/              brand, countries, navigation, pricing
  content/             starter guides and legal copy
  lib/                 store, catalog, auth, security, payments, storage
  middleware.ts        visitor cookie, route protection
supabase/migrations/   schema, policies, seed
```

Everything is server rendered. The root layout sets `dynamic = "force-dynamic"` because the shell reads admin editable settings, the signed in user and the pricing overrides. Prices must never be frozen into a static build.

## Data store

One interface, two adapters.

```ts
interface Store { /* src/lib/store/types.ts */ }
```

- `src/lib/store/supabase.ts`: Postgres through Supabase. Written and shipped, activated automatically when `NEXT_PUBLIC_SUPABASE_URL` and a key exist. All privileged work uses the service role key on the server.
- `src/lib/store/demo.ts`: in memory data, seeded on boot, used only when `DEMO_MODE=true`. Docker style restarts clear it.
- `src/lib/store/index.ts`: picks the adapter. Throws when neither is configured, and the root layout renders a configuration error instead of falling back to fake data.

Adding a feature means adding a method to the interface and implementing it twice. The demo adapter is the reference behaviour.

## Pricing

`src/config/pricing.ts` is the source of truth: services, packages, government fees, add-ons, compliance services and website tiers.

`src/lib/catalog.ts` merges config with database overrides:

```
config price -> settings.packagePrices[key] ?? config -> page
```

Admin edits go through `savePricing` in `src/app/actions/admin.ts`, which:

1. computes the previous value from the effective catalog,
2. writes the override into `settings`,
3. appends a `price_changes` row,
4. appends an audit entry,
5. revalidates every page that shows a price.

Nothing else in the app may hold a price literal. `npm run audit:copy` does not enforce that, code review does.

## Identity and sessions

- Google OAuth and email magic link through Supabase Auth. No passwords are stored.
- After the Supabase callback, the app creates or finds a profile and issues its own session cookie: `userId.expiry.signature`, HMAC SHA-256 with `SESSION_SECRET`.
- Cookies are httpOnly, SameSite Lax and Secure in production.
- Middleware assigns `udalla_visitor` (httpOnly) for anonymous order drafts and protects `/dashboard`, `/admin` and `/lawyer`.

Authorisation lives in `src/lib/access.ts` and is applied in pages, actions and API routes. Demo sign in exists only when `DEMO_MODE=true`.

## Checkout state machine

```
/start/[country]/[service]
  step 1 package and add-ons
  step 2 business details
  step 3 people
  step 4 documents
  step 5 review and consent
  step 6 payment
```

- A draft is keyed by service slug and visitor cookie, so a refresh or a return visit resumes at the saved step.
- Each step is a server action that validates with Zod and redirects to the next step. The URL carries the step, so back and forward work without JavaScript.
- Totals are recomputed on the server from the catalog at every step and again at order creation. Client side totals are display only.
- Consent is a checkbox that starts unticked and is required before payment.
- Payment goes through `src/lib/payments.ts`. Paystack when keys exist, otherwise a labelled test payment that creates the order. The webhook verifies the signature on the raw body and is idempotent on `payment.paidAt`.

## Documents

- Bucket is private. No public URL exists.
- Upload: same origin check, rate limit, draft ownership check, magic byte validation (PDF, JPG, PNG, WEBP), 10 MB cap, UUID path, service role write.
- Download: authenticated, ownership checked with `canAccessDocument`, a 60 second signed URL is created and returned as a redirect with `no-store`, and the access is appended to the audit log.
- In demo mode uploads are refused with a clear message, because a preview must not accept real identity documents.

## Compliance and reminders

- A compliance request creates a matter, picks a partner lawyer in that jurisdiction, writes a timeline and emails both the customer and the operations address.
- Reminders live in `src/lib/reminders.ts`. Templates are keyed `reminder:matterId:days`, so rerunning the cron is safe.
- The same function is called by the admin outbox button and by `POST /api/cron/reminders`, which requires `CRON_SECRET`.

## Admin and lawyer panels

- Admin: orders with status and lawyer assignment, matters, leads and CSV export, pricing and price history, FAQ and guides, lawyers, contact settings, email outbox and audit log.
- Lawyer: only matters where `assignedLawyerId` matches the session user. Status updates and messages are authorised server side on every call.

## Security headers

`next.config.ts` sets CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy and Cross-Origin-Opener-Policy on every response.

The current CSP allows `'unsafe-inline'` for scripts because Next.js injects inline bootstrap scripts. The hardening step is a nonce generated in middleware and attached to the CSP header, which Next.js then applies to its own scripts. That is not implemented yet and is listed in the README.

## Styles

Tailwind v4 with tokens in `@theme` inside `src/app/globals.css`. Components use `card`, `btn`, `pill`, `field`, `accordion`, `prose-editorial` and the reveal utilities. Motion is gated behind `prefers-reduced-motion`. Fonts are loaded with `next/font/google`, self hosted at build time.
