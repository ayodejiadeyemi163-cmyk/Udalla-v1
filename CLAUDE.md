# CLAUDE.md

Instructions for an AI coding agent working in this repository.

## What this is

Udalla, a Next.js App Router site for business registration and compliance in Nigeria, the UK and the US. Server rendered, TypeScript strict, Tailwind v4, one store interface with Supabase and demo adapters.

## Commands

```bash
npm run dev          # development
npm run build        # production build
npm start            # run the build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm test             # vitest
npm run audit:copy   # em dash and wording audit
npm run crawl https://your-host   # crawl every page
```

## Where things live

- Brand and contact defaults: `src/config/brand.ts`
- Countries: `src/config/countries.ts`
- Prices, packages, government fees, compliance and website tiers: `src/config/pricing.ts`
- Effective prices with admin overrides: `src/lib/catalog.ts`
- Store interface: `src/lib/store/types.ts`; Supabase: `supabase.ts`; demo: `demo.ts`
- Sessions and cookies: `src/lib/session.ts`, `src/lib/session-token.ts`, `src/middleware.ts`
- Authorisation: `src/lib/access.ts`
- Checkout steps and totals: `src/lib/checkout.ts`, `src/app/start/[country]/[service]/page.tsx`, `src/app/actions/checkout.ts`
- Admin actions: `src/app/actions/admin.ts`
- Schema and policies: `supabase/migrations`

## Conventions

- Server components by default. `"use client"` only for state, effects or browser APIs.
- A `"use server"` file may only export async functions. Shared types and constants go in `src/lib/form-state.ts` or another plain module.
- Validate every form with Zod in `src/lib/validation.ts` before writing to the store.
- Never trust a total from the client. Recompute with `priceSelection`.
- Every customer data read goes through `src/lib/access.ts`.
- New tables need RLS policies in the same migration. Default deny.
- Currency is formatted with `formatMoney`, never by hand.
- Copy: no em dashes, no emoji, real apostrophes, short sentences.

## Do not

- Do not type a price, brand name, legal name, domain or contact detail outside its config file.
- Do not add a second pricing source, a calculator, a compare tool or a public order tracker.
- Do not add AI features, chatbots, WhatsApp automation or analytics before consent.
- Do not describe lawyers as preparing or filing registrations. The filing team does that. Lawyers handle regulatory compliance.
- Do not invent reviews, awards, statistics, customer counts or lawyer names.
- Do not use stock photos, AI faces or emoji in the interface.
- Do not weaken authentication, RLS, upload validation or the consent checkbox to make a test pass.
- Do not commit `.env` files, keys or generated build output.
- Do not switch pages back to static rendering. The shell reads per request settings and the signed in user.

## Before you finish

Run `npm run lint`, `npm run typecheck`, `npm test` and `npm run build`. If you changed copy, run `npm run audit:copy`. If you changed routes, crawl the site.
