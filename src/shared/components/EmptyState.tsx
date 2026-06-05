import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AppText as Text } from '@/shared/components/AppText';

interface EmptyStateProps {
  title: string;
  message: string;
}

function FloatingIcon() {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 1200 }),
        withTiming(0, { duration: 1200 }),
      ),
      -1,
      true,
    );
  }, [translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={animStyle}
      className="mb-4 h-12 w-12 items-center justify-center rounded-full bg-[#F3F4F6] dark:bg-dark-line"
    >
      <Text className="font-sans text-xl font-black text-[#111111] dark:text-dark-ink">📦</Text>
    </Animated.View>
  );
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).springify()}
      className="items-center justify-center rounded-md border border-dashed border-[#E5E5E5] bg-[#F9F9FB] p-8 dark:border-dark-line dark:bg-dark-card/80"
    >
      <FloatingIcon />
      <Text className="font-sans text-center text-lg font-semibold text-[#111111] dark:text-dark-ink">{title}</Text>
      <Text className="font-sans mt-2 text-center text-sm leading-5 text-[#8A8A8A] dark:text-dark-muted">{message}</Text>
    </Animated.View>
  );
}
