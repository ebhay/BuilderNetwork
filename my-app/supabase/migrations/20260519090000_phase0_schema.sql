create extension if not exists pgcrypto;

create type coding_level as enum ('BEGINNER', 'INTERMEDIATE', 'EXPERT');
create type idea_visibility as enum ('DRAFT', 'PUBLISHED', 'NEEDS_REFINEMENT');
create type review_status as enum ('PENDING_REVIEW', 'REVIEWED', 'ERROR');
create type quality_band as enum ('NEEDS_REVISION', 'GOOD', 'STRONG', 'EXCELLENT');
create type implementation_status as enum ('IN_PROGRESS', 'BUILT');
create type member_role as enum ('LEAD', 'TEAMMATE');
create type join_request_status as enum ('PENDING', 'ACCEPTED', 'REJECTED');
create type social_link_type as enum (
  'GITHUB',
  'LINKEDIN',
  'DISCORD',
  'TWITTER',
  'PORTFOLIO',
  'OTHER'
);
create type review_job_status as enum ('QUEUED', 'PROCESSING', 'SUCCEEDED', 'FAILED');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  bio text,
  profile_image_url text,
  coding_level coding_level not null,
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  level coding_level not null,
  created_at timestamptz not null default now()
);

create unique index if not exists skills_user_id_lower_name_idx
  on public.skills (user_id, lower(name));

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type social_link_type not null,
  url text not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  posted_by_user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  screenshot_url text,
  reference_links jsonb not null default '[]'::jsonb,
  visibility idea_visibility not null default 'DRAFT',
  review_status review_status not null default 'PENDING_REVIEW',
  content_hash text not null,
  last_reviewed_hash text,
  quality_score numeric(3,1),
  quality_band quality_band,
  publish_recommendation text,
  project_level coding_level,
  required_skills text[] not null default '{}',
  tags text[] not null default '{}',
  ai_feedback_json jsonb,
  reviewed_at timestamptz,
  review_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.idea_review_jobs (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  status review_job_status not null default 'QUEUED',
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.implementations (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  lead_user_id uuid not null references public.profiles(id) on delete cascade,
  build_title text,
  build_note text,
  github_repo_url text not null,
  deployed_url text,
  target_completion_time text,
  credit_to_idea_giver boolean not null default true,
  credit_note text,
  status implementation_status not null default 'IN_PROGRESS',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.implementation_members (
  id uuid primary key default gen_random_uuid(),
  implementation_id uuid not null references public.implementations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role member_role not null,
  joined_at timestamptz not null default now(),
  unique (implementation_id, user_id)
);

create table if not exists public.join_requests (
  id uuid primary key default gen_random_uuid(),
  implementation_id uuid not null references public.implementations(id) on delete cascade,
  requester_user_id uuid not null references public.profiles(id) on delete cascade,
  message text,
  status join_request_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists join_requests_one_pending_idx
  on public.join_requests (implementation_id, requester_user_id)
  where status = 'PENDING';

create table if not exists public.saved_ideas (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (idea_id, user_id)
);

create or replace view public.implementation_members_public as
select
  im.implementation_id,
  im.role,
  p.id as user_id,
  p.name,
  p.profile_image_url,
  p.coding_level
from public.implementation_members im
join public.profiles p on p.id = im.user_id;

alter table public.profiles enable row level security;
alter table public.skills enable row level security;
alter table public.social_links enable row level security;
alter table public.ideas enable row level security;
alter table public.idea_review_jobs enable row level security;
alter table public.implementations enable row level security;
alter table public.implementation_members enable row level security;
alter table public.join_requests enable row level security;
alter table public.saved_ideas enable row level security;

create policy "profiles_public_select" on public.profiles
for select to anon, authenticated using (true);
create policy "profiles_owner_modify" on public.profiles
for all to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "skills_public_select" on public.skills
for select to anon, authenticated using (true);
create policy "skills_owner_modify" on public.skills
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "social_links_public_select" on public.social_links
for select to anon, authenticated using (is_public = true or auth.uid() = user_id);
create policy "social_links_owner_modify" on public.social_links
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "ideas_public_select" on public.ideas
for select to anon, authenticated
using (
  visibility in ('PUBLISHED', 'NEEDS_REFINEMENT') or auth.uid() = posted_by_user_id
);
create policy "ideas_owner_modify" on public.ideas
for all to authenticated
using (auth.uid() = posted_by_user_id)
with check (auth.uid() = posted_by_user_id);

create policy "idea_jobs_owner_select" on public.idea_review_jobs
for select to authenticated
using (
  exists (
    select 1 from public.ideas i
    where i.id = idea_review_jobs.idea_id and i.posted_by_user_id = auth.uid()
  )
);
create policy "idea_jobs_owner_insert" on public.idea_review_jobs
for insert to authenticated
with check (
  exists (
    select 1 from public.ideas i
    where i.id = idea_review_jobs.idea_id and i.posted_by_user_id = auth.uid()
  )
);

create policy "implementations_public_select" on public.implementations
for select to anon, authenticated
using (
  exists (
    select 1 from public.ideas i
    where i.id = implementations.idea_id
      and i.visibility in ('PUBLISHED', 'NEEDS_REFINEMENT')
  ) or auth.uid() = lead_user_id
);
create policy "implementations_lead_modify" on public.implementations
for all to authenticated
using (auth.uid() = lead_user_id)
with check (auth.uid() = lead_user_id);

create policy "members_self_or_public_read" on public.implementation_members
for select to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1 from public.implementations imp
    join public.ideas i on i.id = imp.idea_id
    where imp.id = implementation_members.implementation_id
      and i.visibility in ('PUBLISHED', 'NEEDS_REFINEMENT')
  )
);
create policy "members_insert_self" on public.implementation_members
for insert to authenticated
with check (auth.uid() = user_id);

create policy "join_requests_owner_or_requester_select" on public.join_requests
for select to authenticated
using (
  auth.uid() = requester_user_id
  or exists (
    select 1 from public.implementations imp
    where imp.id = join_requests.implementation_id and imp.lead_user_id = auth.uid()
  )
);
create policy "join_requests_requester_insert" on public.join_requests
for insert to authenticated
with check (auth.uid() = requester_user_id);
create policy "join_requests_update_owner_or_requester" on public.join_requests
for update to authenticated
using (
  auth.uid() = requester_user_id
  or exists (
    select 1 from public.implementations imp
    where imp.id = join_requests.implementation_id and imp.lead_user_id = auth.uid()
  )
);

create policy "saved_ideas_owner_all" on public.saved_ideas
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select on public.implementation_members_public to anon, authenticated;

insert into storage.buckets (id, name, public)
values
  ('profile-images', 'profile-images', true),
  ('idea-screenshots', 'idea-screenshots', true)
on conflict (id) do nothing;

create policy "profile_images_public_read" on storage.objects
for select to anon, authenticated
using (bucket_id = 'profile-images');
create policy "profile_images_owner_insert" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'profile-images'
  and split_part(name, '/', 1) = auth.uid()::text
);
create policy "profile_images_owner_update" on storage.objects
for update to authenticated
using (
  bucket_id = 'profile-images'
  and split_part(name, '/', 1) = auth.uid()::text
);
create policy "profile_images_owner_delete" on storage.objects
for delete to authenticated
using (
  bucket_id = 'profile-images'
  and split_part(name, '/', 1) = auth.uid()::text
);

create policy "idea_screenshots_public_read" on storage.objects
for select to anon, authenticated
using (bucket_id = 'idea-screenshots');
create policy "idea_screenshots_owner_insert" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'idea-screenshots'
  and split_part(name, '/', 1) = auth.uid()::text
);
create policy "idea_screenshots_owner_update" on storage.objects
for update to authenticated
using (
  bucket_id = 'idea-screenshots'
  and split_part(name, '/', 1) = auth.uid()::text
);
create policy "idea_screenshots_owner_delete" on storage.objects
for delete to authenticated
using (
  bucket_id = 'idea-screenshots'
  and split_part(name, '/', 1) = auth.uid()::text
);
