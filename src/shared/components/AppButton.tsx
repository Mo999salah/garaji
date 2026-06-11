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
    "bg-primary border-primary shadow-[0px_8px_30px_rgba(0,104,95,0.08)]",
  secondary:
    "bg-surface-container-lowest border-surface-container-high shadow-sm",
  ghost: "bg-transparent border-transparent",
};

const textVariants = {
  primary: "text-on-primary font-bold",
  secondary: "text-on-surface font-semibold",
  ghost: "text-primary font-bold",
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

    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    onPress();
  };

  return (
    <View
      className={`overflow-hidden rounded-[14px] border ${variants[variant]} ${
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
          <ActivityIndicator color={variant === "primary" ? "#ffffff" : "#00685f"} />
        ) : (
          <Text className={`font-button-text text-[16px] leading-[16px] ${textVariants[variant]}`}>
            {children}
          </Text>
        )}
      </AnimatedPressable>
    </View>
  );
}
