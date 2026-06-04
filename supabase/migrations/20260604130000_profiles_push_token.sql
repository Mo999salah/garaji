-- Client-side Expo push token registration support.

alter table public.profiles
  add column if not exists push_token text;

grant update (push_token, updated_at) on public.profiles to authenticated;
