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
  variant?: 'request' | 'vehicle';
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
      className={`bg-[#E5E5E5] dark:bg-dark-line ${className}`}
    />
  );
}

export function SkeletonCard({ className = '', variant = 'request' }: SkeletonCardProps) {
  return (
    <View
      accessibilityLabel="جارٍ تحميل المحتوى"
      accessibilityRole="progressbar"
      className={`rounded-md border border-[#E5E5E5] bg-white p-6 dark:border-dark-line dark:bg-dark-card ${className}`}
    >
      <View className="flex-row-reverse items-start justify-between gap-4">
        <View className="flex-1 items-end gap-3">
          <SkeletonBlock className="h-9 w-9 rounded-md bg-[#F3F4F6] dark:bg-dark-surface" />
          <SkeletonBlock className="h-4 w-3/4 rounded-sm" />
          <SkeletonBlock className="h-3 w-1/2 rounded-sm bg-[#F3F4F6] dark:bg-dark-surface" />
          {variant === 'vehicle' ? (
            <View className="mt-1 items-end gap-2">
              <SkeletonBlock className="h-7 w-24 rounded-md bg-[#F3F4F6] dark:bg-dark-surface" />
              <SkeletonBlock className="h-3 w-28 rounded-sm" />
            </View>
          ) : (
            <View className="mt-2 w-full flex-row-reverse gap-2">
              <SkeletonBlock className="h-10 flex-1 rounded-md bg-[#F3F4F6] dark:bg-dark-surface" />
              <SkeletonBlock className="h-10 flex-1 rounded-md bg-[#F3F4F6] dark:bg-dark-surface" />
            </View>
          )}
        </View>

        <View className="items-start gap-3">
          <SkeletonBlock className="h-7 w-20 rounded-sm bg-[#F3F4F6] dark:bg-dark-surface" />
          {variant === 'request' ? (
            <SkeletonBlock className="h-4 w-16 rounded-sm" />
          ) : null}
        </View>
      </View>
    </View>
  );
}
