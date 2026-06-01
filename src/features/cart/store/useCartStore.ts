import AsyncStorage from '@react-native-async-storage/async-storage';
import create from 'zustand';
import { persist } from 'zustand/middleware';

const CART_STORAGE_KEY = 'qitaa-cart';

import type { CartItem } from '@/features/cart/types';
import type { Product } from '@/shared/types/product';

export type AddProductResult =
  | { ok: true }
  | { ok: false; reason: 'inactive' | 'mixed_merchant' | 'out_of_stock' | 'stock_limit' };

interface CartState {
  items: CartItem[];
  addProduct: (product: Product) => AddProductResult;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  reset: () => void;
}

function toCartItem(product: Product): CartItem {
  return {
    productId: product.id,
    merchantId: product.merchantId,
    name: product.name,
    brand: product.brand,
    partNumber: product.partNumber,
    unitPrice: product.price,
    quantity: product.minOrderQuantity,
    unit: product.unit,
    minOrderQuantity: product.minOrderQuantity,
    stockQuantity: product.stockQuantity,
  };
}

export const useCartStore = create(
  persist<CartState>(
    (set, get) => ({
      items: [],
      addProduct: (product) => {
        if (!product.isActive) {
          return { ok: false, reason: 'inactive' };
        }

        if (
          typeof product.stockQuantity === 'number' &&
          product.stockQuantity < product.minOrderQuantity
        ) {
          return { ok: false, reason: 'out_of_stock' };
        }

        const { items } = get();
        const cartMerchantId = items[0]?.merchantId;

        if (cartMerchantId && cartMerchantId !== product.merchantId) {
          return { ok: false, reason: 'mixed_merchant' };
        }

        let addResult: AddProductResult = { ok: true };

        set((state) => {
          const existingItem = state.items.find((item) => item.productId === product.id);

          if (existingItem) {
            const nextQuantity = existingItem.quantity + 1;

            if (typeof product.stockQuantity === 'number' && nextQuantity > product.stockQuantity) {
              addResult = { ok: false, reason: 'stock_limit' };
              return state;
            }

            return {
              items: state.items.map((item) =>
                item.productId === product.id
                  ? { ...item, quantity: nextQuantity, stockQuantity: product.stockQuantity }
                  : item,
              ),
            };
          }

          return { items: [toCartItem(product), ...state.items] };
        });

        return addResult;
      },
      increaseQuantity: (productId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity:
                    typeof item.stockQuantity === 'number'
                      ? Math.min(item.stockQuantity, item.quantity + 1)
                      : item.quantity + 1,
                }
              : item,
          ),
        }));
      },
      decreaseQuantity: (productId) => {
        set((state) => ({
          items: state.items
            .map((item) =>
              item.productId === productId
                ? {
                    ...item,
                    quantity:
                      item.quantity <= (item.minOrderQuantity ?? 1)
                        ? 0
                        : item.quantity - 1,
                  }
                : item,
            )
            .filter((item) => item.quantity > 0),
        }));
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },
      clearCart: () => set({ items: [] }),
      reset: () => {
        set({ items: [] });
        void AsyncStorage.removeItem(CART_STORAGE_KEY);
      },
    }),
    {
      name: CART_STORAGE_KEY,
      getStorage: () => AsyncStorage,
    },
  ),
);
