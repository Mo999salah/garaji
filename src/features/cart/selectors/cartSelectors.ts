import type { CartItem } from '@/features/cart/types';
import type { Product } from '@/shared/types/product';

export interface CartValidationIssue {
  productId: string;
  message: string;
}

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

export function getCartValidationIssues(items: CartItem[], products: Product[]) {
  const productsById = new Map(products.map((product) => [product.id, product]));
  const issues: CartValidationIssue[] = [];

  for (const item of items) {
    const product = productsById.get(item.productId);
    const minOrderQuantity = product?.minOrderQuantity ?? item.minOrderQuantity;
    const stockQuantity = product?.stockQuantity ?? item.stockQuantity;

    if (!product || !product.isActive) {
      issues.push({
        productId: item.productId,
        message: `${item.name} is no longer available. Remove it before checkout.`,
      });
      continue;
    }

    if (item.quantity < minOrderQuantity) {
      issues.push({
        productId: item.productId,
        message: `${item.name} requires at least ${minOrderQuantity} ${item.unit}.`,
      });
    }

    if (typeof stockQuantity === 'number' && stockQuantity < item.quantity) {
      issues.push({
        productId: item.productId,
        message: `${item.name} has only ${stockQuantity} ${item.unit} available.`,
      });
    }
  }

  return issues;
}

export function getCartItemAvailabilityMessage(item: CartItem, products: Product[]) {
  return getCartValidationIssues([item], products)[0]?.message ?? null;
}
