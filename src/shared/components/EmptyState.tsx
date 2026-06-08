import { useEffect } from "react";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { AppText as Text } from "@/shared/components/AppText";

interface EmptyStateProps {
  title: string;
  message: string;
}

function FloatingIcon() {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1400 }),
        withTiming(0, { duration: 1400 }),
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
      className="mb-5 h-14 w-14 items-center justify-center rounded-lg border border-brand-500/15 bg-brand-50 shadow-tactile-sm dark:border-dark-brand-500/20 dark:bg-dark-brand-50"
    >
      <Feather name="inbox" size={24} color="#0284C7" />
    </Animated.View>
  );
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).springify()}
      className="items-center justify-center rounded-lg border border-dashed border-line bg-white p-8 shadow-tactile-sm dark:border-dark-line dark:bg-dark-card/30"
    >
      <FloatingIcon />
      <Text className="font-sans text-center text-lg font-bold text-ink dark:text-dark-ink">
        {title}
      </Text>
      <Text className="font-sans mt-2 text-center text-sm leading-5 text-muted dark:text-dark-muted">
        {message}
      </Text>
    </Animated.View>
  );
}
