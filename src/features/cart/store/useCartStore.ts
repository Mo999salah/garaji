import create from 'zustand';

import type { CartItem } from '@/features/cart/types';
import type { Product } from '@/shared/types/product';

interface CartState {
  items: CartItem[];
  addProduct: (product: Product) => boolean;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
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

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addProduct: (product) => {
    if (!product.isActive) {
      return false;
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

    return true;
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
}));
