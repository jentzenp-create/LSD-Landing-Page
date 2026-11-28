-- Purchases logged by /api/stripe-webhook. Run once in the Supabase SQL editor.
create table if not exists public.stripe_purchases (
  id               bigint generated always as identity primary key,
  stripe_session_id text not null unique,
  stripe_event_id   text not null,
  livemode          boolean not null default false,
  customer_email    text,
  customer_name     text,
  amount_total      integer,
  currency          text,
  payment_link      text,
  package_key       text,
  items             jsonb not null default '[]'::jsonb,
  metadata          jsonb not null default '{}'::jsonb,
  welcome_sent_at   timestamptz,
  created_at        timestamptz not null default now()
);

-- Server-only table: RLS on with no policies, so the public anon key cannot read it.
-- The webhook uses the service role key, which bypasses RLS.
alter table public.stripe_purchases enable row level security;
