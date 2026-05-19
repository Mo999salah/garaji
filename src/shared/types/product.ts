export interface Product {
  id: string;
  merchantId: string;
  categoryId: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  unit: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
}
