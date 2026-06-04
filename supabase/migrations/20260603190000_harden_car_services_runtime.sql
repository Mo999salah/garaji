-- Harden the car-services runtime and ensure remote projects receive the base catalog.
-- This migration is intentionally idempotent: it can be applied safely once per Supabase project.

-- Staff status changes must go through update_service_request_status so the
-- transition guard and service_request_events audit trail stay in sync.
revoke update on public.service_requests from authenticated;

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
  v_service     public.services%rowtype;
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

  select *
  into v_service
  from public.services
  where id = p_service_id
    and is_active = true;

  if not found then
    raise exception 'Service is not available';
  end if;

  if p_request_type = 'branch_appointment' then
    if v_service.service_type not in ('branch', 'both') then
      raise exception 'Service is not available for branch appointments';
    end if;

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
    if v_service.service_type not in ('mobile', 'both') then
      raise exception 'Service is not available for mobile requests';
    end if;

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
    scheduled_at, notes, estimated_price
  )
  values (
    v_customer_id, p_vehicle_id, p_service_id, p_request_type,
    p_branch_id,
    nullif(btrim(coalesce(p_location_city, '')), ''),
    nullif(btrim(coalesce(p_location_address, '')), ''),
    p_location_lat, p_location_lng,
    p_scheduled_at,
    nullif(btrim(coalesce(p_notes, '')), ''),
    v_service.estimated_price
  )
  returning id into v_request_id;

  insert into public.service_request_events (request_id, status, note)
  values (v_request_id, 'pending', 'Request submitted');

  return v_request_id;
end;
$$;

comment on function public.create_service_request is
  'Creates a service request atomically and records the initial pending event. Validates vehicle ownership, active service, service delivery type, and location constraints.';

-- Base branches. These rows are shared catalog data, not user data.
insert into public.branches (id, name, city, address, phone, working_hours, is_active)
values
  (
    '00000000-0000-0000-0001-000000000001',
    'الرياض - الفرع الرئيسي',
    'الرياض',
    'طريق الملك فهد، حي العليا',
    '+966-11-000-0001',
    'السبت - الخميس: 8ص - 8م',
    true
  ),
  (
    '00000000-0000-0000-0001-000000000002',
    'الرياض - الشرقية',
    'الرياض',
    'شارع الأمير محمد بن عبدالعزيز، حي الشرقية',
    '+966-11-000-0002',
    'السبت - الخميس: 8ص - 6م',
    true
  ),
  (
    '00000000-0000-0000-0001-000000000003',
    'جدة - الفرع الرئيسي',
    'جدة',
    'شارع التحلية، حي الروضة',
    '+966-12-000-0003',
    'السبت - الخميس: 8ص - 8م',
    true
  ),
  (
    '00000000-0000-0000-0001-000000000004',
    'الدمام - الفرع الرئيسي',
    'الدمام',
    'شارع الملك فيصل، حي الفيصلية',
    '+966-13-000-0004',
    'السبت - الخميس: 8ص - 6م',
    true
  )
on conflict (id) do update set
  name          = excluded.name,
  city          = excluded.city,
  address       = excluded.address,
  phone         = excluded.phone,
  working_hours = excluded.working_hours,
  is_active     = excluded.is_active;

-- Base services. Fixed UUIDs keep dev/test flows reproducible.
insert into public.services (
  id, name, description, service_type, estimated_price, duration_minutes, is_active, sort_order
)
values
  (
    '00000000-0000-0000-0002-000000000001',
    'تغيير الزيت والفلتر',
    'تغيير زيت المحرك وفلتر الزيت مع فحص شامل للسوائل.',
    'both',
    150.00,
    45,
    true,
    10
  ),
  (
    '00000000-0000-0000-0002-000000000002',
    'الصيانة الدورية (5,000 كم)',
    'صيانة شاملة كل 5,000 كم: زيت، فلاتر، إطارات، فرامل.',
    'branch',
    350.00,
    90,
    true,
    20
  ),
  (
    '00000000-0000-0000-0002-000000000003',
    'الصيانة الدورية (10,000 كم)',
    'صيانة كاملة كل 10,000 كم مع التحقق من جميع أنظمة السيارة.',
    'branch',
    550.00,
    120,
    true,
    30
  ),
  (
    '00000000-0000-0000-0002-000000000004',
    'فحص شامل',
    'فحص 100 نقطة لجميع أنظمة السيارة مع تقرير مفصل.',
    'branch',
    200.00,
    60,
    true,
    40
  ),
  (
    '00000000-0000-0000-0002-000000000005',
    'تغيير الزيت بالموقع',
    'نأتي إليك: تغيير زيت المحرك وفلتر الزيت في موقعك.',
    'mobile',
    180.00,
    60,
    true,
    50
  ),
  (
    '00000000-0000-0000-0002-000000000006',
    'فحص وتبديل الفرامل',
    'فحص نظام الفرامل وتبديل التيل والأقراص عند الحاجة.',
    'branch',
    null,
    90,
    true,
    60
  ),
  (
    '00000000-0000-0000-0002-000000000007',
    'ضخ الهواء وتدوير الإطارات',
    'فحص الضغط وتدوير الإطارات لتوزيع التآكل بالتساوي.',
    'both',
    80.00,
    30,
    true,
    70
  ),
  (
    '00000000-0000-0000-0002-000000000008',
    'تنظيف المحرك بالبخار',
    'تنظيف عميق لحجرة المحرك بالبخار.',
    'branch',
    120.00,
    45,
    true,
    80
  )
on conflict (id) do update set
  name              = excluded.name,
  description       = excluded.description,
  service_type      = excluded.service_type,
  estimated_price   = excluded.estimated_price,
  duration_minutes  = excluded.duration_minutes,
  is_active         = excluded.is_active,
  sort_order        = excluded.sort_order;
