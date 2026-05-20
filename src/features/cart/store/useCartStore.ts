import AsyncStorage from '@react-native-async-storage/async-storage';
import create from 'zustand';
import { persist } from 'zustand/middleware';

const CART_STORAGE_KEY = 'qitaa-cart';

import type { CartItem } from '@/features/cart/types';
import type { Product } from '@/shared/types/product';

export type AddProductResult =
  | { ok: true }
  | { ok: false; reason: 'inactive' | 'mixed_merchant' };

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
    unitPrice: product.price,
    quantity: 1,
    unit: product.unit,
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

        const { items } = get();
        const cartMerchantId = items[0]?.merchantId;

        if (cartMerchantId && cartMerchantId !== product.merchantId) {
          return { ok: false, reason: 'mixed_merchant' };
        }

        set((state) => {
          const existingItem = state.items.find((item) => item.productId === product.id);

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item,
              ),
            };
          }

          return { items: [toCartItem(product), ...state.items] };
        });

        return { ok: true };
      },
      increaseQuantity: (productId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        }));
      },
      decreaseQuantity: (productId) => {
        set((state) => ({
          items: state.items
            .map((item) =>
              item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item,
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
