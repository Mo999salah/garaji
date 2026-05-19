export type OrderStatus = 'pending' | 'processing' | 'on_the_way' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  unitPrice: number;
  quantity: number;
  unit: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  merchantId: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
