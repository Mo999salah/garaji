import { View } from 'react-native';

import { STATUS_LABELS } from '@/features/requests/selectors/requestSelectors';
import type { ServiceRequestStatus } from '@/features/requests/types';

import { AppText as Text } from '@/shared/components/AppText';
interface RequestStatusBadgeProps {
  status: ServiceRequestStatus;
}

const badgeStyles: Record<ServiceRequestStatus, { container: string; dot: string; text: string }> = {
  pending: {
    container: 'border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40',
    dot: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-300',
  },
  confirmed: {
    container: 'border-sky-200 bg-sky-50 dark:border-sky-700 dark:bg-sky-950/40',
    dot: 'bg-sky-500',
    text: 'text-sky-700 dark:text-sky-300',
  },
  in_progress: {
    container: 'border-indigo-200 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/40',
    dot: 'bg-indigo-500',
    text: 'text-indigo-700 dark:text-indigo-300',
  },
  completed: {
    container: 'border-emerald-200 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  cancelled: {
    container: 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-950/40',
    dot: 'bg-red-500',
    text: 'text-red-700 dark:text-red-300',
  },
};

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  const styles = badgeStyles[status];

  return (
    <View className={`flex-row-reverse items-center gap-1.5 rounded-lg border px-2.5 py-0.5 ${styles.container}`}>
      <View className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
      <Text className={`font-sans text-xs font-semibold ${styles.text}`}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}
