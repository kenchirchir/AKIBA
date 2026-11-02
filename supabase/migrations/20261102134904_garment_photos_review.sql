create function public.garment_photos_require_review()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'authenticated' then
    update public.garments
    set name = garments.name
    where garments.id = coalesce(new.garment_id, old.garment_id);
  end if;
  return null;
end;
$$;

create trigger garment_photos_require_review
after insert or update or delete on public.garment_photos
for each row execute function public.garment_photos_require_review();

create function public.my_garment_views()
returns table (garment_id uuid, views bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select events.garment_id, count(*)
  from public.analytics_events as events
  join public.garments on garments.id = events.garment_id
  where events.event_type = 'story_view'
    and public.owns_tailor(garments.tailor_id)
  group by events.garment_id;
$$;

revoke execute on function public.my_garment_views() from public, anon;
grant execute on function public.my_garment_views() to authenticated;
