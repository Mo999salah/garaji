-- Car services platform: drop e-commerce domain, create car services domain.
-- Keeps: profiles, merchants (staff accounts), auth triggers.
-- Drops: products, categories, orders, order_items and their functions/triggers.
-- Adds: vehicles, branches, services, service_requests, service_request_events.

-- ============================================================
-- 1. Drop old e-commerce domain (reverse FK order)
-- ============================================================
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.products cascade;
drop table if exists public.categories cascade;

drop function if exists public.create_order_with_items(uuid, text, jsonb) cascade;
drop function if exists public.update_order_status(uuid, uuid, text) cascade;
drop function if exists public.set_order_customer_name() cascade;
drop function if exists public.set_order_item_product_snapshot() cascade;
drop function if exists public.refresh_order_subtotal() cascade;
drop function if exists public.validate_order_status_transition() cascade;
drop function if exists public.is_merchant_owner(uuid) cascade;

-- ============================================================
-- 2. New tables
-- ============================================================

-- Customer's vehicle garage
create table if not exists public.vehicles (
  id           uuid         primary key default gen_random_uuid(),
  owner_id     uuid         not null references public.profiles(id) on delete cascade,
  make         text         not null,
  model        text         not null,
  year         int          not null check (year >= 1900 and year <= 2100),
  plate_number text         not null,
  color        text,
  mileage      int          check (mileage is null or mileage >= 0),
  created_at   timestamptz  not null default now(),
  updated_at   timestamptz  not null default now()
);
comment on table public.vehicles is 'Customer vehicle garage. Each vehicle belongs to one customer profile.';

-- Company branches (physical service centers)
create table if not exists public.branches (
  id            uuid        primary key default gen_random_uuid(),
  name          text        not null,
  city          text        not null,
  address       text        not null,
  lat           numeric(10,7),
  lng           numeric(10,7),
  phone         text,
  working_hours text,
  is_active     boolean     not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
comment on table public.branches is 'Company branch locations where customers can book appointments.';

-- Service catalog (e.g. oil change, full maintenance)
create table if not exists public.services (
  id                uuid        primary key default gen_random_uuid(),
  name              text        not null,
  description       text        not null default '',
  service_type      text        not null check (service_type in ('branch', 'mobile', 'both')),
  estimated_price   numeric(10,2) check (estimated_price is null or estimated_price >= 0),
  duration_minutes  int         check (duration_minutes is null or duration_minutes > 0),
  is_active         boolean     not null default true,
  sort_order        int         not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
comment on table public.services is 'Service catalog. service_type controls where the service can be delivered.';

-- Service requests / bookings
create table if not exists public.service_requests (
  id               uuid         primary key default gen_random_uuid(),
  customer_id      uuid         not null references public.profiles(id),
  vehicle_id       uuid         not null references public.vehicles(id),
  service_id       uuid         not null references public.services(id),
  request_type     text         not null check (request_type in ('branch_appointment', 'mobile_service')),
  branch_id        uuid         references public.branches(id),
  location_city    text,
  location_address text,
  location_lat     numeric(10,7),
  location_lng     numeric(10,7),
  scheduled_at     timestamptz  not null,
  status           text         not null default 'pending' check (
    status in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')
  ),
  assigned_staff_id uuid        references public.profiles(id),
  notes            text,
  estimated_price  numeric(10,2) check (estimated_price is null or estimated_price >= 0),
  final_price      numeric(10,2) check (final_price is null or final_price >= 0),
  created_at       timestamptz  not null default now(),
  updated_at       timestamptz  not null default now(),
  constraint service_requests_location_check check (
    (request_type = 'branch_appointment' and branch_id is not null) or
    (request_type = 'mobile_service' and location_city is not null and location_address is not null)
  )
);
comment on table public.service_requests is 'Customer bookings. Branch appointments require branch_id; mobile services require city + address.';

-- Status history / audit timeline
create table if not exists public.service_request_events (
  id         uuid        primary key default gen_random_uuid(),
  request_id uuid        not null references public.service_requests(id) on delete cascade,
  status     text        not null,
  note       text,
  created_at timestamptz not null default now()
);
comment on table public.service_request_events is 'Immutable audit log of each status change on a service request.';

-- ============================================================
-- 3. Indexes
-- ============================================================
create index if not exists vehicles_owner_id_idx
  on public.vehicles(owner_id);

create index if not exists branches_is_active_idx
  on public.branches(is_active) where is_active = true;

create index if not exists services_sort_order_idx
  on public.services(sort_order);

create index if not exists services_type_active_idx
  on public.services(service_type, is_active);

create index if not exists service_requests_customer_created_idx
  on public.service_requests(customer_id, created_at desc);

create index if not exists service_requests_status_idx
  on public.service_requests(status);

create index if not exists service_requests_scheduled_at_idx
  on public.service_requests(scheduled_at);

create index if not exists service_request_events_request_id_idx
  on public.service_request_events(request_id, created_at);

-- ============================================================
-- 4. updated_at triggers (reuse existing set_updated_at())
-- ============================================================
create trigger vehicles_set_updated_at
  before update on public.vehicles
  for each row execute function public.set_updated_at();

create trigger branches_set_updated_at
  before update on public.branches
  for each row execute function public.set_updated_at();

create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

create trigger service_requests_set_updated_at
  before update on public.service_requests
  for each row execute function public.set_updated_at();

-- ============================================================
-- 5. Status transition guard
-- ============================================================
create or replace function public.validate_service_request_status_transition()
returns trigger
language plpgsql
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if old.status in ('completed', 'cancelled') then
    raise exception 'Completed or cancelled requests cannot be changed';
  end if;

  if not (
    (old.status = 'pending'     and new.status in ('confirmed', 'cancelled')) or
    (old.status = 'confirmed'   and new.status in ('in_progress', 'cancelled')) or
    (old.status = 'in_progress' and new.status = 'completed')
  ) then
    raise exception 'Invalid status transition from % to %', old.status, new.status;
  end if;

  return new;
end;
$$;

create trigger service_requests_validate_status_transition
  before update of status on public.service_requests
  for each row execute function public.validate_service_request_status_transition();

-- ============================================================
-- 6. Helper: is current user a staff member (merchant role)
-- ============================================================
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'merchant'
  );
$$;
comment on function public.is_staff() is
  'Returns true when the calling user holds the merchant/staff role.';

-- ============================================================
-- 7. RPC: create_service_request — atomic booking creation
-- ============================================================
create or replace function public.create_service_request(
  p_vehicle_id       uuid,
  p_service_id       uuid,
  p_request_type     text,
  p_scheduled_at     timestamptz,
  p_branch_id        uuid        default null,
  p_location_city    text        default null,
  p_location_address text        default null,
  p_location_lat     numeric     default null,
  p_location_lng     numeric     default null,
  p_notes            text        default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid := auth.uid();
  v_request_id  uuid;
begin
  if v_customer_id is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = v_customer_id and role = 'customer'
  ) then
    raise exception 'Only customers can create service requests';
  end if;

  if not exists (
    select 1 from public.vehicles
    where id = p_vehicle_id and owner_id = v_customer_id
  ) then
    raise exception 'Vehicle not found or does not belong to you';
  end if;

  if not exists (
    select 1 from public.services
    where id = p_service_id and is_active = true
  ) then
    raise exception 'Service is not available';
  end if;

  if p_request_type = 'branch_appointment' then
    if p_branch_id is null then
      raise exception 'Branch is required for branch appointments';
    end if;
    if not exists (
      select 1 from public.branches
      where id = p_branch_id and is_active = true
    ) then
      raise exception 'Branch not found or not active';
    end if;
  elsif p_request_type = 'mobile_service' then
    if p_location_city is null or btrim(p_location_city) = '' then
      raise exception 'City is required for mobile service';
    end if;
    if p_location_address is null or btrim(p_location_address) = '' then
      raise exception 'Address is required for mobile service';
    end if;
  else
    raise exception 'Invalid request type: %', p_request_type;
  end if;

  insert into public.service_requests (
    customer_id, vehicle_id, service_id, request_type,
    branch_id,
    location_city, location_address, location_lat, location_lng,
    scheduled_at, notes
  )
  values (
    v_customer_id, p_vehicle_id, p_service_id, p_request_type,
    p_branch_id,
    nullif(btrim(coalesce(p_location_city, '')), ''),
    nullif(btrim(coalesce(p_location_address, '')), ''),
    p_location_lat, p_location_lng,
    p_scheduled_at,
    nullif(btrim(coalesce(p_notes, '')), '')
  )
  returning id into v_request_id;

  insert into public.service_request_events (request_id, status, note)
  values (v_request_id, 'pending', 'Request submitted');

  return v_request_id;
end;
$$;
comment on function public.create_service_request is
  'Creates a service request atomically and records the initial pending event. Validates vehicle ownership, active service, and location constraints.';

-- ============================================================
-- 8. RPC: update_service_request_status — staff status moves
-- ============================================================
create or replace function public.update_service_request_status(
  p_request_id  uuid,
  p_next_status text,
  p_note        text    default null,
  p_final_price numeric default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.service_requests%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_staff() then
    raise exception 'Only staff can update service request status';
  end if;

  if p_next_status not in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') then
    raise exception 'Invalid status: %', p_next_status;
  end if;

  select * into v_request
  from public.service_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Service request not found';
  end if;

  -- Trigger on the table validates the transition
  update public.service_requests
  set
    status      = p_next_status,
    final_price = coalesce(p_final_price, final_price)
  where id = p_request_id;

  insert into public.service_request_events (request_id, status, note)
  values (
    p_request_id,
    p_next_status,
    nullif(btrim(coalesce(p_note, '')), '')
  );

  return p_request_id;
end;
$$;
comment on function public.update_service_request_status is
  'Staff-only: moves a service request to the next valid status and appends an event in one transaction.';

-- ============================================================
-- 9. Row-level security
-- ============================================================
alter table public.vehicles               enable row level security;
alter table public.branches               enable row level security;
alter table public.services               enable row level security;
alter table public.service_requests       enable row level security;
alter table public.service_request_events enable row level security;

revoke all on public.vehicles               from anon, authenticated;
revoke all on public.branches               from anon, authenticated;
revoke all on public.services               from anon, authenticated;
revoke all on public.service_requests       from anon, authenticated;
revoke all on public.service_request_events from anon, authenticated;

-- Vehicles
grant select, insert        on public.vehicles to authenticated;
grant update (make, model, year, plate_number, color, mileage, updated_at)
             on public.vehicles to authenticated;
grant delete                on public.vehicles to authenticated;

-- Branches (staff manages, all read)
grant select, insert        on public.branches to authenticated;
grant update (name, city, address, lat, lng, phone, working_hours, is_active, updated_at)
             on public.branches to authenticated;

-- Services (staff manages, all read)
grant select, insert        on public.services to authenticated;
grant update (name, description, service_type, estimated_price, duration_minutes, is_active, sort_order, updated_at)
             on public.services to authenticated;

-- Service requests: select/update only — insert is via RPC
grant select                on public.service_requests to authenticated;
grant update (status, assigned_staff_id, notes, estimated_price, final_price, updated_at)
             on public.service_requests to authenticated;

-- Service request events: select only — insert via RPC (security definer)
grant select                on public.service_request_events to authenticated;

-- RPCs
grant execute on function public.create_service_request               to authenticated;
grant execute on function public.update_service_request_status        to authenticated;
grant execute on function public.is_staff()                           to authenticated;

-- ============================================================
-- 10. RLS policies
-- ============================================================

-- Vehicles: owner reads/writes own; staff reads all
create policy "vehicles_select_own_or_staff" on public.vehicles
  for select to authenticated
  using (owner_id = auth.uid() or public.is_staff());

create policy "vehicles_insert_own" on public.vehicles
  for insert to authenticated
  with check (owner_id = auth.uid());

create policy "vehicles_update_own" on public.vehicles
  for update to authenticated
  using  (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "vehicles_delete_own" on public.vehicles
  for delete to authenticated
  using (owner_id = auth.uid());

-- Branches: all read; staff insert/update
create policy "branches_select_authenticated" on public.branches
  for select to authenticated using (true);

create policy "branches_insert_staff" on public.branches
  for insert to authenticated
  with check (public.is_staff());

create policy "branches_update_staff" on public.branches
  for update to authenticated
  using  (public.is_staff())
  with check (public.is_staff());

-- Services: all read; staff insert/update
create policy "services_select_authenticated" on public.services
  for select to authenticated using (true);

create policy "services_insert_staff" on public.services
  for insert to authenticated
  with check (public.is_staff());

create policy "services_update_staff" on public.services
  for update to authenticated
  using  (public.is_staff())
  with check (public.is_staff());

-- Service requests: customer sees own; staff sees all; update only via RPC
create policy "service_requests_select_own_or_staff" on public.service_requests
  for select to authenticated
  using (customer_id = auth.uid() or public.is_staff());

create policy "service_requests_update_staff" on public.service_requests
  for update to authenticated
  using  (public.is_staff())
  with check (public.is_staff());

-- Block direct inserts; force use of create_service_request RPC
revoke insert on public.service_requests from authenticated;

-- Service request events: inherit visibility from parent request
create policy "service_request_events_select" on public.service_request_events
  for select to authenticated
  using (
    exists (
      select 1 from public.service_requests sr
      where sr.id = request_id
        and (sr.customer_id = auth.uid() or public.is_staff())
    )
  );
