import { View } from 'react-native';

import { STATUS_LABELS } from '@/features/requests/selectors/requestSelectors';
import type { ServiceRequestEvent, ServiceRequestStatus } from '@/features/requests/types';

import { AppText as Text } from '@/shared/components/AppText';
interface RequestTimelineProps {
  events?: ServiceRequestEvent[];
  currentStatus: ServiceRequestStatus;
}

const ORDERED_STATUSES: ServiceRequestStatus[] = [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
];

const STATUS_COLORS: Record<ServiceRequestStatus, { dot: string; text: string }> = {
  pending: { dot: 'bg-amber-400', text: 'text-amber-700 dark:text-amber-300' },
  confirmed: { dot: 'bg-sky-500', text: 'text-sky-700 dark:text-sky-300' },
  in_progress: { dot: 'bg-indigo-500', text: 'text-indigo-700 dark:text-indigo-300' },
  completed: { dot: 'bg-emerald-600', text: 'text-emerald-700 dark:text-emerald-300' },
  cancelled: { dot: 'bg-red-500', text: 'text-red-700 dark:text-red-300' },
};

function formatEventDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('ar-SA', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function RequestTimeline({ currentStatus, events }: RequestTimelineProps) {
  if (currentStatus === 'cancelled') {
    const cancelEvent = events?.find((e) => e.status === 'cancelled');
    return (
      <View className="rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/40">
        <Text className="font-sans text-sm font-semibold text-red-700 dark:text-red-300">الطلب ملغى</Text>
        {cancelEvent?.note ? (
          <Text className="font-sans mt-1 text-xs text-red-600 dark:text-red-400">{cancelEvent.note}</Text>
        ) : null}
      </View>
    );
  }

  if (events && events.length > 0) {
    const sorted = [...events].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    return (
      <View className="gap-1">
        {sorted.map((event, idx) => {
          const colors = STATUS_COLORS[event.status] ?? STATUS_COLORS.pending;
          const isLast = idx === sorted.length - 1;
          return (
            <View className="flex-row gap-3" key={event.id}>
              <View className="items-center">
                <View className={`mt-1 h-3 w-3 rounded-full ${colors.dot}`} />
                {!isLast && <View className="mt-0.5 flex-1 w-0.5 bg-neutral-200 dark:bg-dark-line" />}
              </View>
              <View className="flex-1 pb-3">
                <Text className={`font-sans text-sm font-semibold ${colors.text}`}>
                  {STATUS_LABELS[event.status]}
                </Text>
                {event.note ? (
                  <Text className="font-sans mt-0.5 text-xs text-muted dark:text-dark-muted">{event.note}</Text>
                ) : null}
                <Text className="font-sans mt-0.5 text-xs text-muted dark:text-dark-muted">{formatEventDate(event.createdAt)}</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  const currentIndex = ORDERED_STATUSES.indexOf(currentStatus);

  return (
    <View className="gap-3">
      {ORDERED_STATUSES.map((step, index) => {
        const isComplete = index <= currentIndex;
        const colors = STATUS_COLORS[step];
        return (
          <View className="flex-row items-center gap-3" key={step}>
            <View
              className={`h-4 w-4 rounded-full ${isComplete ? colors.dot : 'bg-neutral-200 dark:bg-dark-line'}`}
            />
            <Text className={`font-sans text-sm font-semibold ${isComplete ? colors.text : 'text-muted dark:text-dark-muted'}`}>
              {STATUS_LABELS[step]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
