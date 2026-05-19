import { Text } from 'react-native';

import { statusLabels } from '@/features/orders/selectors/orderSelectors';
import type { OrderStatus } from '@/shared/types/order';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const badgeStyles: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  processing: 'bg-sky-50 text-sky-700',
  on_the_way: 'bg-indigo-50 text-indigo-700',
  delivered: 'bg-brand-50 text-brand-700',
  cancelled: 'bg-red-50 text-red-700',
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <Text className={`rounded-md px-2 py-1 text-xs font-semibold ${badgeStyles[status]}`}>
      {statusLabels[status]}
    </Text>
  );
}
