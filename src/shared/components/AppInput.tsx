import { useState } from "react";
import type { ReactNode } from "react";
import { TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";

import { AppText as Text } from "@/shared/components/AppText";
interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
  containerClassName?: string;
  inputClassName?: string;
  trailing?: ReactNode;
}

export function AppInput({
  label,
  error,
  containerClassName = "",
  inputClassName = "",
  trailing,
  onFocus,
  onBlur,
  style,
  ...props
}: AppInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`gap-2 ${containerClassName}`}>
      <Text className="font-sans text-right text-sm font-semibold text-ink dark:text-dark-ink">
        {label}
      </Text>
      <View className="relative">
        <TextInput
          className={`font-sans min-h-12 rounded-2xl border px-4 text-base text-ink dark:text-dark-ink ${
            trailing ? "pl-20" : ""
          } ${
            error
              ? "border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-950/20"
              : isFocused
                ? "border-brand-600 bg-white dark:border-dark-brand-500 dark:bg-dark-card"
                : "border-line bg-white dark:border-dark-line dark:bg-dark-card"
          } ${inputClassName}`}
          placeholderTextColor="#64748B"
          style={[style, { fontFamily: "Tajawal_400Regular" }]}
          textAlign={props.textAlign || "right"}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {trailing ? (
          <View className="absolute bottom-0 left-3 top-0 justify-center">
            {trailing}
          </View>
        ) : null}
      </View>
      {error ? (
        <Text className="font-sans text-right text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
