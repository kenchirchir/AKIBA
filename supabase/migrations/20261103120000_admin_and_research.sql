grant select on table public.tailor_verifications to authenticated;

create policy "Admins read verification records"
on public.tailor_verifications for select to authenticated
using ((select public.is_admin()));

create function public.require_admin()
returns void
language plpgsql
stable
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only the AKIBA admin can do this' using errcode = '42501';
  end if;
end;
$$;

create function public.admin_verify_tailor(
  tailor uuid,
  association_name text,
  official text,
  visited date,
  consent boolean,
  note text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.require_admin();

  if consent is not true then
    raise exception 'The tailor must give consent before verification' using errcode = '22023';
  end if;

  insert into public.tailor_verifications (
    tailor_id,
    association,
    official_name,
    visit_date,
    consent_given,
    notes,
    verified_by
  )
  values (tailor, association_name, official, visited, consent, note, (select auth.uid()))
  on conflict (tailor_id) do update set
    association = excluded.association,
    official_name = excluded.official_name,
    visit_date = excluded.visit_date,
    consent_given = excluded.consent_given,
    notes = excluded.notes,
    verified_by = excluded.verified_by;

  update public.tailors
  set status = 'verified', verified_at = now()
  where id = tailor;
end;
$$;

create function public.admin_set_tailor_status(tailor uuid, new_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.require_admin();

  if new_status not in ('pending', 'suspended') then
    raise exception 'A tailor can only be moved to pending or suspended here' using errcode = '22023';
  end if;

  update public.tailors
  set status = new_status
  where id = tailor;
end;
$$;

create function public.admin_review_garment(garment uuid, approve boolean, reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.require_admin();

  if approve then
    update public.garments
    set status = 'approved', published_at = now(), rejection_reason = null
    where id = garment;
  else
    update public.garments
    set status = 'rejected', published_at = null, rejection_reason = reason
    where id = garment;
  end if;
end;
$$;

create function public.request_timings()
returns table (
  garment_id uuid,
  participant_code text,
  requested_at timestamptz,
  first_view timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    requested.garment_id,
    requested.participant_code,
    requested.created_at,
    (
      select min(viewed.created_at)
      from public.analytics_events as viewed
      where viewed.event_type = 'story_view'
        and viewed.garment_id = requested.garment_id
        and viewed.visitor_id = requested.visitor_id
    )
  from public.analytics_events as requested
  where requested.event_type = 'request_sent';
$$;

create function public.admin_report_summary()
returns table (
  story_views bigint,
  visitors bigint,
  participants bigint,
  reading_seconds bigint,
  saves bigint,
  unsaves bigint,
  tailor_views bigint,
  directions_clicks bigint,
  call_clicks bigint,
  requests bigint,
  requests_after_reading bigint,
  median_minutes_to_request numeric
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.require_admin();

  return query
  select
    count(*) filter (where events.event_type = 'story_view'),
    count(distinct events.visitor_id) filter (where events.event_type = 'story_view'),
    count(distinct events.participant_code),
    coalesce(sum(events.duration_seconds) filter (where events.event_type = 'story_read'), 0)::bigint,
    count(*) filter (where events.event_type = 'save'),
    count(*) filter (where events.event_type = 'unsave'),
    count(*) filter (where events.event_type = 'tailor_view'),
    count(*) filter (where events.event_type = 'directions_click'),
    count(*) filter (where events.event_type = 'call_click'),
    count(*) filter (where events.event_type = 'request_sent'),
    (
      select count(*)
      from public.request_timings() as timings
      where timings.first_view <= timings.requested_at
    ),
    (
      select round(
        (percentile_cont(0.5) within group (
          order by extract(epoch from timings.requested_at - timings.first_view)::double precision
        ) / 60)::numeric,
        1
      )
      from public.request_timings() as timings
      where timings.first_view <= timings.requested_at
    )
  from public.analytics_events as events;
end;
$$;

create function public.admin_garment_report()
returns table (
  garment_id uuid,
  garment_name text,
  shop_name text,
  is_sample boolean,
  story_views bigint,
  visitors bigint,
  reading_seconds bigint,
  saves bigint,
  unsaves bigint,
  requests bigint,
  requests_after_reading bigint,
  median_minutes_to_request numeric
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.require_admin();

  return query
  select
    garments.id,
    garments.name,
    tailors.shop_name,
    garments.is_sample,
    count(events.id) filter (where events.event_type = 'story_view'),
    count(distinct events.visitor_id) filter (where events.event_type = 'story_view'),
    coalesce(sum(events.duration_seconds) filter (where events.event_type = 'story_read'), 0)::bigint,
    count(events.id) filter (where events.event_type = 'save'),
    count(events.id) filter (where events.event_type = 'unsave'),
    count(events.id) filter (where events.event_type = 'request_sent'),
    (
      select count(*)
      from public.request_timings() as timings
      where timings.garment_id = garments.id
        and timings.first_view <= timings.requested_at
    ),
    (
      select round(
        (percentile_cont(0.5) within group (
          order by extract(epoch from timings.requested_at - timings.first_view)::double precision
        ) / 60)::numeric,
        1
      )
      from public.request_timings() as timings
      where timings.garment_id = garments.id
        and timings.first_view <= timings.requested_at
    )
  from public.garments
  join public.tailors on tailors.id = garments.tailor_id
  left join public.analytics_events as events on events.garment_id = garments.id
  group by garments.id, tailors.shop_name
  order by 5 desc, 2;
end;
$$;

create function public.admin_participant_report()
returns table (
  participant_code text,
  visitors bigint,
  story_views bigint,
  stories_viewed bigint,
  reading_seconds bigint,
  saves bigint,
  unsaves bigint,
  tailor_views bigint,
  requests bigint,
  requests_after_reading bigint,
  median_minutes_to_request numeric,
  first_seen timestamptz,
  last_seen timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.require_admin();

  return query
  select
    events.participant_code,
    count(distinct events.visitor_id),
    count(*) filter (where events.event_type = 'story_view'),
    count(distinct events.garment_id) filter (where events.event_type = 'story_view'),
    coalesce(sum(events.duration_seconds) filter (where events.event_type = 'story_read'), 0)::bigint,
    count(*) filter (where events.event_type = 'save'),
    count(*) filter (where events.event_type = 'unsave'),
    count(*) filter (where events.event_type = 'tailor_view'),
    count(*) filter (where events.event_type = 'request_sent'),
    (
      select count(*)
      from public.request_timings() as timings
      where timings.participant_code = events.participant_code
        and timings.first_view <= timings.requested_at
    ),
    (
      select round(
        (percentile_cont(0.5) within group (
          order by extract(epoch from timings.requested_at - timings.first_view)::double precision
        ) / 60)::numeric,
        1
      )
      from public.request_timings() as timings
      where timings.participant_code = events.participant_code
        and timings.first_view <= timings.requested_at
    ),
    min(events.created_at),
    max(events.created_at)
  from public.analytics_events as events
  where events.participant_code is not null
  group by events.participant_code
  order by 1;
end;
$$;

revoke execute on function public.require_admin() from public, anon;
revoke execute on function public.request_timings() from public, anon, authenticated;
revoke execute on function public.admin_verify_tailor(uuid, text, text, date, boolean, text) from public, anon;
revoke execute on function public.admin_set_tailor_status(uuid, text) from public, anon;
revoke execute on function public.admin_review_garment(uuid, boolean, text) from public, anon;
revoke execute on function public.admin_report_summary() from public, anon;
revoke execute on function public.admin_garment_report() from public, anon;
revoke execute on function public.admin_participant_report() from public, anon;

grant execute on function public.require_admin() to authenticated;
grant execute on function public.admin_verify_tailor(uuid, text, text, date, boolean, text) to authenticated;
grant execute on function public.admin_set_tailor_status(uuid, text) to authenticated;
grant execute on function public.admin_review_garment(uuid, boolean, text) to authenticated;
grant execute on function public.admin_report_summary() to authenticated;
grant execute on function public.admin_garment_report() to authenticated;
grant execute on function public.admin_participant_report() to authenticated;
