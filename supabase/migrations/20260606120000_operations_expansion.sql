-- Operations expansion: scheduling, technicians, reports, invoices, messages,
-- reviews, maintenance plans, and reminder queue.

alter table public.branches
  add column if not exists appointment_slot_minutes int not null default 120
    check (appointment_slot_minutes between 15 and 480),
  add column if not exists daily_capacity int not null default 4
    check (daily_capacity > 0);

grant update (appointment_slot_minutes, daily_capacity, updated_at) on public.branches to authenticated;

create table if not exists public.technicians (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  phone text,
  specialties text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_request_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(btrim(body)) > 0 and length(body) <= 1200),
  attachment_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.service_request_inspections (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.service_requests(id) on delete cascade,
  checklist jsonb not null default '[]'::jsonb,
  diagnosis text,
  before_image_url text,
  after_image_url text,
  customer_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_request_invoice_items (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  description text not null check (length(btrim(description)) > 0),
  quantity numeric(10,2) not null default 1 check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.service_request_reviews (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.service_requests(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text check (comment is null or length(comment) <= 800),
  created_at timestamptz not null default now()
);

create table if not exists public.vehicle_maintenance_plans (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  interval_km int check (interval_km is null or interval_km > 0),
  interval_months int check (interval_months is null or interval_months > 0),
  last_service_mileage int check (last_service_mileage is null or last_service_mileage >= 0),
  last_service_at date,
  next_due_mileage int check (next_due_mileage is null or next_due_mileage >= 0),
  next_due_at date,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vehicle_maintenance_plans_interval_check check (
    interval_km is not null or interval_months is not null
  )
);

create table if not exists public.service_reminders (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.service_requests(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null default 'custom'
    check (kind in ('appointment', 'technician_arrival', 'follow_up', 'offer', 'custom')),
  title text not null,
  body text not null,
  remind_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.service_requests
  add column if not exists assigned_technician_id uuid references public.technicians(id) on delete set null;

grant update (assigned_technician_id, updated_at) on public.service_requests to authenticated;

create trigger technicians_set_updated_at
  before update on public.technicians
  for each row execute function public.set_updated_at();

create trigger service_request_inspections_set_updated_at
  before update on public.service_request_inspections
  for each row execute function public.set_updated_at();

create trigger vehicle_maintenance_plans_set_updated_at
  before update on public.vehicle_maintenance_plans
  for each row execute function public.set_updated_at();

create trigger service_reminders_set_updated_at
  before update on public.service_reminders
  for each row execute function public.set_updated_at();

create index if not exists technicians_active_idx on public.technicians(is_active);
create index if not exists service_request_messages_request_created_idx
  on public.service_request_messages(request_id, created_at);
create index if not exists service_request_invoice_items_request_idx
  on public.service_request_invoice_items(request_id);
create index if not exists service_request_reviews_customer_idx
  on public.service_request_reviews(customer_id);
create index if not exists vehicle_maintenance_plans_customer_idx
  on public.vehicle_maintenance_plans(customer_id, is_active);
create index if not exists service_reminders_profile_status_idx
  on public.service_reminders(profile_id, status, remind_at);

alter table public.technicians enable row level security;
alter table public.service_request_messages enable row level security;
alter table public.service_request_inspections enable row level security;
alter table public.service_request_invoice_items enable row level security;
alter table public.service_request_reviews enable row level security;
alter table public.vehicle_maintenance_plans enable row level security;
alter table public.service_reminders enable row level security;

revoke all on public.technicians from anon, authenticated;
revoke all on public.service_request_messages from anon, authenticated;
revoke all on public.service_request_inspections from anon, authenticated;
revoke all on public.service_request_invoice_items from anon, authenticated;
revoke all on public.service_request_reviews from anon, authenticated;
revoke all on public.vehicle_maintenance_plans from anon, authenticated;
revoke all on public.service_reminders from anon, authenticated;

grant select, insert on public.technicians to authenticated;
grant update (full_name, phone, specialties, is_active, updated_at) on public.technicians to authenticated;

grant select on public.service_request_messages to authenticated;
grant select on public.service_request_inspections to authenticated;
grant select on public.service_request_invoice_items to authenticated;
grant select, insert on public.service_request_reviews to authenticated;
grant select, insert, update (title, interval_km, interval_months, last_service_mileage, last_service_at, next_due_mileage, next_due_at, notes, is_active, updated_at)
  on public.vehicle_maintenance_plans to authenticated;
grant select on public.service_reminders to authenticated;

create policy "technicians_select_authenticated" on public.technicians
  for select to authenticated using (true);

create policy "technicians_insert_staff" on public.technicians
  for insert to authenticated with check (public.is_staff());

create policy "technicians_update_staff" on public.technicians
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "messages_select_request_participant" on public.service_request_messages
  for select to authenticated
  using (
    exists (
      select 1 from public.service_requests sr
      where sr.id = request_id and (sr.customer_id = auth.uid() or public.is_staff())
    )
  );

create policy "inspections_select_request_participant" on public.service_request_inspections
  for select to authenticated
  using (
    exists (
      select 1 from public.service_requests sr
      where sr.id = request_id
        and (public.is_staff() or (sr.customer_id = auth.uid() and customer_visible))
    )
  );

create policy "invoice_items_select_request_participant" on public.service_request_invoice_items
  for select to authenticated
  using (
    exists (
      select 1 from public.service_requests sr
      where sr.id = request_id and (sr.customer_id = auth.uid() or public.is_staff())
    )
  );

create policy "reviews_select_request_participant" on public.service_request_reviews
  for select to authenticated
  using (
    customer_id = auth.uid()
    or public.is_staff()
  );

create policy "reviews_insert_customer_completed_request" on public.service_request_reviews
  for insert to authenticated
  with check (
    customer_id = auth.uid()
    and exists (
      select 1 from public.service_requests sr
      where sr.id = request_id
        and sr.customer_id = auth.uid()
        and sr.status = 'completed'
    )
  );

create policy "maintenance_plans_select_own_or_staff" on public.vehicle_maintenance_plans
  for select to authenticated using (customer_id = auth.uid() or public.is_staff());

create policy "maintenance_plans_insert_own" on public.vehicle_maintenance_plans
  for insert to authenticated
  with check (
    customer_id = auth.uid()
    and exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.owner_id = auth.uid()
    )
  );

create policy "maintenance_plans_update_own" on public.vehicle_maintenance_plans
  for update to authenticated
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

create policy "reminders_select_owner_or_staff" on public.service_reminders
  for select to authenticated
  using (profile_id = auth.uid() or public.is_staff());

create or replace function public.recalculate_service_request_final_price(p_request_id uuid)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total numeric(10,2);
begin
  select coalesce(sum(quantity * unit_price), 0)
    into v_total
  from public.service_request_invoice_items
  where request_id = p_request_id;

  update public.service_requests
  set final_price = nullif(v_total, 0)
  where id = p_request_id;

  return v_total;
end;
$$;

create or replace function public.refresh_service_request_final_price()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request_id uuid;
begin
  if tg_op = 'DELETE' then
    v_request_id = old.request_id;
  else
    v_request_id = new.request_id;
  end if;

  perform public.recalculate_service_request_final_price(v_request_id);
  return null;
end;
$$;

drop trigger if exists service_request_invoice_refresh_total
  on public.service_request_invoice_items;

create trigger service_request_invoice_refresh_total
  after insert or update or delete on public.service_request_invoice_items
  for each row execute function public.refresh_service_request_final_price();

create or replace function public.get_available_branch_slots(
  p_branch_id uuid,
  p_service_id uuid,
  p_date date
)
returns table(slot_time text, remaining_capacity int)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_branch public.branches%rowtype;
  v_service public.services%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into v_branch
  from public.branches
  where id = p_branch_id and is_active = true;

  if not found then
    raise exception 'Branch not found or not active';
  end if;

  select * into v_service
  from public.services
  where id = p_service_id and is_active = true;

  if not found then
    raise exception 'Service not found or not active';
  end if;

  if v_service.service_type not in ('branch', 'both') then
    raise exception 'Service is not available for branch appointments';
  end if;

  return query
  with slots as (
    select generate_series(
      p_date::timestamp + time '08:00',
      p_date::timestamp + time '18:00',
      make_interval(mins => v_branch.appointment_slot_minutes)
    ) as slot_at
  ),
  booked as (
    select date_trunc('minute', scheduled_at at time zone current_setting('timezone')) as booked_at,
           count(*)::int as booked_count
    from public.service_requests
    where branch_id = p_branch_id
      and request_type = 'branch_appointment'
      and status in ('pending', 'confirmed', 'in_progress')
      and scheduled_at >= p_date::timestamp
      and scheduled_at < (p_date + 1)::timestamp
    group by 1
  )
  select
    to_char(slots.slot_at, 'HH24:MI') as slot_time,
    greatest(v_branch.daily_capacity - coalesce(booked.booked_count, 0), 0) as remaining_capacity
  from slots
  left join booked on booked.booked_at = slots.slot_at
  where greatest(v_branch.daily_capacity - coalesce(booked.booked_count, 0), 0) > 0
  order by slots.slot_at;
end;
$$;

create or replace function public.assign_service_request_staff(
  p_request_id uuid,
  p_staff_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then
    raise exception 'Only staff can assign technicians';
  end if;

  if not exists (
    select 1 from public.technicians
    where id = p_staff_id and is_active = true
  ) then
    raise exception 'Technician not found or inactive';
  end if;

  update public.service_requests
  set assigned_technician_id = p_staff_id
  where id = p_request_id;

  if not found then
    raise exception 'Service request not found';
  end if;

  insert into public.service_request_events (request_id, status, note)
  select p_request_id, status, 'Technician assigned'
  from public.service_requests
  where id = p_request_id;

  return p_request_id;
end;
$$;

create or replace function public.send_service_request_message(
  p_request_id uuid,
  p_body text,
  p_attachment_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_message_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1 from public.service_requests sr
    where sr.id = p_request_id and (sr.customer_id = auth.uid() or public.is_staff())
  ) then
    raise exception 'Request not found or not accessible';
  end if;

  insert into public.service_request_messages (request_id, sender_id, body, attachment_url)
  values (p_request_id, auth.uid(), btrim(p_body), nullif(btrim(coalesce(p_attachment_url, '')), ''))
  returning id into v_message_id;

  return v_message_id;
end;
$$;

create or replace function public.upsert_service_request_inspection(
  p_request_id uuid,
  p_checklist jsonb default '[]'::jsonb,
  p_diagnosis text default null,
  p_before_image_url text default null,
  p_after_image_url text default null,
  p_customer_visible boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.is_staff() then
    raise exception 'Only staff can save inspection reports';
  end if;

  insert into public.service_request_inspections (
    request_id, checklist, diagnosis, before_image_url, after_image_url, customer_visible
  )
  values (
    p_request_id,
    coalesce(p_checklist, '[]'::jsonb),
    nullif(btrim(coalesce(p_diagnosis, '')), ''),
    nullif(btrim(coalesce(p_before_image_url, '')), ''),
    nullif(btrim(coalesce(p_after_image_url, '')), ''),
    coalesce(p_customer_visible, true)
  )
  on conflict (request_id) do update set
    checklist = excluded.checklist,
    diagnosis = excluded.diagnosis,
    before_image_url = excluded.before_image_url,
    after_image_url = excluded.after_image_url,
    customer_visible = excluded.customer_visible,
    updated_at = now()
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.add_service_request_invoice_item(
  p_request_id uuid,
  p_description text,
  p_quantity numeric,
  p_unit_price numeric
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.is_staff() then
    raise exception 'Only staff can add invoice items';
  end if;

  insert into public.service_request_invoice_items (
    request_id, description, quantity, unit_price
  )
  values (p_request_id, btrim(p_description), p_quantity, p_unit_price)
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.schedule_service_reminder(
  p_request_id uuid,
  p_profile_id uuid,
  p_kind text,
  p_title text,
  p_body text,
  p_remind_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if not public.is_staff() and p_profile_id <> auth.uid() then
    raise exception 'Not allowed to schedule this reminder';
  end if;

  if p_request_id is not null and not exists (
    select 1 from public.service_requests sr
    where sr.id = p_request_id and (sr.customer_id = p_profile_id or public.is_staff())
  ) then
    raise exception 'Request not found or not accessible';
  end if;

  insert into public.service_reminders (request_id, profile_id, kind, title, body, remind_at)
  values (
    p_request_id,
    p_profile_id,
    coalesce(nullif(btrim(p_kind), ''), 'custom'),
    btrim(p_title),
    btrim(p_body),
    p_remind_at
  )
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.get_available_branch_slots(uuid, uuid, date) to authenticated;
grant execute on function public.assign_service_request_staff(uuid, uuid) to authenticated;
grant execute on function public.send_service_request_message(uuid, text, text) to authenticated;
grant execute on function public.upsert_service_request_inspection(uuid, jsonb, text, text, text, boolean) to authenticated;
grant execute on function public.add_service_request_invoice_item(uuid, text, numeric, numeric) to authenticated;
grant execute on function public.schedule_service_reminder(uuid, uuid, text, text, text, timestamptz) to authenticated;
