-- Design Code Jobs: public read of published jobs, service-role writes for ingest and checkout.

create extension if not exists pgcrypto;

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  domain text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_boards (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  ats text not null check (ats in ('greenhouse', 'lever', 'ashby')),
  board_token text not null,
  api_url text,
  last_synced_at timestamptz,
  unique (ats, board_token)
);

create table public.jobs (
  id text primary key,
  slug text not null unique,
  company_slug text not null,
  status text not null check (status in ('active', 'expired', 'review', 'rejected', 'pending')),
  date_posted timestamptz,
  expired_at timestamptz,
  valid_through timestamptz,
  featured boolean not null default false,
  title_family text,
  workplace text,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create index jobs_status_posted_idx on public.jobs (status, date_posted desc);
create index jobs_company_idx on public.jobs (company_slug);
create index jobs_family_idx on public.jobs (title_family) where status = 'active';

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company_name text not null,
  company_domain text,
  title text not null,
  location text,
  workplace text not null,
  description_html text not null,
  apply_url text not null,
  salary_min integer,
  salary_max integer,
  salary_currency text,
  featured boolean not null default false,
  status text not null check (status in ('pending_payment', 'paid', 'published', 'refunded')),
  job_id text references public.jobs (id),
  lemonsqueezy_order_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create unique index submissions_order_idx on public.submissions (lemonsqueezy_order_id)
  where lemonsqueezy_order_id is not null;

create table public.alert_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  filters jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  unsubscribe_token text not null unique,
  created_at timestamptz not null default now()
);

create unique index alert_email_active_idx on public.alert_subscriptions (lower(email))
  where status = 'active';

create table public.ingest_state (
  id integer primary key default 1 check (id = 1),
  cursor integer not null default 0,
  updated_at timestamptz not null default now(),
  last_stats jsonb
);

insert into public.ingest_state (id, cursor) values (1, 0);

alter table public.companies enable row level security;
alter table public.company_boards enable row level security;
alter table public.jobs enable row level security;
alter table public.submissions enable row level security;
alter table public.alert_subscriptions enable row level security;
alter table public.ingest_state enable row level security;

create policy "public read companies"
  on public.companies for select
  to anon, authenticated
  using (true);

create policy "public read boards"
  on public.company_boards for select
  to anon, authenticated
  using (true);

create policy "public read published jobs"
  on public.jobs for select
  to anon, authenticated
  using (status in ('active', 'expired'));

revoke all on public.submissions from anon, authenticated;
revoke all on public.alert_subscriptions from anon, authenticated;
revoke all on public.ingest_state from anon, authenticated;
revoke insert, update, delete on public.jobs from anon, authenticated;
revoke insert, update, delete on public.companies from anon, authenticated;
revoke insert, update, delete on public.company_boards from anon, authenticated;

grant select on public.jobs to anon, authenticated;
grant select on public.companies to anon, authenticated;
grant select on public.company_boards to anon, authenticated;
