import { isSupabaseConfigured, supabase } from '@/shared/lib/supabase';
import type { CartItem } from '@/features/cart/types';
import type { CreateOrderLineInput, DbOrderItemRow, DbOrderRow } from '@/shared/types/database';
import type { Order, OrderItem, OrderStatus } from '@/shared/types/order';

export class OrderServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderServiceError';
  }
}

function getClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new OrderServiceError('Orders are not configured yet.');
  }

  return supabase;
}

function mapOrderItem(row: DbOrderItemRow): OrderItem {
  return {
    productId: row.product_id,
    name: row.name,
    brand: row.brand,
    partNumber: row.part_number ?? undefined,
    unitPrice: Number(row.unit_price),
    quantity: row.quantity,
    unit: row.unit,
  };
}

function mapOrder(row: DbOrderRow, items: OrderItem[]): Order {
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name ?? 'Qitaa customer',
    merchantId: row.merchant_id,
    status: row.status,
    items,
    subtotal: Number(row.subtotal),
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchOrderItems(orderIds: string[]) {
  if (!orderIds.length) {
    return new Map<string, OrderItem[]>();
  }

  const client = getClient();
  const { data, error } = await client
    .from('order_items')
    .select('id, order_id, product_id, name, brand, part_number, unit_price, quantity, unit')
    .in('order_id', orderIds);

  if (error) {
    throw new OrderServiceError('Could not load order items.');
  }

  const grouped = new Map<string, OrderItem[]>();

  for (const row of (data ?? []) as DbOrderItemRow[]) {
    const current = grouped.get(row.order_id) ?? [];
    current.push(mapOrderItem(row));
    grouped.set(row.order_id, current);
  }

  return grouped;
}

async function mapOrders(rows: DbOrderRow[]) {
  const itemsByOrder = await fetchOrderItems(rows.map((row) => row.id));
  return rows.map((row) => mapOrder(row, itemsByOrder.get(row.id) ?? []));
}

export function isOrderBackendReady() {
  return isSupabaseConfigured;
}

export async function fetchCustomerOrders(customerId: string) {
  const client = getClient();
  const { data, error } = await client
    .from('orders')
    .select(
      'id, customer_id, customer_name, merchant_id, status, notes, subtotal, created_at, updated_at',
    )
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new OrderServiceError('Could not load your orders.');
  }

  return mapOrders((data ?? []) as DbOrderRow[]);
}

export async function fetchMerchantOrders(merchantId: string) {
  const client = getClient();
  const { data, error } = await client
    .from('orders')
    .select(
      'id, customer_id, customer_name, merchant_id, status, notes, subtotal, created_at, updated_at',
    )
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new OrderServiceError('Could not load incoming orders.');
  }

  return mapOrders((data ?? []) as DbOrderRow[]);
}

export async function createOrderWithItems(params: {
  merchantId: string;
  notes?: string;
  items: CartItem[];
}) {
  const client = getClient();
  const payload: CreateOrderLineInput[] = params.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
  }));

  const { data, error } = await client.rpc('create_order_with_items', {
    p_merchant_id: params.merchantId,
    p_notes: params.notes?.trim() || null,
    p_items: payload.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    })),
  });

  if (error || !data) {
    throw new OrderServiceError('Could not place your order. Please try again.');
  }

  const orderId = String(data);
  const { data: orderRow, error: orderError } = await client
    .from('orders')
    .select(
      'id, customer_id, customer_name, merchant_id, status, notes, subtotal, created_at, updated_at',
    )
    .eq('id', orderId)
    .single<DbOrderRow>();

  if (orderError || !orderRow) {
    throw new OrderServiceError('Order was created but could not be loaded.');
  }

  const [order] = await mapOrders([orderRow]);
  return order;
}

export async function updateOrderStatusRecord(
  orderId: string,
  merchantId: string,
  nextStatus: OrderStatus,
) {
  const client = getClient();
  const { data: updatedOrderId, error } = await client.rpc('update_order_status', {
    p_order_id: orderId,
    p_merchant_id: merchantId,
    p_next_status: nextStatus,
  });

  if (error || !updatedOrderId) {
    throw new OrderServiceError('Could not update order status.');
  }

  const { data, error: orderError } = await client
    .from('orders')
    .select(
      'id, customer_id, customer_name, merchant_id, status, notes, subtotal, created_at, updated_at',
    )
    .eq('id', String(updatedOrderId))
    .eq('merchant_id', merchantId)
    .maybeSingle<DbOrderRow>();

  if (orderError) {
    throw new OrderServiceError('Order was updated but could not be loaded.');
  }

  if (!data) {
    return null;
  }

  const [order] = await mapOrders([data]);
  return order;
}
