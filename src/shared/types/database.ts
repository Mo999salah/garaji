export type DbOrderStatus = 'pending' | 'processing' | 'on_the_way' | 'delivered' | 'cancelled';

export interface DbProfileRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: 'customer' | 'merchant';
  created_at: string;
}

export interface DbMerchantRow {
  id: string;
  owner_id: string;
  name: string;
  region: string | null;
}

export interface DbCategoryRow {
  id: string;
  name: string;
  sort_order: number;
}

export interface DbProductRow {
  id: string;
  merchant_id: string;
  category_id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  unit: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface DbOrderRow {
  id: string;
  customer_id: string;
  customer_name: string | null;
  merchant_id: string;
  status: DbOrderStatus;
  notes: string | null;
  subtotal: number;
  created_at: string;
  updated_at: string;
}

export interface DbOrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  name: string;
  brand: string;
  unit_price: number;
  quantity: number;
  unit: string;
}

export interface CreateOrderLineInput {
  productId: string;
  quantity: number;
}
