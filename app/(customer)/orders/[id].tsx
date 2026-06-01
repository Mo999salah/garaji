import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { formatCurrency } from '@/features/cart/selectors/cartSelectors';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { OrderItemsList } from '@/features/orders/components/OrderItemsList';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { OrderTimeline } from '@/features/orders/components/OrderTimeline';
import {
  formatOrderDate,
  formatOrderId,
  getCustomerOrderStatusMessage,
} from '@/features/orders/selectors/orderSelectors';
import { useOrderStore } from '@/features/orders/store/useOrderStore';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function CustomerOrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const order = useOrderStore((state) =>
    user ? state.orders.find((item) => item.id === id && item.customerId === user.id) : undefined,
  );
  const lastCreatedOrderId = useOrderStore((state) => state.lastCreatedOrderId);
  const clearLastCreatedOrder = useOrderStore((state) => state.clearLastCreatedOrder);

  if (!order) {
    return (
      <ScreenContainer>
        <EmptyState
          title="Order not found"
          message="This order does not belong to the signed-in customer."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="gap-5">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-brand-700">Order details</Text>
            <Text className="mt-2 text-3xl font-bold text-ink">{formatOrderId(order.id)}</Text>
            <Text className="mt-2 text-base text-muted">{formatOrderDate(order.createdAt)}</Text>
          </View>
          <OrderStatusBadge status={order.status} />
        </View>

        {lastCreatedOrderId === order.id ? (
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

        <AppCard>
          <Text className="text-lg font-semibold text-ink">Status timeline</Text>
          <Text className="mt-2 text-sm leading-5 text-muted">
            {getCustomerOrderStatusMessage(order.status)}
          </Text>
          <View className="mt-4">
            <OrderTimeline status={order.status} />
          </View>
        </AppCard>

        <OrderItemsList items={order.items} />

        <AppCard>
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-ink">Subtotal</Text>
            <Text className="text-2xl font-bold text-brand-700">
              {formatCurrency(order.subtotal)}
            </Text>
          </View>
          <Text className="mt-4 text-sm text-muted">Notes</Text>
          <Text className="mt-1 text-base text-ink">{order.notes ?? 'No notes provided.'}</Text>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}
