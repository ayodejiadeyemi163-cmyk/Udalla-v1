# Contributing

## The rules

- `main` is production. It deploys automatically. Never commit directly to it.
- Branch from `main` with a short descriptive name: `feat/compliance-reminders`, `fix/pricing-override`, `chore/docs`.
- Open a pull request. CI runs lint, typecheck, tests and a production build on every pull request. A red check blocks merge.
- Keep pull requests small and single purpose. One behaviour change per pull request.
- Never commit a secret, a token, a `.env` file, a Supabase key or a screenshot of a dashboard with real customer data.

## Local checks before you push

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run audit:copy
```

If the change touches pages, run the app and check the affected page. If it touches pricing, check the home page, pricing page, a service page and checkout, because all of them read the same config.

## Commit messages

Short imperative subject, then a sentence on why if it helps.

```
Add 7 day compliance reminder window

Reminders were only sent at 30 days, so filings inside a month were missed.
```

## Code conventions

- TypeScript strict. No `any`. Narrow unknown values with Zod at the boundary.
- Server components by default. Add `"use client"` only when a component needs state, effects or browser APIs.
- Prices come from `src/config/pricing.ts` and are read through `src/lib/catalog.ts`. Never type a price in a page.
- Brand name, legal name, domain and contact details come from `src/config/brand.ts`.
- Every query that returns customer data must be authorised with `src/lib/access.ts`.
- Every new table needs row level security in the same migration.
- Copy rules: no em dashes, no emoji, real apostrophes, plain sentences. `npm run audit:copy` enforces the first three.

## Adding a database change

1. Add a new numbered file in `supabase/migrations`.
2. Include policies for every new table. Default deny.
3. Update the Supabase adapter in `src/lib/store/supabase.ts` and the demo adapter in `src/lib/store/demo.ts` so both implement the same behaviour.
4. Note the change in `docs/ARCHITECTURE.md` if it changes a flow.

## Review checklist

- Does it work with JavaScript disabled where the spec says it must?
- Does a signed out user get redirected rather than an error?
- Can user A reach user B's data by changing an id in the URL?
- Are prices still read from one place?
- Does it respect `prefers-reduced-motion`?
