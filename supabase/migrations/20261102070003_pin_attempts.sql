create table public.pin_attempts (
  phone text primary key,
  failures smallint not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.pin_attempts enable row level security;

revoke all on table public.pin_attempts from anon, authenticated;
