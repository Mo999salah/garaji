import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { OrderCard } from '@/features/orders/components/OrderCard';
import { getCustomerOrders } from '@/features/orders/selectors/orderSelectors';
import { useOrderStore } from '@/features/orders/store/useOrderStore';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function CustomerOrdersScreen() {
  const user = useAuthStore((state) => state.user);
  const orders = useOrderStore((state) => state.orders);
  const lastCreatedOrderId = useOrderStore((state) => state.lastCreatedOrderId);
  const clearLastCreatedOrder = useOrderStore((state) => state.clearLastCreatedOrder);
  const customerOrders = user ? getCustomerOrders(orders, user.id) : [];

  return (
    <ScreenContainer>
      <View className="gap-5">
        <View>
          <Text className="text-sm font-semibold text-brand-700">Orders</Text>
          <Text className="mt-2 text-3xl font-bold text-ink">Order history</Text>
          <Text className="mt-2 text-base leading-6 text-muted">
            Track submitted mock orders and merchant progress.
          </Text>
        </View>

        {lastCreatedOrderId ? (
          <View className="rounded-lg border border-brand-100 bg-brand-50 p-4">
            <Text className="text-base font-bold text-brand-700">Order placed</Text>
            <Text className="mt-1 text-sm text-muted">
              Your order was sent to the merchant queue.
            </Text>
            <View className="mt-3">
              <AppButton onPress={clearLastCreatedOrder} variant="ghost">
                Dismiss
              </AppButton>
            </View>
          </View>
        ) : null}

        {customerOrders.length ? (
          <View className="gap-3">
            {customerOrders.map((order) => (
              <OrderCard
                key={order.id}
                onPress={() => router.push(`/(customer)/orders/${order.id}` as Href)}
                order={order}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title="No orders yet"
            message="Place a mock order from your cart to start tracking fulfillment."
          />
        )}
      </View>
    </ScreenContainer>
  );
}
