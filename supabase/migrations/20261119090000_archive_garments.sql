alter table public.garments add column archived_at timestamptz;

drop policy "Read approved garments, your own, or all as admin" on public.garments;

create policy "Read approved garments, your own, or all as admin"
on public.garments for select to anon, authenticated
using (
  (
    status = 'approved'
    and archived_at is null
    and exists (
      select 1
      from public.tailors
      where tailors.id = garments.tailor_id and tailors.status = 'verified'
    )
  )
  or public.owns_tailor(tailor_id)
  or (select public.is_admin())
);

create function public.set_garment_archived(garment uuid, archived boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.garments
  set archived_at = case when archived then coalesce(archived_at, now()) end
  where id = garment and public.owns_tailor(tailor_id);

  if not found then
    raise exception 'Garment not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.set_garment_archived(uuid, boolean) from public, anon;
grant execute on function public.set_garment_archived(uuid, boolean) to authenticated;
