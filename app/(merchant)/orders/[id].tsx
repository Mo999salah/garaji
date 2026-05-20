import { useLocalSearchParams } from 'expo-router';
import { Alert, Platform, Text, View } from 'react-native';

import { formatCurrency } from '@/features/cart/selectors/cartSelectors';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { OrderItemsList } from '@/features/orders/components/OrderItemsList';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { OrderTimeline } from '@/features/orders/components/OrderTimeline';
import {
  formatOrderDate,
  formatOrderId,
  getNextOrderStatus,
  statusLabels,
} from '@/features/orders/selectors/orderSelectors';
import { useOrderStore } from '@/features/orders/store/useOrderStore';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function MerchantOrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const merchantId = user?.merchantId;
  const order = useOrderStore((state) =>
    merchantId
      ? state.orders.find((item) => item.id === id && item.merchantId === merchantId)
      : undefined,
  );
  const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus);

  if (!user || !order) {
    return (
      <ScreenContainer>
        <EmptyState
          title="Order not found"
          message="This order is not assigned to the signed-in merchant."
        />
      </ScreenContainer>
    );
  }

  const nextStatus = getNextOrderStatus(order.status);
  const canCancel =
    order.status === 'pending' || order.status === 'processing' || order.status === 'on_the_way';

  const advanceStatus = () => {
    if (nextStatus && merchantId) {
      void updateOrderStatus(order.id, merchantId, nextStatus);
    }
  };

  const cancelOrder = () => {
    const runCancel = () => merchantId && void updateOrderStatus(order.id, merchantId, 'cancelled');

    if (Platform.OS === 'web') {
      if (window.confirm('Cancel this order?')) {
        runCancel();
      }
      return;
    }

    Alert.alert('Cancel order?', 'This action marks the order as cancelled.', [
      { text: 'Keep order', style: 'cancel' },
      { text: 'Cancel order', style: 'destructive', onPress: runCancel },
    ]);
  };

  return (
    <ScreenContainer>
      <View className="gap-5">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-brand-700">Merchant order</Text>
            <Text className="mt-2 text-3xl font-bold text-ink">{formatOrderId(order.id)}</Text>
            <Text className="mt-2 text-base text-muted">
              {order.customerName} - {formatOrderDate(order.createdAt)}
            </Text>
          </View>
          <OrderStatusBadge status={order.status} />
        </View>

        <AppCard>
          <Text className="text-lg font-semibold text-ink">Status timeline</Text>
          <View className="mt-4">
            <OrderTimeline status={order.status} />
          </View>
          <View className="mt-4 gap-3">
            {nextStatus ? (
              <AppButton onPress={advanceStatus}>Mark {statusLabels[nextStatus]}</AppButton>
            ) : (
              <AppButton disabled onPress={() => undefined}>
                No further status changes
              </AppButton>
            )}
            {canCancel ? (
              <AppButton onPress={cancelOrder} variant="secondary">
                Cancel order
              </AppButton>
            ) : null}
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
          <Text className="mt-4 text-sm text-muted">Customer notes</Text>
          <Text className="mt-1 text-base text-ink">{order.notes ?? 'No notes provided.'}</Text>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}
