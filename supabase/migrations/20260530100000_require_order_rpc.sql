-- Require clients to create orders through create_order_with_items.
-- The RPC owns validation, product snapshots, and subtotal refresh in one transaction.

revoke insert on public.orders from authenticated;
revoke insert on public.order_items from authenticated;

drop policy if exists "orders_insert_customer" on public.orders;
drop policy if exists "order_items_insert_customer_order" on public.order_items;

grant execute on function public.create_order_with_items(uuid, text, jsonb) to authenticated;
