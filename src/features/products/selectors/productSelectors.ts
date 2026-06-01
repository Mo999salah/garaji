import type { Product } from '@/shared/types/product';

export interface ProductFilters {
  categoryId?: string;
  query?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  fitmentYear?: number;
  status?: 'all' | 'active' | 'inactive';
  inventoryStatus?: 'all' | 'in_stock' | 'low_stock';
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

export function isLowStockProduct(product: Product) {
  return (
    typeof product.stockQuantity === 'number' &&
    product.stockQuantity <= product.minOrderQuantity
  );
}

export function isProductReadyToOrder(product: Product) {
  return (
    product.isActive &&
    (typeof product.stockQuantity !== 'number' || product.stockQuantity >= product.minOrderQuantity)
  );
}

export function getVehicleMakeOptions(products: Product[]) {
  return getUniqueSortedValues(products.map((product) => product.vehicleMake));
}

export function getVehicleModelOptions(products: Product[], vehicleMake?: string) {
  const normalizedMake = vehicleMake?.toLowerCase();
  const scopedProducts = normalizedMake
    ? products.filter((product) => product.vehicleMake?.toLowerCase() === normalizedMake)
    : products;

  return getUniqueSortedValues(scopedProducts.map((product) => product.vehicleModel));
}

export function getFitmentYearOptions(products: Product[], filters: ProductFilters = {}) {
  const scopedProducts = filterProducts(products, {
    ...filters,
    fitmentYear: undefined,
  });
  const years = new Set<number>();

  for (const product of scopedProducts) {
    if (product.yearStart && product.yearEnd) {
      for (let year = product.yearStart; year <= product.yearEnd; year += 1) {
        years.add(year);
      }
      continue;
    }

    if (product.yearStart) {
      years.add(product.yearStart);
    }

    if (product.yearEnd) {
      years.add(product.yearEnd);
    }
  }

  return Array.from(years).sort((a, b) => b - a);
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
    const matchesInventoryStatus =
      !filters.inventoryStatus ||
      filters.inventoryStatus === 'all' ||
      (filters.inventoryStatus === 'low_stock'
        ? isLowStockProduct(product)
        : isProductReadyToOrder(product));
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
      matchesInventoryStatus &&
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

function getUniqueSortedValues(values: Array<string | undefined>) {
  return Array.from(
    new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))),
  ).sort((a, b) => a.localeCompare(b));
}
