-- Harden public member view and member/join-request write policies.

drop view if exists public.implementation_members_public;

create view public.implementation_members_public
with (security_invoker = true) as
select
  im.implementation_id,
  im.role,
  p.id as user_id,
  p.name,
  p.profile_image_url,
  p.coding_level
from public.implementation_members im
join public.profiles p on p.id = im.user_id
join public.implementations imp on imp.id = im.implementation_id
join public.ideas i on i.id = imp.idea_id
where i.visibility in ('PUBLISHED', 'NEEDS_REFINEMENT');

grant select on public.implementation_members_public to anon, authenticated;

drop policy if exists "members_self_or_public_read" on public.implementation_members;
drop policy if exists "members_insert_self" on public.implementation_members;

create policy "members_lead_read_only" on public.implementation_members
for select to authenticated
using (
  exists (
    select 1
    from public.implementations imp
    where imp.id = implementation_members.implementation_id
      and imp.lead_user_id = auth.uid()
  )
);

create policy "members_lead_insert_only" on public.implementation_members
for insert to authenticated
with check (
  exists (
    select 1
    from public.implementations imp
    where imp.id = implementation_members.implementation_id
      and imp.lead_user_id = auth.uid()
  )
);

drop policy if exists "join_requests_update_owner_or_requester" on public.join_requests;

create policy "join_requests_update_lead_only" on public.join_requests
for update to authenticated
using (
  exists (
    select 1
    from public.implementations imp
    where imp.id = join_requests.implementation_id
      and imp.lead_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.implementations imp
    where imp.id = join_requests.implementation_id
      and imp.lead_user_id = auth.uid()
  )
);
