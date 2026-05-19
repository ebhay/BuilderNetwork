create or replace view public.idea_status_stats as
select
  i.id as idea_id,
  count(imp.id)::int as implementation_count,
  count(*) filter (where imp.deployed_url is not null and imp.deployed_url <> '')::int as built_count,
  case
    when count(*) filter (where imp.deployed_url is not null and imp.deployed_url <> '') > 0 then 'BUILT'
    when count(imp.id) > 0 then 'IN_PROGRESS'
    else 'IDEA'
  end::text as derived_status
from public.ideas i
left join public.implementations imp on imp.idea_id = i.id
group by i.id;

grant select on public.idea_status_stats to anon, authenticated;

drop policy if exists "members_lead_read_only" on public.implementation_members;

create policy "members_public_parent_idea_read" on public.implementation_members
for select to anon, authenticated
using (
  exists (
    select 1
    from public.implementations imp
    join public.ideas i on i.id = imp.idea_id
    where imp.id = implementation_members.implementation_id
      and i.visibility in ('PUBLISHED', 'NEEDS_REFINEMENT')
  )
);
