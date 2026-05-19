import { Pressable, Text, View } from 'react-native';

import { formatCurrency } from '@/features/cart/selectors/cartSelectors';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import {
  formatOrderDate,
  formatOrderId,
} from '@/features/orders/selectors/orderSelectors';
import type { Order } from '@/shared/types/order';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
}

export function OrderCard({ onPress, order }: OrderCardProps) {
  return (
    <Pressable
      accessibilityLabel={`View order ${formatOrderId(order.id)}`}
      accessibilityRole="button"
      className="rounded-lg border border-line bg-white p-4 active:opacity-80"
      onPress={onPress}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-lg font-bold text-ink">{formatOrderId(order.id)}</Text>
          <Text className="mt-1 text-sm text-muted">{formatOrderDate(order.createdAt)}</Text>
        </View>
        <OrderStatusBadge status={order.status} />
      </View>

      <Text className="mt-3 text-sm text-muted">
        {order.items.length} product{order.items.length === 1 ? '' : 's'} for {order.customerName}
      </Text>
      <Text className="mt-2 text-xl font-bold text-brand-700">
        {formatCurrency(order.subtotal)}
      </Text>
    </Pressable>
  );
}
