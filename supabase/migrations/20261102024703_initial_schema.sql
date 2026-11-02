create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'tailor' check (role in ('tailor', 'admin')),
  phone text,
  created_at timestamptz not null default now()
);

create table public.tailors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles (id) on delete cascade,
  owner_name text not null check (char_length(owner_name) between 2 and 80),
  shop_name text not null check (char_length(shop_name) between 2 and 80),
  district text not null check (district in ('gasabo', 'kicukiro', 'nyarugenge')),
  sector text not null,
  shop_address text check (char_length(shop_address) <= 120),
  tailoring_types text[] not null default '{}',
  tailoring_since date,
  about text check (char_length(about) <= 2000),
  avatar_public_id text,
  cover_public_id text,
  sms_alerts boolean not null default true,
  status text not null default 'pending' check (status in ('pending', 'verified', 'suspended')),
  verified_at timestamptz,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tailor_verifications (
  tailor_id uuid primary key references public.tailors (id) on delete cascade,
  association text,
  official_name text,
  visit_date date,
  consent_given boolean not null default false,
  notes text,
  verified_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.garments (
  id uuid primary key default gen_random_uuid(),
  tailor_id uuid not null references public.tailors (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  category text not null check (
    category in ('tops', 'bottoms', 'dresses', 'suits', 'traditional-wear', 'bridal-occasion')
  ),
  subcategory text check (
    subcategory in ('shirts', 'blouses', 'kaftans-tunics', 'crop-tops', 'trousers', 'skirts', 'shorts')
  ),
  audience text not null default 'unisex' check (audience in ('women', 'men', 'unisex', 'kids')),
  material text,
  description text check (char_length(description) <= 1000),
  story text not null check (char_length(story) between 10 and 3000),
  price_rwf integer not null check (price_rwf between 500 and 10000000),
  making_days smallint check (making_days between 1 and 180),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  published_at timestamptz,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.garment_photos (
  id uuid primary key default gen_random_uuid(),
  garment_id uuid not null references public.garments (id) on delete cascade,
  public_id text not null,
  width integer,
  height integer,
  position smallint not null default 0 check (position between 0 and 4),
  created_at timestamptz not null default now(),
  unique (garment_id, position)
);

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  garment_id uuid references public.garments (id) on delete set null,
  tailor_id uuid not null references public.tailors (id) on delete cascade,
  buyer_name text not null check (char_length(buyer_name) between 2 and 80),
  buyer_phone text not null,
  size text not null,
  quantity smallint not null default 1 check (quantity between 1 and 20),
  needed_by date,
  best_time text check (best_time in ('morning', 'afternoon', 'evening', 'anytime')),
  status text not null default 'new' check (status in ('new', 'read', 'ordered')),
  visitor_id uuid,
  sms_sent_at timestamptz,
  read_at timestamptz,
  ordered_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.analytics_events (
  id bigint generated always as identity primary key,
  event_type text not null check (
    event_type in (
      'story_view',
      'story_read',
      'save',
      'unsave',
      'request_sent',
      'call_click',
      'directions_click',
      'tailor_view'
    )
  ),
  garment_id uuid references public.garments (id) on delete set null,
  tailor_id uuid references public.tailors (id) on delete set null,
  visitor_id uuid,
  participant_code text,
  duration_seconds integer check (duration_seconds >= 0),
  created_at timestamptz not null default now()
);

create index tailors_status_district_idx on public.tailors (status, district);
create index tailor_verifications_verified_by_idx on public.tailor_verifications (verified_by);
create index garments_tailor_id_idx on public.garments (tailor_id);
create index garments_feed_idx on public.garments (status, category, published_at desc);
create index requests_tailor_created_idx on public.requests (tailor_id, created_at desc);
create index requests_garment_id_idx on public.requests (garment_id);
create index analytics_events_garment_idx on public.analytics_events (garment_id, event_type);
create index analytics_events_tailor_id_idx on public.analytics_events (tailor_id);
create index analytics_events_created_at_idx on public.analytics_events (created_at);

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create function public.owns_tailor(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.tailors
    where id = target and profile_id = (select auth.uid())
  );
$$;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create function public.garments_require_review()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'authenticated' then
    new.status := 'pending';
    new.published_at := null;
    new.rejection_reason := null;
  end if;
  return new;
end;
$$;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, phone)
  values (new.id, new.phone);
  return new;
end;
$$;

create trigger tailors_set_updated_at
before update on public.tailors
for each row execute function public.set_updated_at();

create trigger tailor_verifications_set_updated_at
before update on public.tailor_verifications
for each row execute function public.set_updated_at();

create trigger garments_set_updated_at
before update on public.garments
for each row execute function public.set_updated_at();

create trigger garments_require_review
before update on public.garments
for each row execute function public.garments_require_review();

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.tailors enable row level security;
alter table public.tailor_verifications enable row level security;
alter table public.garments enable row level security;
alter table public.garment_photos enable row level security;
alter table public.requests enable row level security;
alter table public.analytics_events enable row level security;

create policy "Users read their own profile, admins read all"
on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select public.is_admin()));

create policy "Read verified tailors, your own shop, or all as admin"
on public.tailors for select to anon, authenticated
using (
  status = 'verified'
  or profile_id = (select auth.uid())
  or (select public.is_admin())
);

create policy "Tailors create their own shop"
on public.tailors for insert to authenticated
with check (profile_id = (select auth.uid()));

create policy "Tailors update their own shop"
on public.tailors for update to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy "Read approved garments, your own, or all as admin"
on public.garments for select to anon, authenticated
using (
  (
    status = 'approved'
    and exists (
      select 1
      from public.tailors
      where tailors.id = garments.tailor_id and tailors.status = 'verified'
    )
  )
  or public.owns_tailor(tailor_id)
  or (select public.is_admin())
);

create policy "Tailors add garments to their own shop"
on public.garments for insert to authenticated
with check (public.owns_tailor(tailor_id));

create policy "Tailors update their own garments"
on public.garments for update to authenticated
using (public.owns_tailor(tailor_id))
with check (public.owns_tailor(tailor_id));

create policy "Tailors delete their own garments"
on public.garments for delete to authenticated
using (public.owns_tailor(tailor_id));

create policy "Read photos of garments you can see"
on public.garment_photos for select to anon, authenticated
using (
  exists (
    select 1
    from public.garments
    where garments.id = garment_photos.garment_id
  )
);

create policy "Tailors add photos to their own garments"
on public.garment_photos for insert to authenticated
with check (
  exists (
    select 1
    from public.garments
    where garments.id = garment_photos.garment_id and public.owns_tailor(garments.tailor_id)
  )
);

create policy "Tailors reorder photos of their own garments"
on public.garment_photos for update to authenticated
using (
  exists (
    select 1
    from public.garments
    where garments.id = garment_photos.garment_id and public.owns_tailor(garments.tailor_id)
  )
);

create policy "Tailors delete photos of their own garments"
on public.garment_photos for delete to authenticated
using (
  exists (
    select 1
    from public.garments
    where garments.id = garment_photos.garment_id and public.owns_tailor(garments.tailor_id)
  )
);

create policy "Tailors read requests for their shop"
on public.requests for select to authenticated
using (public.owns_tailor(tailor_id));

create policy "Tailors update requests for their shop"
on public.requests for update to authenticated
using (public.owns_tailor(tailor_id))
with check (public.owns_tailor(tailor_id));

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;

revoke all on table public.tailors from anon, authenticated;
grant select on table public.tailors to anon, authenticated;
grant insert (
  profile_id,
  owner_name,
  shop_name,
  district,
  sector,
  shop_address,
  tailoring_types,
  tailoring_since,
  about
) on table public.tailors to authenticated;
grant update (
  owner_name,
  shop_name,
  district,
  sector,
  shop_address,
  tailoring_types,
  tailoring_since,
  about,
  avatar_public_id,
  cover_public_id,
  sms_alerts
) on table public.tailors to authenticated;

revoke all on table public.tailor_verifications from anon, authenticated;

revoke all on table public.garments from anon, authenticated;
grant select on table public.garments to anon, authenticated;
grant insert (
  tailor_id,
  name,
  category,
  subcategory,
  audience,
  material,
  description,
  story,
  price_rwf,
  making_days
) on table public.garments to authenticated;
grant update (
  name,
  category,
  subcategory,
  audience,
  material,
  description,
  story,
  price_rwf,
  making_days
) on table public.garments to authenticated;
grant delete on table public.garments to authenticated;

revoke all on table public.garment_photos from anon, authenticated;
grant select on table public.garment_photos to anon, authenticated;
grant insert (garment_id, public_id, width, height, position) on table public.garment_photos to authenticated;
grant update (position) on table public.garment_photos to authenticated;
grant delete on table public.garment_photos to authenticated;

revoke all on table public.requests from anon, authenticated;
grant select on table public.requests to authenticated;
grant update (status, read_at, ordered_at) on table public.requests to authenticated;

revoke all on table public.analytics_events from anon, authenticated;
