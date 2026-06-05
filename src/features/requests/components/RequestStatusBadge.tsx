import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { STATUS_LABELS } from '@/features/requests/selectors/requestSelectors';
import type { ServiceRequestStatus } from '@/features/requests/types';

import { AppText as Text } from '@/shared/components/AppText';

/* ── Status Icons (Unicode) ── */
const STATUS_ICONS: Record<ServiceRequestStatus, string> = {
  pending: '◷',
  confirmed: '✓',
  in_progress: '⚡',
  completed: '●',
  cancelled: '✕',
};

interface RequestStatusBadgeProps {
  status: ServiceRequestStatus;
}

const badgeStyles: Record<ServiceRequestStatus, { container: string; icon: string; text: string }> = {
  pending: {
    container: 'border-amber-200/80 bg-amber-50/60 dark:border-amber-700/40 dark:bg-amber-950/20',
    icon: 'text-amber-500',
    text: 'text-amber-700 dark:text-amber-300',
  },
  confirmed: {
    container: 'border-sky-200/80 bg-sky-50/60 dark:border-sky-700/40 dark:bg-sky-950/20',
    icon: 'text-sky-500',
    text: 'text-sky-700 dark:text-sky-300',
  },
  in_progress: {
    container: 'border-[#111111] bg-[#111111] dark:border-[#E0E0E0] dark:bg-[#E0E0E0]',
    icon: 'text-white dark:text-[#111111]',
    text: 'text-white dark:text-[#111111]',
  },
  completed: {
    container: 'border-emerald-200/80 bg-emerald-50/60 dark:border-emerald-700/40 dark:bg-emerald-950/20',
    icon: 'text-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  cancelled: {
    container: 'border-[#E5E5E5] bg-[#F3F4F6] dark:border-dark-line dark:bg-dark-card',
    icon: 'text-[#8A8A8A]',
    text: 'text-[#8A8A8A] dark:text-dark-muted',
  },
};

function PulsingDot({ color }: { color: string }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animStyle}>
      <Text className={`font-sans text-xs ${color}`}>●</Text>
    </Animated.View>
  );
}

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  const styles = badgeStyles[status];
  const showPulse = status === 'in_progress' || status === 'pending';

  return (
    <View className={`flex-row-reverse items-center gap-1.5 rounded-md border px-2.5 py-1 ${styles.container}`}>
      {showPulse ? (
        <PulsingDot color={styles.icon} />
      ) : (
        <Text className={`font-sans text-xs ${styles.icon}`}>{STATUS_ICONS[status]}</Text>
      )}
      <Text className={`font-sans text-xs font-semibold ${styles.text}`}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}
