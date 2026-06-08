import type { PropsWithChildren } from "react";
import { ActivityIndicator, View } from "react-native";
import * as Haptics from "expo-haptics";

import { AnimatedPressable } from "@/shared/components/AnimatedPressable";
import { AppText as Text } from "@/shared/components/AppText";

interface AppButtonProps extends PropsWithChildren {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  accessibilityLabel?: string;
  className?: string;
}

const variants = {
  primary:
    "bg-brand-600 border-brand-600 shadow-tactile-sm dark:bg-brand-600 dark:border-brand-600",
  secondary:
    "bg-white border-line shadow-tactile-sm dark:bg-dark-card dark:border-dark-line",
  ghost: "bg-transparent border-transparent",
};

const textVariants = {
  primary: "text-white font-bold dark:text-white",
  secondary: "text-ink font-semibold dark:text-dark-ink",
  ghost: "text-brand-700 font-bold dark:text-dark-brand-500",
};

export function AppButton({
  children,
  disabled,
  loading,
  onPress,
  variant = "primary",
  accessibilityLabel,
  className = "",
}: AppButtonProps) {
  const handlePress = () => {
    if (disabled || loading) return;

    // Provide a physical mechanical feedback click feel
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Fail-safe for platforms/devices without physical haptic motors
    }

    onPress();
  };

  return (
    <View
      className={`overflow-hidden rounded-full border ${variants[variant]} ${
        disabled || loading ? "opacity-50" : ""
      } ${className}`}
    >
      <AnimatedPressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        disabled={disabled || loading}
        onPress={handlePress}
        scaleValue={0.98}
        className="min-h-12 items-center justify-center px-5"
      >
        {loading ? (
          <ActivityIndicator color={variant === "primary" ? "#FFFFFF" : "#0284C7"} />
        ) : (
          <Text className={`font-sans text-base ${textVariants[variant]}`}>
            {children}
          </Text>
        )}
      </AnimatedPressable>
    </View>
  );
}
