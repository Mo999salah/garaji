import type { CartItem } from '@/features/cart/types';
import type { AuthUser } from '@/shared/types/auth';
import type { Order, OrderItem, OrderStatus } from '@/shared/types/order';
import { createClientId } from '@/shared/lib/id';

export const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  on_the_way: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export type OrderStatusFilter = 'all' | 'open' | OrderStatus;

const nextStatusByStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'processing',
  processing: 'on_the_way',
  on_the_way: 'delivered',
};

export function getCustomerOrders(orders: Order[], customerId: string) {
  return orders.filter((order) => order.customerId === customerId);
}

export function getMerchantOrders(orders: Order[], merchantId: string) {
  return orders.filter((order) => order.merchantId === merchantId);
}

export function filterOrdersByStatus(orders: Order[], status: OrderStatusFilter) {
  if (status === 'all') {
    return orders;
  }

  if (status === 'open') {
    return orders.filter(
      (order) =>
        order.status === 'pending' ||
        order.status === 'processing' ||
        order.status === 'on_the_way',
    );
  }

  return orders.filter((order) => order.status === status);
}

export function countOrdersByStatus(orders: Order[], status: OrderStatusFilter) {
  return filterOrdersByStatus(orders, status).length;
}

export function getOrdersTotal(orders: Order[]) {
  return orders.reduce((total, order) => total + order.subtotal, 0);
}

export function getNextOrderStatus(status: OrderStatus) {
  return nextStatusByStatus[status] ?? null;
}

export function canTransitionOrderStatus(currentStatus: OrderStatus, nextStatus: OrderStatus) {
  if (currentStatus === 'delivered' || currentStatus === 'cancelled') {
    return false;
  }

  if (nextStatus === 'cancelled') {
    return currentStatus === 'pending' || currentStatus === 'processing' || currentStatus === 'on_the_way';
  }

  return nextStatusByStatus[currentStatus] === nextStatus;
}

export function getOrderSubtotal(items: OrderItem[]) {
  return items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
}

export function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatOrderId(orderId: string) {
  if (orderId.startsWith('order-')) {
    return orderId.replace('order-', '#');
  }

  return `#${orderId.slice(0, 8).toUpperCase()}`;
}

export function buildOrderFromCart(params: {
  customer: AuthUser;
  items: CartItem[];
  notes?: string;
}): Order | null {
  const [firstItem] = params.items;

  if (!firstItem) {
    return null;
  }

  const hasMultipleMerchants = params.items.some((item) => item.merchantId !== firstItem.merchantId);

  if (hasMultipleMerchants) {
    return null;
  }

  const now = new Date().toISOString();
  const orderItems: OrderItem[] = params.items.map((item) => ({
    productId: item.productId,
    name: item.name,
    brand: item.brand,
    partNumber: item.partNumber,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    unit: item.unit,
  }));

  return {
    id: createClientId('order'),
    customerId: params.customer.id,
    customerName: params.customer.fullName,
    merchantId: firstItem.merchantId,
    status: 'pending',
    items: orderItems,
    subtotal: getOrderSubtotal(orderItems),
    notes: params.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };
}

export function hasMixedMerchantCart(items: CartItem[]) {
  const [firstItem] = items;

  if (!firstItem) {
    return false;
  }

  return items.some((item) => item.merchantId !== firstItem.merchantId);
}
