drop view if exists public.implementation_members_public;

create view public.implementation_members_public
with (security_invoker = true) as
select
  im.implementation_id,
  im.role,
  p.id as user_id,
  p.name,
  p.username,
  p.profile_image_url,
  p.coding_level,
  im.role_focus
from public.implementation_members im
join public.profiles p on p.id = im.user_id;

grant select on public.implementation_members_public to anon, authenticated;
