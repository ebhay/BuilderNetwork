drop policy if exists "join_requests_requester_insert" on public.join_requests;

create policy "join_requests_requester_insert" on public.join_requests
for insert to authenticated
with check (
  auth.uid() = requester_user_id
  and exists (
    select 1
    from public.implementations imp
    join public.ideas i on i.id = imp.idea_id
    where imp.id = join_requests.implementation_id
      and i.visibility in ('PUBLISHED', 'NEEDS_REFINEMENT')
      and imp.lead_user_id <> auth.uid()
  )
  and not exists (
    select 1
    from public.implementation_members im
    where im.implementation_id = join_requests.implementation_id
      and im.user_id = auth.uid()
  )
);
