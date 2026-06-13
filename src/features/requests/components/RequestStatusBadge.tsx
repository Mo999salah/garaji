import { useEffect } from "react";
import { View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { STATUS_LABELS } from "@/features/requests/selectors/requestSelectors";
import type { ServiceRequestStatus } from "@/features/requests/types";
import { AppColors } from "@/shared/lib/colors";
import { AppText as Text } from "@/shared/components/AppText";

interface BadgeConfig {
  container: string;
  text: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
}

const badgeStyles: Record<ServiceRequestStatus, BadgeConfig> = {
  pending: {
    container: "bg-warning/10",
    text: "text-warning",
    icon: "schedule",
    iconColor: AppColors.warning,
  },
  confirmed: {
    container: "bg-primary-container/10",
    text: "text-primary-container",
    icon: "check-circle",
    iconColor: AppColors.primaryContainer,
  },
  in_progress: {
    container: "bg-warning-container",
    text: "text-on-warning",
    icon: "build",
    iconColor: AppColors.onWarning,
  },
  completed: {
    container: "bg-success/10",
    text: "text-success",
    icon: "verified",
    iconColor: AppColors.success,
  },
  cancelled: {
    container: "bg-error-container/20",
    text: "text-error",
    icon: "cancel",
    iconColor: AppColors.error,
  },
};

function PulseDot() {
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
    <Animated.View
      style={animStyle}
      className="w-1.5 h-1.5 rounded-full bg-warning"
    />
  );
}

interface RequestStatusBadgeProps {
  status: ServiceRequestStatus;
}

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  const styles = badgeStyles[status];
  const isActive = status === "in_progress";

  return (
    <View
      className={`flex-row-reverse items-center gap-1.5 px-2.5 py-1 rounded-md ${styles.container}`}
      accessibilityLabel={`حالة الطلب: ${STATUS_LABELS[status]}`}
      accessibilityRole="text"
    >
      {isActive && <PulseDot />}
      <MaterialIcons name={styles.icon} size={13} color={styles.iconColor} />
      <Text className={`font-label-sm text-[11px] leading-[18px] font-bold tracking-wide ${styles.text}`}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}
