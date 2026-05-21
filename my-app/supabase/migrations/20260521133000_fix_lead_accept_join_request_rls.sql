drop policy if exists "members_insert_self" on public.implementation_members;

create policy "members_insert_self_or_lead" on public.implementation_members
for insert to authenticated
with check (
  auth.uid() = user_id
  or exists (
    select 1
    from public.implementations imp
    where imp.id = implementation_members.implementation_id
      and imp.lead_user_id = auth.uid()
  )
);
