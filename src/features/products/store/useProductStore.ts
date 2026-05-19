import create from 'zustand';

import { mockProducts } from '@/features/products/data/mockProducts';
import type { ProductFormValues } from '@/features/products/schemas/productSchema';
import type { Product } from '@/shared/types/product';

interface ProductState {
  products: Product[];
  addProduct: (merchantId: string, values: ProductFormValues) => Product;
  updateProduct: (productId: string, merchantId: string, values: ProductFormValues) => Product | null;
  toggleProductActive: (productId: string, merchantId: string) => void;
}

function normalizeImageUrl(imageUrl?: string) {
  return imageUrl?.trim() || undefined;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: mockProducts,
  addProduct: (merchantId, values) => {
    const product: Product = {
      id: `prod-${Date.now()}`,
      merchantId,
      categoryId: values.categoryId,
      name: values.name.trim(),
      brand: values.brand.trim(),
      description: values.description.trim(),
      price: values.price,
      unit: values.unit.trim(),
      imageUrl: normalizeImageUrl(values.imageUrl),
      isActive: values.isActive,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({ products: [product, ...state.products] }));
    return product;
  },
  updateProduct: (productId, merchantId, values) => {
    const existing = get().products.find(
      (product) => product.id === productId && product.merchantId === merchantId,
    );

    if (!existing) {
      return null;
    }

    const updatedProduct: Product = {
      ...existing,
      categoryId: values.categoryId,
      name: values.name.trim(),
      brand: values.brand.trim(),
      description: values.description.trim(),
      price: values.price,
      unit: values.unit.trim(),
      imageUrl: normalizeImageUrl(values.imageUrl),
      isActive: values.isActive,
    };

    set((state) => ({
      products: state.products.map((product) =>
        product.id === productId && product.merchantId === merchantId ? updatedProduct : product,
      ),
    }));

    return updatedProduct;
  },
  toggleProductActive: (productId, merchantId) => {
    set((state) => ({
      products: state.products.map((product) =>
        product.id === productId && product.merchantId === merchantId
          ? { ...product, isActive: !product.isActive }
          : product,
      ),
    }));
  },
}));
