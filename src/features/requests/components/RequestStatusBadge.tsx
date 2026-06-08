import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { STATUS_LABELS } from "@/features/requests/selectors/requestSelectors";
import type { ServiceRequestStatus } from "@/features/requests/types";
import { AppText as Text } from "@/shared/components/AppText";

const STATUS_ICONS: Record<
  ServiceRequestStatus,
  keyof typeof Feather.glyphMap
> = {
  pending: "clock",
  confirmed: "check-circle",
  in_progress: "activity",
  completed: "check-circle",
  cancelled: "x-circle",
};

interface BadgeConfig {
  container: string;
  iconColor: string;
  text: string;
}

const badgeStyles: Record<ServiceRequestStatus, BadgeConfig> = {
  pending: {
    container:
      "border-amber-500/20 bg-amber-500/5 dark:border-amber-500/20 dark:bg-amber-500/10",
    iconColor: "#F59E0B",
    text: "text-amber-500 dark:text-amber-400",
  },
  confirmed: {
    container:
      "border-brand-500/20 bg-brand-50 dark:border-dark-brand-500/20 dark:bg-dark-brand-50",
    iconColor: "#0284C7",
    text: "text-brand-700 dark:text-dark-brand-500",
  },
  in_progress: {
    container:
      "border-action-500/25 bg-action-50 dark:border-emerald-400/25 dark:bg-emerald-950/20",
    iconColor: "#059669",
    text: "text-action-700 font-bold dark:text-emerald-300",
  },
  completed: {
    container:
      "border-emerald-500/20 bg-emerald-500/5 dark:border-emerald-500/20 dark:bg-emerald-500/10",
    iconColor: "#059669",
    text: "text-action-700 dark:text-emerald-300",
  },
  cancelled: {
    container:
      "border-line bg-surface-soft dark:border-dark-line dark:bg-dark-card",
    iconColor: "#6B7280",
    text: "text-muted dark:text-dark-muted",
  },
};

function PulsingIcon({
  name,
  color,
}: {
  name: keyof typeof Feather.glyphMap;
  color: string;
}) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800 }),
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
      <Feather name={name} size={12} color={color} />
    </Animated.View>
  );
}

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  const styles = badgeStyles[status];
  const iconName = STATUS_ICONS[status];
  const isPulsing = status === "in_progress" || status === "pending";

  return (
    <View
      className={`flex-row-reverse items-center gap-1.5 rounded-full border px-2.5 py-1 ${styles.container}`}
    >
      {isPulsing ? (
        <PulsingIcon name={iconName} color={styles.iconColor} />
      ) : (
        <Feather name={iconName} size={12} color={styles.iconColor} />
      )}
      <Text className={`font-sans text-xs font-semibold ${styles.text}`}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}

interface RequestStatusBadgeProps {
  status: ServiceRequestStatus;
}
