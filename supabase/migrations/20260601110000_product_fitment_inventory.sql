-- Product details needed for real auto-parts ordering.

alter table public.products
  add column if not exists part_number text,
  add column if not exists vehicle_make text,
  add column if not exists vehicle_model text,
  add column if not exists year_start int,
  add column if not exists year_end int,
  add column if not exists stock_quantity int,
  add column if not exists min_order_quantity int not null default 1;

alter table public.order_items
  add column if not exists part_number text;

alter table public.products
  add constraint products_stock_quantity_check
  check (stock_quantity is null or stock_quantity >= 0);

alter table public.products
  add constraint products_min_order_quantity_check
  check (min_order_quantity > 0);

alter table public.products
  add constraint products_year_range_check
  check (
    (year_start is null and year_end is null)
    or (year_start is not null and year_end is null)
    or (year_start is null and year_end is not null)
    or year_start <= year_end
  );

create index if not exists products_part_number_idx on public.products(part_number);
create index if not exists products_vehicle_fitment_idx
  on public.products(vehicle_make, vehicle_model, year_start, year_end);

grant update (
  part_number,
  vehicle_make,
  vehicle_model,
  year_start,
  year_end,
  stock_quantity,
  min_order_quantity
) on public.products to authenticated;

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

  if new.quantity < product_record.min_order_quantity then
    raise exception 'Minimum order quantity is %', product_record.min_order_quantity;
  end if;

  if product_record.stock_quantity is not null and new.quantity > product_record.stock_quantity then
    raise exception 'Requested quantity exceeds available stock';
  end if;

  new.name = product_record.name;
  new.brand = product_record.brand;
  new.part_number = product_record.part_number;
  new.unit_price = product_record.price;
  new.unit = product_record.unit;

  return new;
end;
$$;
