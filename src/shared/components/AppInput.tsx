import { useState } from "react";
import type { ReactNode } from "react";
import { TextInput, View, I18nManager } from "react-native";
import type { TextInputProps } from "react-native";

import { AppText as Text } from "@/shared/components/AppText";

interface AppInputProps extends TextInputProps {
 label: string;
 error?: string;
 containerClassName?: string;
 inputClassName?: string;
 trailing?: ReactNode;
 optional?: boolean;
}

export function AppInput({
 label,
 error,
 containerClassName = "",
 inputClassName = "",
 trailing,
 optional = false,
 onFocus,
 onBlur,
 style,
 ...props
}: AppInputProps) {
 const [isFocused, setIsFocused] = useState(false);

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
 <View className="relative">
 <TextInput
 className={`w-full h-12 rounded-xl px-4 font-body-md text-body-md text-on-surface ${
 trailing ? (I18nManager.isRTL ? "pl-14" : "pr-14") : ""
 } ${
 error
 ? "border border-error bg-error-container/20"
 : isFocused
 ? "border border-primary bg-surface-container-lowest"
 : "border-none bg-surface-container-low"
 } ${inputClassName}`}
 placeholderTextColor="#bcc9c6"
 style={[style, { fontFamily: "Tajawal_400Regular" }]}
 textAlign={props.textAlign || (I18nManager.isRTL ? "right" : "left")}
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
 <View className={`absolute bottom-0 ${I18nManager.isRTL ? "left-3" : "right-3"} top-0 justify-center`}>
 {trailing}
 </View>
 ) : null}
 </View>
 {error ? (
 <Text className="font-label-sm text-label-sm text-error text-right">
 {error}
 </Text>
 ) : null}
 </View>
 );
}
