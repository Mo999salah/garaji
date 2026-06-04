-- Bootstrap Garaji app identity records from Supabase Auth signup metadata.
-- Client apps should pass role/profile metadata to auth.signUp; this trigger owns
-- the trusted database inserts and keeps role assignment out of client-updatable tables.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  selected_role text := nullif(btrim(metadata ->> 'role'), '');
  profile_full_name text := nullif(btrim(metadata ->> 'full_name'), '');
  profile_phone text := nullif(btrim(metadata ->> 'phone'), '');
  selected_merchant_name text := nullif(btrim(metadata ->> 'merchant_name'), '');
  selected_region text := nullif(btrim(metadata ->> 'region'), '');
begin
  if selected_role is null or selected_role not in ('customer', 'merchant') then
    raise exception 'Invalid signup role: %', coalesce(selected_role, '<missing>')
      using errcode = '22023';
  end if;

  if selected_role = 'merchant' and selected_merchant_name is null then
    raise exception 'merchant_name is required for merchant signup'
      using errcode = '23502';
  end if;

  insert into public.profiles (id, full_name, phone, role)
  values (new.id, profile_full_name, profile_phone, selected_role);

  if selected_role = 'merchant' then
    insert into public.merchants (owner_id, name, region)
    values (new.id, selected_merchant_name, selected_region);
  end if;

  return new;
end;
$$;

comment on function public.handle_new_auth_user()
is 'Creates app profile and optional merchant records from validated Supabase Auth signup metadata.';

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();
