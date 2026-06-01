import type { Product } from '@/shared/types/product';

export interface ProductFilters {
  categoryId?: string;
  query?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  fitmentYear?: number;
  status?: 'all' | 'active' | 'inactive';
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
  const normalizedMake = filters.vehicleMake?.trim().toLowerCase() ?? '';
  const normalizedModel = filters.vehicleModel?.trim().toLowerCase() ?? '';

  return products.filter((product) => {
    const matchesCategory =
      !filters.categoryId || filters.categoryId === 'all' || product.categoryId === filters.categoryId;
    const matchesStatus =
      !filters.status ||
      filters.status === 'all' ||
      (filters.status === 'active' ? product.isActive : !product.isActive);
    const matchesVehicleMake =
      !normalizedMake || product.vehicleMake?.toLowerCase().includes(normalizedMake);
    const matchesVehicleModel =
      !normalizedModel || product.vehicleModel?.toLowerCase().includes(normalizedModel);
    const matchesYear = matchesFitmentYear(product, filters.fitmentYear);
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

    return (
      matchesCategory &&
      matchesStatus &&
      matchesVehicleMake &&
      matchesVehicleModel &&
      matchesYear &&
      matchesQuery
    );
  });
}

export function getMerchantProducts(products: Product[], merchantId: string) {
  return products.filter((product) => product.merchantId === merchantId);
}

function matchesFitmentYear(product: Product, fitmentYear?: number) {
  if (!fitmentYear) {
    return true;
  }

  if (!product.yearStart && !product.yearEnd) {
    return true;
  }

  const startsBeforeOrAt = !product.yearStart || product.yearStart <= fitmentYear;
  const endsAfterOrAt = !product.yearEnd || product.yearEnd >= fitmentYear;

  return startsBeforeOrAt && endsAfterOrAt;
}
