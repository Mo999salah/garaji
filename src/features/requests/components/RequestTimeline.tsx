import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

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

const STATUS_DOT_COLORS: Record<ServiceRequestStatus, string> = {
  pending: 'bg-amber-400',
  confirmed: 'bg-brand-500',
  in_progress: 'bg-action-500',
  completed: 'bg-emerald-500',
  cancelled: 'bg-red-400',
};

const STATUS_TEXT_COLORS: Record<ServiceRequestStatus, string> = {
  pending: 'text-amber-700 dark:text-amber-300',
  confirmed: 'text-brand-700 dark:text-dark-brand-500',
  in_progress: 'text-action-700 dark:text-emerald-300',
  completed: 'text-emerald-700 dark:text-emerald-300',
  cancelled: 'text-red-600 dark:text-red-400',
};

const STATUS_ICONS: Record<ServiceRequestStatus, keyof typeof Feather.glyphMap> = {
  pending: 'clock',
  confirmed: 'check-circle',
  in_progress: 'activity',
  completed: 'check-circle',
  cancelled: 'x-circle',
};

const STATUS_ICON_COLORS: Record<ServiceRequestStatus, string> = {
  pending: '#B45309',
  confirmed: '#0284C7',
  in_progress: '#059669',
  completed: '#059669',
  cancelled: '#DC2626',
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

/* ── Animated progress bar for the active step ── */
function ActivePulse() {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(100, { duration: 600 });
  }, [width]);

  const animStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
    height: 2,
    backgroundColor: '#0284C7',
    borderRadius: 1,
    marginTop: 4,
  }));

  return <Animated.View style={animStyle} />;
}

export function RequestTimeline({ currentStatus, events }: RequestTimelineProps) {
  if (currentStatus === 'cancelled') {
    const cancelEvent = events?.find((e) => e.status === 'cancelled');
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        className="rounded-md border border-red-200/60 bg-red-50/40 p-4 dark:border-red-800/30 dark:bg-red-950/20"
      >
        <View className="flex-row-reverse items-center gap-2">
          <Feather name="x-circle" size={16} color="#DC2626" />
          <Text className="font-sans text-sm font-semibold text-red-700 dark:text-red-300">الطلب ملغى</Text>
        </View>
        {cancelEvent?.note ? (
          <Text className="font-sans mt-1 text-xs text-red-500 dark:text-red-400">{cancelEvent.note}</Text>
        ) : null}
      </Animated.View>
    );
  }

  if (events && events.length > 0) {
    const sorted = [...events].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    return (
      <View className="gap-1">
        {sorted.map((event, idx) => {
          const isLast = idx === sorted.length - 1;
          const dotColor = STATUS_DOT_COLORS[event.status] ?? STATUS_DOT_COLORS.pending;
          const textColor = STATUS_TEXT_COLORS[event.status] ?? STATUS_TEXT_COLORS.pending;
          return (
            <Animated.View
              entering={FadeIn.delay(idx * 100).duration(300)}
              className="flex-row gap-3"
              key={event.id}
            >
              <View className="items-center">
                <View className={`mt-1 h-3 w-3 rounded-full ${dotColor}`} />
                {!isLast && <View className="mt-0.5 flex-1 w-0.5 bg-line dark:bg-dark-line" />}
              </View>
              <View className="flex-1 pb-3">
                <View className="flex-row-reverse items-center gap-1.5">
                  <Feather
                    name={STATUS_ICONS[event.status]}
                    size={13}
                    color={STATUS_ICON_COLORS[event.status]}
                  />
                  <Text className={`font-sans text-sm font-semibold ${textColor}`}>
                    {STATUS_LABELS[event.status]}
                  </Text>
                </View>
                {event.note ? (
                  <Text className="font-sans mt-0.5 text-xs text-muted dark:text-dark-muted">{event.note}</Text>
                ) : null}
                <Text className="font-sans mt-0.5 text-xs text-muted dark:text-dark-muted">{formatEventDate(event.createdAt)}</Text>
                {isLast && <ActivePulse />}
              </View>
            </Animated.View>
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
        const isCurrent = index === currentIndex;
        const dotColor = isComplete ? STATUS_DOT_COLORS[step] : 'bg-line dark:bg-dark-line';
        const textColor = isComplete ? STATUS_TEXT_COLORS[step] : 'text-muted dark:text-dark-muted';
        return (
          <Animated.View
            entering={FadeIn.delay(index * 80).duration(250)}
            className="flex-row items-center gap-3"
            key={step}
          >
            <View className={`h-3.5 w-3.5 rounded-full ${dotColor}`} />
            <View className="flex-1">
              <View className="flex-row-reverse items-center gap-1.5">
                {isComplete && (
                  <Feather
                    name={STATUS_ICONS[step]}
                    size={13}
                    color={STATUS_ICON_COLORS[step]}
                  />
                )}
                <Text className={`font-sans text-sm font-semibold ${textColor}`}>
                  {STATUS_LABELS[step]}
                </Text>
              </View>
              {isCurrent && <ActivePulse />}
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}
