alter table public.profiles
  add column if not exists headline text,
  add column if not exists location text;
