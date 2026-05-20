import create from 'zustand';

import type { CartItem } from '@/features/cart/types';
import {
  buildOrderFromCart,
  canTransitionOrderStatus,
} from '@/features/orders/selectors/orderSelectors';
import {
  createOrderWithItems,
  fetchCustomerOrders,
  fetchMerchantOrders,
  isOrderBackendReady,
  updateOrderStatusRecord,
} from '@/features/orders/services/supabaseOrderService';
import type { AuthUser } from '@/shared/types/auth';
import type { Order, OrderStatus } from '@/shared/types/order';

interface OrderState {
  orders: Order[];
  lastCreatedOrderId: string | null;
  isLoading: boolean;
  errorMessage: string | null;
  loadCustomerOrders: (customerId: string) => Promise<void>;
  loadMerchantOrders: (merchantId: string) => Promise<void>;
  createOrderFromCart: (customer: AuthUser, items: CartItem[], notes?: string) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, merchantId: string, nextStatus: OrderStatus) => Promise<boolean>;
  clearLastCreatedOrder: () => void;
  reset: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  lastCreatedOrderId: null,
  isLoading: false,
  errorMessage: null,
  loadCustomerOrders: async (customerId) => {
    if (!isOrderBackendReady()) {
      set({ orders: get().orders.filter((order) => order.customerId === customerId) });
      return;
    }

    set({ isLoading: true, errorMessage: null });

    try {
      const orders = await fetchCustomerOrders(customerId);
      set({ orders, isLoading: false, errorMessage: null });
    } catch (error) {
      set({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'Could not load orders.',
      });
    }
  },
  loadMerchantOrders: async (merchantId) => {
    if (!isOrderBackendReady()) {
      set({ orders: get().orders.filter((order) => order.merchantId === merchantId) });
      return;
    }

    set({ isLoading: true, errorMessage: null });

    try {
      const orders = await fetchMerchantOrders(merchantId);
      set({ orders, isLoading: false, errorMessage: null });
    } catch (error) {
      set({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'Could not load orders.',
      });
    }
  },
  createOrderFromCart: async (customer, items, notes) => {
    if (isOrderBackendReady()) {
      const [firstItem] = items;

      if (!firstItem) {
        return null;
      }

      try {
        const order = await createOrderWithItems({
          merchantId: firstItem.merchantId,
          notes,
          items,
        });

        set((state) => ({
          orders: [order, ...state.orders],
          lastCreatedOrderId: order.id,
          errorMessage: null,
        }));

        return order;
      } catch (error) {
        set({
          errorMessage: error instanceof Error ? error.message : 'Could not place your order.',
        });
        return null;
      }
    }

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
  updateOrderStatus: async (orderId, merchantId, nextStatus) => {
    const order = get().orders.find(
      (item) => item.id === orderId && item.merchantId === merchantId,
    );

    if (!order || !canTransitionOrderStatus(order.status, nextStatus)) {
      return false;
    }

    if (isOrderBackendReady()) {
      try {
        const updatedOrder = await updateOrderStatusRecord(orderId, merchantId, nextStatus);

        if (!updatedOrder) {
          return false;
        }

        set((state) => ({
          orders: state.orders.map((item) => (item.id === orderId ? updatedOrder : item)),
        }));

        return true;
      } catch (error) {
        set({
          errorMessage: error instanceof Error ? error.message : 'Could not update order status.',
        });
        return false;
      }
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
  reset: () => {
    set({
      orders: [],
      lastCreatedOrderId: null,
      isLoading: false,
      errorMessage: null,
    });
  },
}));
