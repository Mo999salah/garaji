import { Text } from 'react-native';

import { STATUS_LABELS } from '@/features/requests/selectors/requestSelectors';
import type { ServiceRequestStatus } from '@/features/requests/types';

interface RequestStatusBadgeProps {
  status: ServiceRequestStatus;
}

const badgeStyles: Record<ServiceRequestStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-sky-50 text-sky-700',
  in_progress: 'bg-indigo-50 text-indigo-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
};

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  return (
    <Text className={`rounded-md px-2 py-1 text-xs font-semibold ${badgeStyles[status]}`}>
      {STATUS_LABELS[status]}
    </Text>
  );
}
