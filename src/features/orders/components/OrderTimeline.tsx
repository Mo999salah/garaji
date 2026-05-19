import { Text, View } from 'react-native';

import { statusLabels } from '@/features/orders/selectors/orderSelectors';
import type { OrderStatus } from '@/shared/types/order';

const progressStatuses: OrderStatus[] = ['pending', 'processing', 'on_the_way', 'delivered'];

interface OrderTimelineProps {
  status: OrderStatus;
}

export function OrderTimeline({ status }: OrderTimelineProps) {
  if (status === 'cancelled') {
    return (
      <View className="rounded-lg border border-red-100 bg-red-50 p-4">
        <Text className="text-sm font-semibold text-red-700">Order cancelled</Text>
      </View>
    );
  }

  const currentIndex = progressStatuses.indexOf(status);

  return (
    <View className="gap-3">
      {progressStatuses.map((item, index) => {
        const isComplete = index <= currentIndex;

        return (
          <View className="flex-row items-center gap-3" key={item}>
            <View
              className={`h-4 w-4 rounded-full ${
                isComplete ? 'bg-brand-600' : 'bg-neutral-200'
              }`}
            />
            <Text className={`text-sm font-semibold ${isComplete ? 'text-ink' : 'text-muted'}`}>
              {statusLabels[item]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
