-- Udalla schema.
-- Postgres 15+. Run with the Supabase CLI: supabase db push
--
-- Design notes
-- 1. Documents live in a private storage bucket. There are no public URLs.
-- 2. Row level security is enabled on every table. Customers can only read
--    their own rows. Lawyers can only read matters assigned to them.
-- 3. audit_log is append only: no update or delete policy exists for anyone
--    except the service role, and no grant is given to authenticated users.
-- 4. The pricing catalog is authored in src/config/pricing.ts. Admin edits are
--    stored in settings.payload and price_changes keeps the history.

create extension if not exists "pgcrypto";

-- Profiles -------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key,
  email text not null unique,
  name text not null default '',
  role text not null default 'customer' check (role in ('customer', 'lawyer', 'admin')),
  created_at timestamptz not null default now()
);

-- Drafts ---------------------------------------------------------------------
create table if not exists public.drafts (
  id text primary key,
  visitor_id text not null,
  user_id uuid references public.profiles (id) on delete set null,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

-- Orders ---------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key,
  reference text not null unique,
  user_id uuid references public.profiles (id) on delete set null,
  guest_email text not null default '',
  country text not null,
  service text not null,
  package_tier text not null check (package_tier in ('starter', 'standard', 'premium')),
  add_ons jsonb not null default '[]'::jsonb,
  currency text not null check (currency in ('NGN', 'GBP', 'USD')),
  package_price integer not null default 0,
  add_ons_total integer not null default 0,
  government_fee integer not null default 0,
  total integer not null default 0,
  status text not null default 'received'
    check (status in ('received', 'in-review', 'name-check', 'filed', 'awaiting-registry', 'completed')),
  timeline jsonb not null default '[]'::jsonb,
  business jsonb not null default '{}'::jsonb,
  people jsonb not null default '[]'::jsonb,
  consent_at timestamptz,
  payment jsonb not null default '{}'::jsonb,
  assigned_lawyer_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders (user_id, created_at desc);
create index if not exists orders_status_idx on public.orders (status);

-- Documents ------------------------------------------------------------------
create table if not exists public.documents (
  id uuid primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  filename text not null,
  mime text not null,
  size integer not null check (size > 0 and size <= 10485760),
  storage_key text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists documents_order_idx on public.documents (order_id);
create index if not exists documents_user_idx on public.documents (user_id);

-- Compliance matters ---------------------------------------------------------
create table if not exists public.matters (
  id uuid primary key,
  reference text not null unique,
  user_id uuid not null references public.profiles (id) on delete cascade,
  service_slug text not null,
  service_name text not null,
  price integer,
  currency text not null default 'NGN' check (currency in ('NGN', 'GBP', 'USD')),
  detail text not null,
  status text not null default 'received'
    check (status in ('received', 'assigned', 'in-progress', 'filed', 'completed')),
  assigned_lawyer_id uuid references public.profiles (id) on delete set null,
  deadline date,
  timeline jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists matters_user_idx on public.matters (user_id);
create index if not exists matters_lawyer_idx on public.matters (assigned_lawyer_id);

-- Messages -------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key,
  thread_id text not null,
  author_id uuid not null,
  author_name text not null default '',
  author_role text not null default 'customer' check (author_role in ('customer', 'lawyer', 'admin')),
  body text not null check (char_length(body) between 1 and 4000),
  at timestamptz not null default now()
);

create index if not exists messages_thread_idx on public.messages (thread_id, at);

-- Lawyers --------------------------------------------------------------------
create table if not exists public.lawyers (
  id uuid primary key,
  display_name text not null,
  jurisdiction text not null,
  practice_areas jsonb not null default '[]'::jsonb,
  years integer not null default 0,
  photo_url text not null default '',
  show_name boolean not null default false,
  show_photo boolean not null default false,
  approved boolean not null default false
);

-- Guides and FAQs ------------------------------------------------------------
create table if not exists public.guides (
  slug text primary key,
  title text not null,
  excerpt text not null default '',
  country text not null default 'all',
  reading_minutes integer not null default 4,
  published_at date not null default current_date,
  body jsonb not null default '[]'::jsonb
);

create table if not exists public.faqs (
  id text primary key,
  question text not null,
  answer text not null,
  sort_order integer not null default 0
);

-- Leads ----------------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key,
  name text not null,
  email text not null,
  whatsapp text not null default '',
  business text not null default '',
  project_type text not null default '',
  budget text not null default '',
  timeline text not null default '',
  consent boolean not null default false,
  created_at timestamptz not null default now()
);

-- Reviews --------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key,
  name text not null,
  country text not null default '',
  body text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- Settings and price history -------------------------------------------------
create table if not exists public.settings (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.price_changes (
  id uuid primary key,
  scope text not null check (scope in ('package', 'government', 'compliance', 'website')),
  key text not null,
  label text not null,
  previous text not null default '',
  next text not null default '',
  changed_by text not null default '',
  at timestamptz not null default now()
);

-- Append only audit log ------------------------------------------------------
create table if not exists public.audit_log (
  id uuid primary key,
  actor_id text not null,
  action text not null,
  target text not null,
  at timestamptz not null default now(),
  meta jsonb not null default '{}'::jsonb
);

create index if not exists audit_at_idx on public.audit_log (at desc);

-- Email outbox ---------------------------------------------------------------
create table if not exists public.emails (
  id uuid primary key,
  "to" text not null,
  subject text not null,
  body text not null default '',
  template text not null default '',
  at timestamptz not null default now()
);

-- Rate limits ----------------------------------------------------------------
-- Shared counter for a multi instance deployment. The app increments this with
-- an atomic upsert per key and window.
create table if not exists public.rate_limits (
  key text primary key,
  window_start timestamptz not null,
  count integer not null default 0
);

-- Row level security ---------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.drafts enable row level security;
alter table public.orders enable row level security;
alter table public.documents enable row level security;
alter table public.matters enable row level security;
alter table public.messages enable row level security;
alter table public.lawyers enable row level security;
alter table public.guides enable row level security;
alter table public.faqs enable row level security;
alter table public.leads enable row level security;
alter table public.reviews enable row level security;
alter table public.settings enable row level security;
alter table public.price_changes enable row level security;
alter table public.audit_log enable row level security;
alter table public.emails enable row level security;
alter table public.rate_limits enable row level security;

create policy "profiles read own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles update own" on public.profiles
  for update using (auth.uid() = id);

create policy "drafts are owner only" on public.drafts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "orders read own" on public.orders
  for select using (user_id = auth.uid());
create policy "orders insert own" on public.orders
  for insert with check (user_id = auth.uid());

create policy "documents read own" on public.documents
  for select using (user_id = auth.uid());
create policy "documents insert own" on public.documents
  for insert with check (user_id = auth.uid());

create policy "matters read own or assigned" on public.matters
  for select using (
    user_id = auth.uid()
    or assigned_lawyer_id = auth.uid()
  );

create policy "messages read by participants" on public.messages
  for select using (
    exists (
      select 1 from public.orders o
      where o.id::text = messages.thread_id and o.user_id = auth.uid()
    )
    or exists (
      select 1 from public.matters m
      where m.id::text = messages.thread_id
        and (m.user_id = auth.uid() or m.assigned_lawyer_id = auth.uid())
    )
  );
create policy "messages insert by participants" on public.messages
  for insert with check (
    author_id = auth.uid()
    and (
      exists (
        select 1 from public.orders o
        where o.id::text = messages.thread_id and o.user_id = auth.uid()
      )
      or exists (
        select 1 from public.matters m
        where m.id::text = messages.thread_id
          and (m.user_id = auth.uid() or m.assigned_lawyer_id = auth.uid())
      )
    )
  );

create policy "approved lawyers are public" on public.lawyers
  for select using (approved = true);

create policy "guides are public" on public.guides
  for select using (true);
create policy "faqs are public" on public.faqs
  for select using (true);
create policy "settings are public" on public.settings
  for select using (true);
create policy "approved reviews are public" on public.reviews
  for select using (approved = true);

-- leads, audit_log, emails, price_changes and rate_limits intentionally have
-- no policies: only the service role can touch them.

-- Storage --------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- No storage policy is created for the documents bucket. Uploads and signed
-- URLs are created on the server with the service role only, so no browser can
-- read a file directly.
