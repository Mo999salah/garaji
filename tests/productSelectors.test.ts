import assert from 'node:assert/strict';
import test from 'node:test';

import {
  filterActiveProducts,
  isLowStockProduct,
  isProductReadyToOrder,
} from '../src/features/products/selectors/productSelectors';
import type { Product } from '../src/shared/types/product';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    merchantId: 'merchant-1',
    categoryId: 'category-1',
    name: 'Oil Filter',
    brand: 'Qitaa',
    partNumber: 'OF-100',
    description: 'Engine oil filter',
    vehicleMake: 'Toyota',
    vehicleModel: 'Corolla',
    yearStart: 2015,
    yearEnd: 2020,
    price: 12,
    unit: 'piece',
    stockQuantity: 5,
    minOrderQuantity: 2,
    isActive: true,
    createdAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
}

test('ready-to-order products are active and satisfy minimum stock', () => {
  assert.equal(isProductReadyToOrder(makeProduct()), true);
  assert.equal(isProductReadyToOrder(makeProduct({ isActive: false })), false);
  assert.equal(isProductReadyToOrder(makeProduct({ stockQuantity: 1 })), false);
  assert.equal(isProductReadyToOrder(makeProduct({ stockQuantity: undefined })), true);
});

test('low stock products are at or below minimum order quantity', () => {
  assert.equal(isLowStockProduct(makeProduct({ stockQuantity: 2 })), true);
  assert.equal(isLowStockProduct(makeProduct({ stockQuantity: 3 })), false);
  assert.equal(isLowStockProduct(makeProduct({ stockQuantity: undefined })), false);
});

test('active product filters combine fitment and availability', () => {
  const products = [
    makeProduct({ id: 'ready', vehicleMake: 'Toyota', vehicleModel: 'Corolla' }),
    makeProduct({ id: 'stock-short', stockQuantity: 1 }),
    makeProduct({ id: 'inactive', isActive: false }),
    makeProduct({ id: 'wrong-fitment', vehicleMake: 'Nissan', vehicleModel: 'Sentra' }),
  ];

  const filtered = filterActiveProducts(products, {
    inventoryStatus: 'in_stock',
    vehicleMake: 'Toyota',
    vehicleModel: 'Corolla',
    fitmentYear: 2018,
  });

  assert.deepEqual(
    filtered.map((product) => product.id),
    ['ready'],
  );
});
