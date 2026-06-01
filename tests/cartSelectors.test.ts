import assert from 'node:assert/strict';
import test from 'node:test';

import { getCartValidationIssues } from '../src/features/cart/selectors/cartSelectors';
import type { CartItem } from '../src/features/cart/types';
import type { Product } from '../src/shared/types/product';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    merchantId: 'merchant-1',
    categoryId: 'category-1',
    name: 'Brake Pad Set',
    brand: 'Qitaa',
    partNumber: 'BP-100',
    description: 'Front brake pads',
    price: 45,
    unit: 'set',
    stockQuantity: 10,
    minOrderQuantity: 2,
    isActive: true,
    createdAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: 'product-1',
    merchantId: 'merchant-1',
    name: 'Brake Pad Set',
    brand: 'Qitaa',
    partNumber: 'BP-100',
    unitPrice: 45,
    quantity: 2,
    unit: 'set',
    minOrderQuantity: 2,
    stockQuantity: 10,
    ...overrides,
  };
}

test('cart validation accepts an active product inside stock and minimum limits', () => {
  const issues = getCartValidationIssues([makeCartItem()], [makeProduct()]);

  assert.equal(issues.length, 0);
});

test('cart validation blocks quantities below the product minimum', () => {
  const issues = getCartValidationIssues([makeCartItem({ quantity: 1 })], [makeProduct()]);

  assert.equal(issues.length, 1);
  assert.match(issues[0].message, /requires at least 2 set/);
});

test('cart validation blocks quantities above tracked stock', () => {
  const issues = getCartValidationIssues([makeCartItem({ quantity: 11 })], [makeProduct()]);

  assert.equal(issues.length, 1);
  assert.match(issues[0].message, /only 10 set available/);
});

test('cart validation blocks unavailable products', () => {
  const issues = getCartValidationIssues([makeCartItem()], [makeProduct({ isActive: false })]);

  assert.equal(issues.length, 1);
  assert.match(issues[0].message, /no longer available/);
});
