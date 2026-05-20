import create from 'zustand';

import { mockProducts, productCategories } from '@/features/products/data/mockProducts';
import type { ProductFormValues } from '@/features/products/schemas/productSchema';
import {
  fetchCatalogProducts,
  fetchCategories,
  fetchMerchantProducts,
  insertProduct,
  isProductBackendReady,
  toggleProductActiveRecord,
  updateProductRecord,
} from '@/features/products/services/supabaseProductService';
import type { Product, ProductCategory } from '@/shared/types/product';
import { createClientId } from '@/shared/lib/id';

interface ProductState {
  products: Product[];
  categories: ProductCategory[];
  isLoading: boolean;
  errorMessage: string | null;
  loadCatalog: () => Promise<void>;
  loadMerchantCatalog: (merchantId: string) => Promise<void>;
  addProduct: (merchantId: string, values: ProductFormValues) => Promise<Product>;
  updateProduct: (
    productId: string,
    merchantId: string,
    values: ProductFormValues,
  ) => Promise<Product | null>;
  toggleProductActive: (productId: string, merchantId: string) => Promise<void>;
  reset: () => void;
}

function normalizeImageUrl(imageUrl?: string) {
  return imageUrl?.trim() || undefined;
}

function createMockProduct(merchantId: string, values: ProductFormValues): Product {
  return {
    id: createClientId('prod'),
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
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: isProductBackendReady() ? [] : mockProducts,
  categories: productCategories,
  isLoading: false,
  errorMessage: null,
  loadCatalog: async () => {
    if (!isProductBackendReady()) {
      set({ products: mockProducts, categories: productCategories, errorMessage: null });
      return;
    }

    set({ isLoading: true, errorMessage: null });

    try {
      const [categories, products] = await Promise.all([fetchCategories(), fetchCatalogProducts()]);
      set({ categories, products, isLoading: false, errorMessage: null });
    } catch (error) {
      set({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'Could not load catalog.',
      });
    }
  },
  loadMerchantCatalog: async (merchantId) => {
    if (!isProductBackendReady()) {
      set({
        products: mockProducts.filter((product) => product.merchantId === merchantId),
        categories: productCategories,
        errorMessage: null,
      });
      return;
    }

    set({ isLoading: true, errorMessage: null });

    try {
      const [categories, products] = await Promise.all([
        fetchCategories(),
        fetchMerchantProducts(merchantId),
      ]);
      set({ categories, products, isLoading: false, errorMessage: null });
    } catch (error) {
      set({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'Could not load products.',
      });
    }
  },
  addProduct: async (merchantId, values) => {
    if (isProductBackendReady()) {
      const product = await insertProduct(merchantId, values);
      set((state) => ({ products: [product, ...state.products] }));
      return product;
    }

    const product = createMockProduct(merchantId, values);
    set((state) => ({ products: [product, ...state.products] }));
    return product;
  },
  updateProduct: async (productId, merchantId, values) => {
    if (isProductBackendReady()) {
      const updatedProduct = await updateProductRecord(productId, merchantId, values);

      if (!updatedProduct) {
        return null;
      }

      set((state) => ({
        products: state.products.map((product) =>
          product.id === productId ? updatedProduct : product,
        ),
      }));

      return updatedProduct;
    }

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
  toggleProductActive: async (productId, merchantId) => {
    if (isProductBackendReady()) {
      const updatedProduct = await toggleProductActiveRecord(productId, merchantId);
      set((state) => ({
        products: state.products.map((product) =>
          product.id === productId ? updatedProduct : product,
        ),
      }));
      return;
    }

    set((state) => ({
      products: state.products.map((product) =>
        product.id === productId && product.merchantId === merchantId
          ? { ...product, isActive: !product.isActive }
          : product,
      ),
    }));
  },
  reset: () => {
    set({
      products: isProductBackendReady() ? [] : mockProducts,
      categories: productCategories,
      isLoading: false,
      errorMessage: null,
    });
  },
}));
