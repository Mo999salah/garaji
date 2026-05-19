-- Qitaa initial schema.
-- This migration is database design only; the mobile app still uses local mock stores.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null check (role in ('customer', 'merchant')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.merchants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  region text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint merchants_owner_unique unique (owner_id)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  category_id uuid not null references public.categories(id),
  name text not null,
  brand text not null,
  description text not null,
  price numeric(12, 2) not null check (price >= 0),
  unit text not null,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id),
  merchant_id uuid not null references public.merchants(id),
  status text not null default 'pending' check (
    status in ('pending', 'processing', 'on_the_way', 'delivered', 'cancelled')
  ),
  notes text,
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  name text not null,
  brand text not null,
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  quantity int not null check (quantity > 0),
  unit text not null
);

comment on table public.profiles is 'One profile per Supabase auth user. Role controls customer versus merchant app access.';
comment on table public.merchants is 'Merchant account owned by a merchant profile.';
comment on table public.products is 'Merchant-owned catalog products. Customers only read active products.';
comment on table public.orders is 'Customer orders assigned to one merchant.';
comment on table public.order_items is 'Immutable product snapshot lines for an order.';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger merchants_set_updated_at
before update on public.merchants
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.is_merchant_owner(merchant_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.merchants m
    where m.id = merchant_uuid
      and m.owner_id = auth.uid()
  );
$$;

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
    (old.status = 'processing' and new.status = 'on_the_way') or
    (old.status = 'on_the_way' and new.status = 'delivered')
  ) then
    raise exception 'Invalid order status transition from % to %', old.status, new.status;
  end if;

  return new;
end;
$$;

create trigger orders_validate_status_transition
before update of status on public.orders
for each row execute function public.validate_order_status_transition();

create or replace function public.set_order_item_product_snapshot()
returns trigger
language plpgsql
as $$
declare
  product_record public.products%rowtype;
  order_record public.orders%rowtype;
begin
  select *
  into order_record
  from public.orders
  where id = new.order_id;

  if not found then
    raise exception 'Order does not exist';
  end if;

  select *
  into product_record
  from public.products
  where id = new.product_id;

  if not found then
    raise exception 'Product does not exist';
  end if;

  if product_record.merchant_id <> order_record.merchant_id then
    raise exception 'Product merchant does not match order merchant';
  end if;

  if product_record.is_active is not true then
    raise exception 'Inactive products cannot be ordered';
  end if;

  new.name = product_record.name;
  new.brand = product_record.brand;
  new.unit_price = product_record.price;
  new.unit = product_record.unit;

  return new;
end;
$$;

create trigger order_items_set_product_snapshot
before insert on public.order_items
for each row execute function public.set_order_item_product_snapshot();

create or replace function public.refresh_order_subtotal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_order_id uuid;
begin
  if tg_op = 'DELETE' then
    target_order_id = old.order_id;
  else
    target_order_id = new.order_id;
  end if;

  update public.orders
  set subtotal = coalesce(
    (
      select sum(unit_price * quantity)
      from public.order_items
      where order_id = target_order_id
    ),
    0
  )
  where id = target_order_id;

  return null;
end;
$$;

create trigger order_items_refresh_order_subtotal
after insert or update or delete on public.order_items
for each row execute function public.refresh_order_subtotal();

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists merchants_owner_id_idx on public.merchants(owner_id);
create index if not exists categories_sort_order_idx on public.categories(sort_order);
create index if not exists products_merchant_id_idx on public.products(merchant_id);
create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_active_category_idx on public.products(category_id, is_active);
create index if not exists orders_customer_id_created_at_idx on public.orders(customer_id, created_at desc);
create index if not exists orders_merchant_id_status_idx on public.orders(merchant_id, status);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_items_product_id_idx on public.order_items(product_id);

alter table public.profiles enable row level security;
alter table public.merchants enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.merchants from anon, authenticated;
revoke all on public.categories from anon, authenticated;
revoke all on public.products from anon, authenticated;
revoke all on public.orders from anon, authenticated;
revoke all on public.order_items from anon, authenticated;

grant usage on schema public to authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, phone, updated_at) on public.profiles to authenticated;

grant select on public.merchants to authenticated;
grant update (name, region, updated_at) on public.merchants to authenticated;

grant select on public.categories to authenticated;

grant select, insert on public.products to authenticated;
grant update (
  category_id,
  name,
  brand,
  description,
  price,
  unit,
  image_url,
  is_active,
  updated_at
) on public.products to authenticated;

grant select, insert on public.orders to authenticated;
grant update (status, updated_at) on public.orders to authenticated;

grant select, insert on public.order_items to authenticated;

-- Profiles: users can see and edit only their own profile. Role is intentionally not update-granted.
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Merchants: owners manage their own merchant row; customers can read merchant names/regions for catalog/order UI.
create policy "merchants_select_authenticated"
on public.merchants
for select
to authenticated
using (true);

create policy "merchants_update_owner"
on public.merchants
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

-- Categories are shared catalog metadata.
create policy "categories_select_authenticated"
on public.categories
for select
to authenticated
using (true);

-- Products: customers read active products; merchant owners can read and manage their entire catalog.
create policy "products_select_active_or_owner"
on public.products
for select
to authenticated
using (is_active = true or public.is_merchant_owner(merchant_id));

create policy "products_insert_owner"
on public.products
for insert
to authenticated
with check (public.is_merchant_owner(merchant_id));

create policy "products_update_owner"
on public.products
for update
to authenticated
using (public.is_merchant_owner(merchant_id))
with check (public.is_merchant_owner(merchant_id));

-- Orders: customers create/read their own orders; merchant owners read and move statuses for their orders.
create policy "orders_select_customer_or_merchant_owner"
on public.orders
for select
to authenticated
using (customer_id = auth.uid() or public.is_merchant_owner(merchant_id));

create policy "orders_insert_customer"
on public.orders
for insert
to authenticated
with check (
  customer_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'customer'
  )
);

create policy "orders_update_status_merchant_owner"
on public.orders
for update
to authenticated
using (public.is_merchant_owner(merchant_id))
with check (public.is_merchant_owner(merchant_id));

-- Order items inherit visibility from their parent order.
create policy "order_items_select_customer_or_merchant_owner"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_id
      and (o.customer_id = auth.uid() or public.is_merchant_owner(o.merchant_id))
  )
);

create policy "order_items_insert_customer_order"
on public.order_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.orders o
    where o.id = order_id
      and o.customer_id = auth.uid()
  )
);
