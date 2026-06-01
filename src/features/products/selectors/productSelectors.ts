import type { Product } from '@/shared/types/product';

export interface ProductFilters {
  categoryId?: string;
  query?: string;
}

export function formatProductPrice(product: Product) {
  return `$${product.price.toFixed(2)} / ${product.unit}`;
}

export function formatProductFitment(product: Product) {
  const vehicle = [product.vehicleMake, product.vehicleModel].filter(Boolean).join(' ');

  if (!vehicle && !product.yearStart && !product.yearEnd) {
    return 'Universal fitment';
  }

  const years =
    product.yearStart || product.yearEnd
      ? `${product.yearStart ?? '...'}-${product.yearEnd ?? '...'}`
      : null;

  return [vehicle || 'Vehicle fitment', years].filter(Boolean).join(' ');
}

export function formatProductStock(product: Product) {
  if (typeof product.stockQuantity !== 'number') {
    return 'Stock not tracked';
  }

  return `${product.stockQuantity} ${product.unit} available`;
}

export function filterActiveProducts(products: Product[], filters: ProductFilters) {
  return filterProducts(
    products.filter((product) => product.isActive),
    filters,
  );
}

export function filterProducts(products: Product[], filters: ProductFilters) {
  const normalizedQuery = filters.query?.trim().toLowerCase() ?? '';

  return products.filter((product) => {
    const matchesCategory =
      !filters.categoryId || filters.categoryId === 'all' || product.categoryId === filters.categoryId;
    const matchesQuery =
      !normalizedQuery ||
      [
        product.name,
        product.brand,
        product.partNumber,
        product.description,
        product.vehicleMake,
        product.vehicleModel,
      ].some((field) => field?.toLowerCase().includes(normalizedQuery));

    return matchesCategory && matchesQuery;
  });
}

export function getMerchantProducts(products: Product[], merchantId: string) {
  return products.filter((product) => product.merchantId === merchantId);
}
