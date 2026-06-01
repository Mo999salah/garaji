export interface CartItem {
  productId: string;
  merchantId: string;
  name: string;
  brand: string;
  partNumber?: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  minOrderQuantity: number;
}
