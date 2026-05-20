import { useCartStore } from '@/features/cart/store/useCartStore';
import { useOrderStore } from '@/features/orders/store/useOrderStore';
import { useProductStore } from '@/features/products/store/useProductStore';

export function resetSessionStores() {
  useCartStore.getState().reset();
  useOrderStore.getState().reset();
  useProductStore.getState().reset();
}
