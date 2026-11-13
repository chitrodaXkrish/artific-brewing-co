-- Run this in Supabase SQL Editor before enabling the admin integrations.
create extension if not exists pgcrypto;

create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null unique,
  phone text,
  source text not null default 'website',
  status text not null default 'waiting',
  created_at timestamptz not null default now()
);
create unique index if not exists waitlist_entries_email_lower_idx
  on public.waitlist_entries (lower(email));
create index if not exists waitlist_entries_created_at_idx
  on public.waitlist_entries (created_at desc);

create table if not exists public.preorders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  items jsonb not null default '[]'::jsonb,
  shipping jsonb not null default '{}'::jsonb,
  payment_method text,
  payment_status text not null default 'not_collected',
  status text not null default 'pending',
  subtotal numeric(12,2) not null default 0,
  shipping_fee numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  currency text not null default 'USD',
  created_at timestamptz not null default now()
);
create index if not exists preorders_created_at_idx on public.preorders (created_at desc);
create index if not exists preorders_customer_email_idx on public.preorders (lower(customer_email));

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  visitor_id text not null,
  session_id text not null,
  page_path text not null default '/',
  referrer text,
  source text,
  device text not null default 'desktop',
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists analytics_events_created_at_idx on public.analytics_events (created_at desc);
create index if not exists analytics_events_session_idx on public.analytics_events (session_id, created_at);
create index if not exists analytics_events_name_idx on public.analytics_events (event_name, created_at desc);

alter table public.waitlist_entries enable row level security;
alter table public.preorders enable row level security;
alter table public.analytics_events enable row level security;

grant usage on schema public to service_role;
grant select, insert, update, delete on public.waitlist_entries to service_role;
grant select, insert, update, delete on public.preorders to service_role;
grant select, insert, update, delete on public.analytics_events to service_role;
revoke all on public.waitlist_entries, public.preorders, public.analytics_events from anon, authenticated;

-- Public clients receive no table policies. All access goes through server-side
-- API routes using the Supabase service role key, which bypasses RLS.
