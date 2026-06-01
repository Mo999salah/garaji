export interface Product {
  id: string;
  merchantId: string;
  categoryId: string;
  categoryName?: string;
  merchantName?: string;
  name: string;
  brand: string;
  partNumber: string;
  description: string;
  vehicleMake?: string;
  vehicleModel?: string;
  yearStart?: number;
  yearEnd?: number;
  price: number;
  unit: string;
  imageUrl?: string;
  stockQuantity?: number;
  minOrderQuantity: number;
  isActive: boolean;
  createdAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
}
