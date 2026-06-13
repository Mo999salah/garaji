import type { PropsWithChildren, ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import * as Haptics from "expo-haptics";

import { AnimatedPressable } from "@/shared/components/AnimatedPressable";
import { AppColors } from "@/shared/lib/colors";
import { AppText as Text } from "@/shared/components/AppText";

interface AppButtonProps extends PropsWithChildren {
  /** Text label — alternative to `children`. */
  label?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "md" | "lg";
  accessibilityLabel?: string;
  className?: string;
  /** Icon element displayed alongside the label. Hidden when loading. */
  icon?: ReactNode;
}

const variants = {
  primary:
    "bg-primary border-primary shadow-elevated",
  secondary:
    "bg-surface-container-lowest border-surface-container-high shadow-sm",
  ghost: "bg-transparent border-transparent",
  destructive: "bg-error-container/10 border-error shadow-sm",
};

const textVariants = {
  primary: "text-on-primary font-bold",
  secondary: "text-on-surface font-semibold",
  ghost: "text-primary font-bold",
  destructive: "text-error font-bold",
};

const sizeVariants = {
  md: "min-h-12 px-5",
  lg: "min-h-14 px-6",
};

const spinnerColor: Record<string, string> = {
  primary: AppColors.onPrimary,
  destructive: AppColors.error,
  secondary: AppColors.primary,
  ghost: AppColors.primary,
};

export function AppButton({
  children,
  label,
  disabled,
  loading,
  onPress,
  variant = "primary",
  size = "md",
  accessibilityLabel,
  className = "",
  icon,
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
      className={`overflow-hidden rounded-xl border ${variants[variant]} ${
        disabled || loading ? "opacity-50" : ""
      } ${className}`}
    >
      <AnimatedPressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        disabled={disabled || loading}
        onPress={handlePress}
        scaleValue={0.98}
        className={`flex-row-reverse items-center justify-center gap-2 ${sizeVariants[size]}`}
      >
        {loading ? (
          <ActivityIndicator color={spinnerColor[variant] ?? AppColors.primary} />
        ) : (
          <>
            {icon}
            <Text className={`font-button-text text-button-text ${textVariants[variant]}`}>
              {children ?? label}
            </Text>
          </>
        )}
      </AnimatedPressable>
    </View>
  );
}
