import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface SkeletonCardProps {
  variant?: 'action' | 'metric' | 'request' | 'vehicle';
  className?: string;
}

function SkeletonBlock({ className }: { className: string }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700 }),
        withTiming(0.4, { duration: 700 }),
      ),
      -1,
      true,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={animStyle}
      className={`bg-line dark:bg-dark-line ${className}`}
    />
  );
}

export function SkeletonCard({ className = '', variant = 'request' }: SkeletonCardProps) {
  if (variant === 'metric') {
    return (
      <View
        accessibilityLabel="جارٍ تحميل المحتوى"
        accessibilityRole="progressbar"
        className={`min-h-[104px] flex-1 rounded-lg border border-line bg-white p-4 shadow-tactile-sm dark:border-dark-line dark:bg-dark-card ${className}`}
      >
        <View className="items-end gap-3">
          <SkeletonBlock className="h-3 w-16 rounded-sm bg-surface-soft dark:bg-dark-surface" />
          <SkeletonBlock className="h-8 w-12 rounded-md" />
        </View>
      </View>
    );
  }

  if (variant === 'action') {
    return (
      <View
        accessibilityLabel="جارٍ تحميل المحتوى"
        accessibilityRole="progressbar"
        className={`min-h-[112px] rounded-lg border border-line bg-white p-4 shadow-tactile-sm dark:border-dark-line dark:bg-dark-card ${className}`}
      >
        <View className="items-end gap-3">
          <SkeletonBlock className="h-11 w-11 rounded-lg bg-surface-soft dark:bg-dark-surface" />
          <SkeletonBlock className="h-4 w-24 rounded-sm" />
          <SkeletonBlock className="h-3 w-32 rounded-sm bg-surface-soft dark:bg-dark-surface" />
        </View>
      </View>
    );
  }

  return (
    <View
      accessibilityLabel="جارٍ تحميل المحتوى"
      accessibilityRole="progressbar"
      className={`rounded-lg border border-line bg-white p-6 shadow-tactile-sm dark:border-dark-line dark:bg-dark-card ${className}`}
    >
      <View className="flex-row-reverse items-start justify-between gap-4">
        <View className="flex-1 items-end gap-3">
          <SkeletonBlock className="h-9 w-9 rounded-md bg-surface-soft dark:bg-dark-surface" />
          <SkeletonBlock className="h-4 w-3/4 rounded-sm" />
          <SkeletonBlock className="h-3 w-1/2 rounded-sm bg-surface-soft dark:bg-dark-surface" />
          {variant === 'vehicle' ? (
            <View className="mt-1 items-end gap-2">
              <SkeletonBlock className="h-7 w-24 rounded-md bg-surface-soft dark:bg-dark-surface" />
              <SkeletonBlock className="h-3 w-28 rounded-sm" />
            </View>
          ) : (
            <View className="mt-2 w-full flex-row-reverse gap-2">
              <SkeletonBlock className="h-10 flex-1 rounded-md bg-surface-soft dark:bg-dark-surface" />
              <SkeletonBlock className="h-10 flex-1 rounded-md bg-surface-soft dark:bg-dark-surface" />
            </View>
          )}
        </View>

        <View className="items-start gap-3">
          <SkeletonBlock className="h-7 w-20 rounded-sm bg-surface-soft dark:bg-dark-surface" />
          {variant === 'request' ? (
            <SkeletonBlock className="h-4 w-16 rounded-sm" />
          ) : null}
        </View>
      </View>
    </View>
  );
}
