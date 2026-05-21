alter table public.implementations
  add column if not exists needed_roles text[] not null default '{}';

