import type { CartItem } from '@/features/cart/types';

export function getCartItemSubtotal(item: CartItem) {
  return item.unitPrice * item.quantity;
}

export function getCartSubtotal(items: CartItem[]) {
  return items.reduce((total, item) => total + getCartItemSubtotal(item), 0);
}

export function getCartItemCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}
