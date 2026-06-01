-- Move order status changes through an RPC so inventory is deducted atomically.

create or replace function public.update_order_status(
  p_order_id uuid,
  p_merchant_id uuid,
  p_next_status text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if p_next_status not in ('pending', 'processing', 'on_the_way', 'delivered', 'cancelled') then
    raise exception 'Invalid order status';
  end if;

  select *
  into v_order
  from public.orders
  where id = p_order_id
    and merchant_id = p_merchant_id
  for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if not public.is_merchant_owner(v_order.merchant_id) then
    raise exception 'Only the merchant owner can update this order';
  end if;

  if v_order.status = 'pending' and p_next_status = 'processing' then
    if exists (
      select 1
      from public.order_items oi
      join public.products p on p.id = oi.product_id
      where oi.order_id = v_order.id
        and p.stock_quantity is not null
        and p.stock_quantity < oi.quantity
    ) then
      raise exception 'Requested quantity exceeds available stock';
    end if;

    update public.products p
    set stock_quantity = p.stock_quantity - totals.quantity
    from (
      select product_id, sum(quantity)::int as quantity
      from public.order_items
      where order_id = v_order.id
      group by product_id
    ) totals
    where p.id = totals.product_id
      and p.stock_quantity is not null;
  end if;

  if v_order.status in ('processing', 'on_the_way') and p_next_status = 'cancelled' then
    update public.products p
    set stock_quantity = p.stock_quantity + totals.quantity
    from (
      select product_id, sum(quantity)::int as quantity
      from public.order_items
      where order_id = v_order.id
      group by product_id
    ) totals
    where p.id = totals.product_id
      and p.stock_quantity is not null;
  end if;

  update public.orders
  set status = p_next_status
  where id = v_order.id;

  return v_order.id;
end;
$$;

comment on function public.update_order_status(uuid, uuid, text) is
  'Updates merchant order status and adjusts tracked product stock in the same transaction.';

grant execute on function public.update_order_status(uuid, uuid, text) to authenticated;

revoke update (status, updated_at) on public.orders from authenticated;
