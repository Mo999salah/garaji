import { Text, View } from 'react-native';

import { formatCurrency } from '@/features/cart/selectors/cartSelectors';
import type { OrderItem } from '@/shared/types/order';

interface OrderItemsListProps {
  items: OrderItem[];
}

export function OrderItemsList({ items }: OrderItemsListProps) {
  return (
    <View className="gap-3">
      {items.map((item) => (
        <View className="rounded-lg border border-line bg-white p-4" key={item.productId}>
          <Text className="text-xs font-semibold uppercase text-muted">{item.brand}</Text>
          <Text className="mt-1 text-base font-bold text-ink">{item.name}</Text>
          {item.partNumber ? (
            <Text className="mt-1 text-xs font-semibold uppercase text-brand-700">
              {item.partNumber}
            </Text>
          ) : null}
          <View className="mt-3 flex-row items-center justify-between gap-3">
            <Text className="text-sm text-muted">
              {item.quantity} x {formatCurrency(item.unitPrice)} / {item.unit}
            </Text>
            <Text className="text-base font-bold text-brand-700">
              {formatCurrency(item.unitPrice * item.quantity)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
