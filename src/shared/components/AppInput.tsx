import { useState } from "react";
import type { ReactNode } from "react";
import { TextInput, View, I18nManager } from "react-native";
import type { TextInputProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";

import { AppColors } from "@/shared/lib/colors";
import { AppText as Text } from "@/shared/components/AppText";

interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
  containerClassName?: string;
  inputClassName?: string;
  trailing?: ReactNode;
  optional?: boolean;
  /** Force text direction for LTR content (emails, plate numbers) in an RTL app */
  forceTextDirection?: 'rtl' | 'ltr' | 'auto';
}

export function AppInput({
  label,
  error,
  containerClassName = "",
  inputClassName = "",
  trailing,
  optional = false,
  forceTextDirection,
  onFocus,
  onBlur,
  style,
  ...props
}: AppInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useSharedValue(0);

  const resolvedTextAlign = forceTextDirection === 'ltr'
    ? 'left' as const
    : forceTextDirection === 'rtl'
      ? 'right' as const
      : props.textAlign || (I18nManager.isRTL ? 'right' as const : 'left' as const);

  const resolvedWritingDirection = forceTextDirection === 'ltr'
    ? 'ltr' as const
    : forceTextDirection === 'rtl'
      ? 'rtl' as const
      : undefined;

  const borderAnimStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? AppColors.error
      : interpolateColor(
          focusAnim.value,
          [0, 1],
          [AppColors.surfaceContainerLow, AppColors.primary],
        ),
    borderWidth: error || focusAnim.value > 0.5 ? 1 : 0,
    transform: [{ scale: 1 + focusAnim.value * 0.005 }],
  }));

  const errorTextAlign = I18nManager.isRTL ? 'text-right' : 'text-left';

  return (
    <View className={`flex-col gap-stack-sm ${containerClassName}`}>
      <View className="flex-row justify-between items-center">
        <Text className="font-label-sm text-label-sm text-on-surface">
          {label}
        </Text>
        {optional ? (
          <Text className="font-label-sm text-label-sm text-tertiary-container">اختياري</Text>
        ) : null}
      </View>
      <Animated.View style={borderAnimStyle} className="relative rounded-xl">
        <TextInput
          className={`w-full h-12 rounded-xl px-4 font-body-md text-body-md text-on-surface ${
            trailing ? (I18nManager.isRTL ? "pl-14" : "pr-14") : ""
          } ${
            error
              ? "bg-error-container/20"
              : isFocused
                ? "bg-surface-container-lowest"
                : "bg-surface-container-low"
          } ${inputClassName}`}
          placeholderTextColor={AppColors.outlineVariant}
          style={[
            style,
            { fontFamily: "Tajawal_400Regular" },
            resolvedWritingDirection ? { writingDirection: resolvedWritingDirection } : {},
          ]}
          textAlign={resolvedTextAlign}
          onFocus={(e) => {
            setIsFocused(true);
            focusAnim.value = withTiming(1, { duration: 200 });
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            focusAnim.value = withTiming(0, { duration: 200 });
            onBlur?.(e);
          }}
          {...props}
        />
        {trailing ? (
          <View className={`absolute bottom-0 ${I18nManager.isRTL ? "left-3" : "right-3"} top-0 justify-center`}>
            {trailing}
          </View>
        ) : null}
      </Animated.View>
      {error ? (
        <Text className={`font-label-sm text-label-sm text-error ${errorTextAlign}`}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
