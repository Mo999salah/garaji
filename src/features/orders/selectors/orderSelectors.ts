import type { CartItem } from '@/features/cart/types';
import type { AuthUser } from '@/shared/types/auth';
import type { Order, OrderItem, OrderStatus } from '@/shared/types/order';

export const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  on_the_way: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

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

export function getNextOrderStatus(status: OrderStatus) {
  return nextStatusByStatus[status] ?? null;
}

export function canTransitionOrderStatus(currentStatus: OrderStatus, nextStatus: OrderStatus) {
  if (currentStatus === 'delivered' || currentStatus === 'cancelled') {
    return false;
  }

  if (currentStatus === 'pending' && nextStatus === 'cancelled') {
    return true;
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
  return orderId.replace('order-', '#');
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
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    unit: item.unit,
  }));

  return {
    id: `order-${Date.now()}`,
    customerId: params.customer.id,
    customerName: params.customer.companyName,
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
