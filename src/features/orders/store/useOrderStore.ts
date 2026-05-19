import create from 'zustand';

import {
  buildOrderFromCart,
  canTransitionOrderStatus,
} from '@/features/orders/selectors/orderSelectors';
import type { CartItem } from '@/features/cart/types';
import type { AuthUser } from '@/shared/types/auth';
import type { Order, OrderStatus } from '@/shared/types/order';

interface OrderState {
  orders: Order[];
  lastCreatedOrderId: string | null;
  createOrderFromCart: (customer: AuthUser, items: CartItem[], notes?: string) => Order | null;
  updateOrderStatus: (orderId: string, merchantId: string, nextStatus: OrderStatus) => boolean;
  clearLastCreatedOrder: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  lastCreatedOrderId: null,
  createOrderFromCart: (customer, items, notes) => {
    const order = buildOrderFromCart({ customer, items, notes });

    if (!order) {
      return null;
    }

    set((state) => ({
      orders: [order, ...state.orders],
      lastCreatedOrderId: order.id,
    }));

    return order;
  },
  updateOrderStatus: (orderId, merchantId, nextStatus) => {
    const order = get().orders.find(
      (item) => item.id === orderId && item.merchantId === merchantId,
    );

    if (!order || !canTransitionOrderStatus(order.status, nextStatus)) {
      return false;
    }

    set((state) => ({
      orders: state.orders.map((item) =>
        item.id === orderId && item.merchantId === merchantId
          ? { ...item, status: nextStatus, updatedAt: new Date().toISOString() }
          : item,
      ),
    }));

    return true;
  },
  clearLastCreatedOrder: () => set({ lastCreatedOrderId: null }),
}));
