-- Order customer snapshot, atomic order creation, and broader merchant cancellation.

alter table public.orders
  add column if not exists customer_name text;

comment on column public.orders.customer_name is
  'Customer display name captured when the order is created.';

create or replace function public.set_order_customer_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_name text;
begin
  select p.full_name
  into profile_name
  from public.profiles p
  where p.id = new.customer_id;

  new.customer_name = coalesce(nullif(btrim(profile_name), ''), 'Garaji customer');
  return new;
end;
$$;

drop trigger if exists orders_set_customer_name on public.orders;

create trigger orders_set_customer_name
before insert on public.orders
for each row execute function public.set_order_customer_name();

create or replace function public.validate_order_status_transition()
returns trigger
language plpgsql
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if old.status in ('delivered', 'cancelled') then
    raise exception 'Delivered or cancelled orders cannot be changed';
  end if;

  if not (
    (old.status = 'pending' and new.status in ('processing', 'cancelled')) or
    (old.status = 'processing' and new.status in ('on_the_way', 'cancelled')) or
    (old.status = 'on_the_way' and new.status in ('delivered', 'cancelled'))
  ) then
    raise exception 'Invalid order status transition from % to %', old.status, new.status;
  end if;

  return new;
end;
$$;

create or replace function public.create_order_with_items(
  p_merchant_id uuid,
  p_notes text default null,
  p_items jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid := auth.uid();
  v_order_id uuid;
  v_item jsonb;
  v_product_id uuid;
  v_quantity int;
begin
  if v_customer_id is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = v_customer_id
      and p.role = 'customer'
  ) then
    raise exception 'Only customers can create orders';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must include at least one item';
  end if;

  insert into public.orders (customer_id, merchant_id, status, notes, subtotal)
  values (v_customer_id, p_merchant_id, 'pending', nullif(btrim(p_notes), ''), 0)
  returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_quantity := (v_item ->> 'quantity')::int;

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Each order item needs a positive quantity';
    end if;

    insert into public.order_items (order_id, product_id, name, brand, unit_price, quantity, unit)
    values (v_order_id, v_product_id, 'pending', 'pending', 0, v_quantity, 'pending');
  end loop;

  return v_order_id;
end;
$$;

comment on function public.create_order_with_items(uuid, text, jsonb) is
  'Creates an order and line items atomically for the signed-in customer.';

grant execute on function public.create_order_with_items(uuid, text, jsonb) to authenticated;
