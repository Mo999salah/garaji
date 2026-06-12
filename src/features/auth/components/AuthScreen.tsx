import type { PropsWithChildren } from "react";
import {
 Keyboard,
 KeyboardAvoidingView,
 Platform,
 Pressable,
 ScrollView,
 TouchableWithoutFeedback,
 View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { UserRole } from "@/shared/types/auth";
import { AppText as Text } from "@/shared/components/AppText";

const RING_SIZES = [280, 200, 130, 72] as const;

function CinematicHeader() {
 return (
 <View
 className="border-b border-dark-line bg-dark-surface"
 style={{ height: 270, overflow: "hidden" }}
 >
 {RING_SIZES.map((size) => (
 <View
 key={size}
 style={{
 position: "absolute",
 width: size,
 height: size,
 borderRadius: size / 2,
 borderWidth: 0.5,
 borderColor: "#FFB77D",
 right: 60 - size / 2,
 bottom: 20 - size / 2,
 opacity: 0.22,
 }}
 />
 ))}

 <View
 style={{
 position: "absolute",
 left: 0,
 width: 100,
 height: 1,
 top: 88,
 backgroundColor: "#85CFFF",
 opacity: 0.22,
 }}
 />
 <View
 style={{
 position: "absolute",
 left: 0,
 width: 68,
 height: 1,
 top: 105,
 backgroundColor: "#FF8C00",
 opacity: 0.24,
 }}
 />
 <View
 style={{
 position: "absolute",
 left: 0,
 width: 42,
 height: 0.5,
 top: 122,
 backgroundColor: "#85CFFF",
 opacity: 0.14,
 }}
 />

 <View style={{ position: "absolute", top: 28, left: 24 }}>
 <Text
 style={{
 letterSpacing: 2,
 fontSize: 11,
 color: "#FFB77D",
 fontFamily: "Tajawal_700Bold",
 }}
 >
 K A R A J I
 </Text>
 </View>

 <View className="absolute right-6 top-7 rounded-full border border-brand-500/20 bg-dark-card px-3 py-1">
 <Text className="font-sans text-[10px] font-bold text-dark-brand-500">
 جاهز للخدمة
 </Text>
 </View>

 <View className="absolute bottom-7 left-6 right-6 rounded-2xl border border-dark-line bg-dark-card/95 p-5 shadow-soft">
 <View className="mb-4 h-20 w-20 self-center items-center justify-center rounded-2xl border border-dark-line bg-dark-surface">
 <Text className="font-sans text-4xl font-black text-dark-brand-500">
 K
 </Text>
 </View>
 <Text className="font-sans text-center text-2xl font-black text-dark-ink">
 Karaji
 </Text>
 <Text className="font-sans mt-2 text-center text-sm leading-5 text-dark-muted">
 خدمات السيارات، الحجوزات، والمتابعة في تجربة واحدة.
 </Text>
 </View>
 </View>
 );
}

/* ─────────────────────── Auth Gallery Canvas ─────────────────────── */

interface AuthScreenProps extends PropsWithChildren {
 eyebrow?: string;
 title: string;
 subtitle: string;
 footer?: string;
 variant?: "default" | "login";
}

export function AuthScreen({
 children,
 footer,
 subtitle,
 title,
}: AuthScreenProps) {
 return (
 <SafeAreaView
 className="flex-1 bg-dark-surface"
 edges={["top", "bottom", "left", "right"]}
 >
 <KeyboardAvoidingView
 behavior={Platform.OS === "ios" ? "padding" : undefined}
 className="flex-1"
 >
 <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
 <ScrollView
 className="flex-1"
 contentContainerClassName="grow"
 keyboardShouldPersistTaps="handled"
 showsVerticalScrollIndicator={false}
 >
 <CinematicHeader />

 <View className="px-6 pb-14 pt-8">
 <Text className="font-sans text-center text-3xl font-black leading-tight text-dark-ink">
 {title}
 </Text>
 <Text className="font-sans mt-3 text-center text-base leading-6 text-dark-muted">
 {subtitle}
 </Text>

 <View className="mt-8">{children}</View>

 {footer ? (
 <Text className="font-sans mt-10 text-center text-xs leading-5 text-dark-muted">
 {footer}
 </Text>
 ) : null}
 </View>
 </ScrollView>
 </TouchableWithoutFeedback>
 </KeyboardAvoidingView>
 </SafeAreaView>
 );
}

/* ─────────────────────── Auth Notice ─────────────────────── */

interface AuthNoticeProps {
 message?: string | null;
 tone?: "success" | "error" | "info";
}

const noticeStyles = {
 success: {
 container: "rounded-lg border border-action-500/20 bg-success-container",
 text: "text-action-700",
 },
 error: {
 container: "rounded-lg border border-red-200 bg-red-50",
 text: "text-red-700",
 },
 info: {
 container: "rounded-lg border border-brand-500/20 bg-primary-container/10",
 text: "text-dark-brand-500",
 },
};

export function AuthNotice({ message, tone = "info" }: AuthNoticeProps) {
 if (!message) {
 return null;
 }

 const styles = noticeStyles[tone];

 return (
 <View className={`px-4 py-3 ${styles.container}`}>
 <Text
 className={`font-sans text-right text-sm font-medium leading-5 ${styles.text}`}
 >
 {message}
 </Text>
 </View>
 );
}

/* ─────────────────────── Password Toggle ─────────────────────── */

interface PasswordToggleProps {
 visible: boolean;
 onPress: () => void;
}

export function PasswordToggle({ onPress, visible }: PasswordToggleProps) {
 return (
 <Pressable
 accessibilityLabel={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
 accessibilityRole="button"
 className="min-h-11 justify-center px-2 py-1 active:opacity-60"
 onPress={onPress}
 >
 <Text className="font-sans text-xs font-semibold text-dark-brand-500">
 {visible ? "إخفاء" : "إظهار"}
 </Text>
 </Pressable>
 );
}

/* ─────────────────────── Auth Text Button ─────────────────────── */

interface AuthTextButtonProps {
 children: string;
 onPress: () => void;
}

export function AuthTextButton({ children, onPress }: AuthTextButtonProps) {
 return (
 <Pressable
 accessibilityRole="button"
 className="min-h-11 justify-center py-1 active:opacity-60"
 onPress={onPress}
 >
 <Text
 className="font-sans text-sm font-semibold text-dark-brand-500"
 style={{ textDecorationLine: "underline" }}
 >
 {children}
 </Text>
 </Pressable>
 );
}

/* ─────────────────────── Role Selector ─────────────────────── */

interface RoleSelectorProps {
 value: UserRole;
 onChange: (role: UserRole) => void;
}

export function RoleSelector({ onChange, value }: RoleSelectorProps) {
 return (
 <View className="gap-2.5">
 <Text className="font-sans text-right text-xs font-semibold text-dark-muted">
 نوع الحساب
 </Text>
 <View className="flex-row-reverse gap-3">
 <RoleOption
 description="حجوزات ومتابعة مركبات"
 label="عميل"
 onPress={() => onChange("customer")}
 selected={value === "customer"}
 />
 <RoleOption
 description="إدارة الطلبات والفروع"
 label="تاجر"
 onPress={() => onChange("merchant")}
 selected={value === "merchant"}
 />
 </View>
 </View>
 );
}

interface RoleOptionProps {
 description: string;
 label: string;
 onPress: () => void;
 selected: boolean;
}

function RoleOption({
 description,
 label,
 onPress,
 selected,
}: RoleOptionProps) {
 return (
 <Pressable
 accessibilityRole="radio"
 accessibilityState={{ checked: selected }}
 className={`min-h-[96px] flex-1 justify-between rounded-lg border p-4 active:opacity-80 ${
 selected
 ? "border-brand-600 bg-dark-brand-50"
 : "border-dark-line bg-dark-surface"
 }`}
 onPress={onPress}
 >
 <Text
 className={`font-sans text-right text-base font-bold ${
 selected ? "text-dark-brand-500" : "text-dark-ink"
 }`}
 >
 {label}
 </Text>
 <Text
 className={`font-sans mt-2 text-right text-xs leading-5 ${
 selected ? "text-dark-brand-500" : "text-dark-muted"
 }`}
 >
 {description}
 </Text>
 </Pressable>
 );
}
