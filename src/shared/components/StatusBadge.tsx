import { View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { AppText as Text } from "@/shared/components/AppText";

export type StatusBadgeVariant =
  | "warning"
  | "primary"
  | "success"
  | "default"
  | "error";

interface StatusBadgeProps {
  label: string;
  variant?: StatusBadgeVariant;
  icon?: keyof typeof MaterialIcons.glyphMap;
  className?: string;
}

const variants = {
  warning: {
    bg: "bg-warning-container",
    text: "text-warning",
    dot: "bg-warning",
  },
  primary: {
    bg: "bg-primary-container/10",
    text: "text-primary",
    dot: "bg-primary",
  },
  success: {
    bg: "bg-success-container",
    text: "text-success",
    dot: "bg-success",
  },
  error: {
    bg: "bg-error-container",
    text: "text-error",
    dot: "bg-error",
  },
  default: {
    bg: "bg-surface-container-high",
    text: "text-on-surface-variant",
    dot: "bg-on-surface-variant",
  },
};

export function StatusBadge({
  label,
  variant = "default",
  icon,
  className = "",
}: StatusBadgeProps) {
  const styles = variants[variant];

  return (
    <View
      className={`px-3 py-1 rounded-full flex-row-reverse items-center gap-1 ${styles.bg} ${className}`}
    >
      {icon ? (
        <MaterialIcons name={icon} size={14} color="currentColor" className={styles.text} />
      ) : (
        <View className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      )}
      <Text className={`${styles.text} font-label-sm text-[12px] font-bold`}>
        {label}
      </Text>
    </View>
  );
}
