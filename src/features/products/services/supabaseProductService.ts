import { isSupabaseConfigured, supabase } from '@/shared/lib/supabase';
import type { DbCategoryRow, DbMerchantRow, DbProductRow } from '@/shared/types/database';
import type { Product, ProductCategory } from '@/shared/types/product';
import type { ProductFormValues } from '@/features/products/schemas/productSchema';

const productSelect =
  'id, merchant_id, category_id, name, brand, part_number, description, vehicle_make, vehicle_model, year_start, year_end, price, unit, image_url, stock_quantity, min_order_quantity, is_active, created_at';

export class ProductServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProductServiceError';
  }
}

function getClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new ProductServiceError('Catalog is not configured yet.');
  }

  return supabase;
}

function mapProduct(row: DbProductRow, extras?: { categoryName?: string; merchantName?: string }): Product {
  return {
    id: row.id,
    merchantId: row.merchant_id,
    categoryId: row.category_id,
    categoryName: extras?.categoryName,
    merchantName: extras?.merchantName,
    name: row.name,
    brand: row.brand,
    partNumber: row.part_number ?? '',
    description: row.description,
    vehicleMake: row.vehicle_make ?? undefined,
    vehicleModel: row.vehicle_model ?? undefined,
    yearStart: row.year_start ?? undefined,
    yearEnd: row.year_end ?? undefined,
    price: Number(row.price),
    unit: row.unit,
    imageUrl: row.image_url ?? undefined,
    stockQuantity: row.stock_quantity ?? undefined,
    minOrderQuantity: row.min_order_quantity,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

function normalizeOptionalText(value?: string) {
  return value?.trim() || null;
}

function normalizeOptionalNumber(value?: number | '') {
  return typeof value === 'number' ? value : null;
}

function getProductPayload(values: ProductFormValues) {
  return {
    category_id: values.categoryId,
    name: values.name.trim(),
    brand: values.brand.trim(),
    part_number: values.partNumber.trim(),
    description: values.description.trim(),
    vehicle_make: normalizeOptionalText(values.vehicleMake),
    vehicle_model: normalizeOptionalText(values.vehicleModel),
    year_start: normalizeOptionalNumber(values.yearStart),
    year_end: normalizeOptionalNumber(values.yearEnd),
    price: values.price,
    unit: values.unit.trim(),
    image_url: values.imageUrl?.trim() || null,
    stock_quantity: normalizeOptionalNumber(values.stockQuantity),
    min_order_quantity: values.minOrderQuantity,
    is_active: values.isActive,
  };
}

export function isProductBackendReady() {
  return isSupabaseConfigured;
}

export async function fetchCategories(): Promise<ProductCategory[]> {
  const client = getClient();
  const { data, error } = await client
    .from('categories')
    .select('id, name, sort_order')
    .order('sort_order', { ascending: true });

  if (error) {
    throw new ProductServiceError('Could not load categories.');
  }

  const categories = (data ?? []) as DbCategoryRow[];

  return [{ id: 'all', name: 'All' }, ...categories.map((row) => ({ id: row.id, name: row.name }))];
}

export async function fetchCatalogProducts(): Promise<Product[]> {
  const client = getClient();
  const [{ data: products, error: productsError }, { data: categories }, { data: merchants }] =
    await Promise.all([
      client
        .from('products')
        .select(productSelect)
        .order('created_at', { ascending: false }),
      client.from('categories').select('id, name'),
      client.from('merchants').select('id, name'),
    ]);

  if (productsError) {
    throw new ProductServiceError('Could not load products.');
  }

  const categoryNames = new Map((categories ?? []).map((row) => [row.id, row.name]));
  const merchantNames = new Map(
    (merchants ?? []).map((row) => [row.id as string, row.name as string]),
  );

  return ((products ?? []) as DbProductRow[]).map((row) =>
    mapProduct(row, {
      categoryName: categoryNames.get(row.category_id),
      merchantName: merchantNames.get(row.merchant_id),
    }),
  );
}

export async function fetchMerchantProducts(merchantId: string): Promise<Product[]> {
  const client = getClient();
  const { data, error } = await client
    .from('products')
    .select(productSelect)
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new ProductServiceError('Could not load merchant products.');
  }

  return ((data ?? []) as DbProductRow[]).map((row) => mapProduct(row));
}

export async function insertProduct(merchantId: string, values: ProductFormValues) {
  const client = getClient();
  const { data, error } = await client
    .from('products')
    .insert({
      merchant_id: merchantId,
      ...getProductPayload(values),
    })
    .select(productSelect)
    .single<DbProductRow>();

  if (error || !data) {
    throw new ProductServiceError('Could not create the product.');
  }

  return mapProduct(data);
}

export async function updateProductRecord(
  productId: string,
  merchantId: string,
  values: ProductFormValues,
) {
  const client = getClient();
  const { data, error } = await client
    .from('products')
    .update(getProductPayload(values))
    .eq('id', productId)
    .eq('merchant_id', merchantId)
    .select(productSelect)
    .maybeSingle<DbProductRow>();

  if (error) {
    throw new ProductServiceError('Could not update the product.');
  }

  if (!data) {
    return null;
  }

  return mapProduct(data);
}

export async function updateProductStockRecord(
  productId: string,
  merchantId: string,
  nextStockQuantity: number,
) {
  const client = getClient();
  const { data, error } = await client
    .from('products')
    .update({ stock_quantity: nextStockQuantity })
    .eq('id', productId)
    .eq('merchant_id', merchantId)
    .select(productSelect)
    .maybeSingle<DbProductRow>();

  if (error) {
    throw new ProductServiceError('Could not update product stock.');
  }

  if (!data) {
    return null;
  }

  return mapProduct(data);
}

export async function toggleProductActiveRecord(productId: string, merchantId: string) {
  const client = getClient();
  const { data: existing, error: readError } = await client
    .from('products')
    .select('is_active')
    .eq('id', productId)
    .eq('merchant_id', merchantId)
    .maybeSingle<{ is_active: boolean }>();

  if (readError || !existing) {
    throw new ProductServiceError('Product not found.');
  }

  const { data, error } = await client
    .from('products')
    .update({ is_active: !existing.is_active })
    .eq('id', productId)
    .eq('merchant_id', merchantId)
    .select(productSelect)
    .maybeSingle<DbProductRow>();

  if (error || !data) {
    throw new ProductServiceError('Could not update product status.');
  }

  return mapProduct(data);
}
