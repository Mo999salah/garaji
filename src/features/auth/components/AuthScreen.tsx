import type { PropsWithChildren } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { UserRole } from '@/shared/types/auth';

import { AppText as Text } from '@/shared/components/AppText';

/* ─────────────────────── Auth Gallery Canvas ─────────────────────── */

interface AuthScreenProps extends PropsWithChildren {
  eyebrow?: string;
  title: string;
  subtitle: string;
  footer?: string;
  variant?: 'default' | 'login';
}

export function AuthScreen({
  children,
  footer,
  subtitle,
  title,
  variant = 'default',
}: AuthScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-[#FFFFFF] dark:bg-[#0A0A0A]">
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-7 py-10">
          <View
            style={[
              { alignSelf: 'flex-start', maxWidth: 380, width: '100%' },
              { direction: 'ltr' } as any,
            ]}
          >
            {/* ── Monolith Brand Mark ── */}
            <Text
              className="font-sans text-xs font-bold text-[#111111] dark:text-[#F5F5F5]"
              style={{ letterSpacing: 6 }}
            >
              G A R A J I .
            </Text>

            {/* ── Giant Asymmetric Headline ── */}
            <View className="mt-16">
              <Text className="font-sans text-right text-5xl font-black leading-tight text-[#111111] dark:text-[#F5F5F5]">
                {title}
              </Text>
              <Text className="font-sans mt-4 text-right text-base leading-7 text-[#8A8A8A] dark:text-[#A0A0A0]">
                {subtitle}
              </Text>
            </View>

            {/* ── Form Content ── */}
            <View className="mt-12">{children}</View>

            {/* ── Footer Trust Text ── */}
            {footer ? (
              <Text className="font-sans mt-10 text-right text-xs leading-5 text-[#C0C0C0] dark:text-[#555555]">
                {footer}
              </Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─────────────────────── Auth Notice ─────────────────────── */

interface AuthNoticeProps {
  message?: string | null;
  tone?: 'success' | 'error' | 'info';
}

const noticeStyles = {
  success: {
    container: 'border-[#111111] bg-[#F3F4F6] dark:border-[#E0E0E0] dark:bg-[#1F1F1F]',
    text: 'text-[#111111] dark:text-[#F5F5F5]',
  },
  error: {
    container: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/40',
    text: 'text-red-700 dark:text-red-300',
  },
  info: {
    container: 'border-[#E5E5E5] bg-[#F3F4F6] dark:border-[#2A2A2A] dark:bg-[#1F1F1F]',
    text: 'text-[#111111] dark:text-[#F5F5F5]',
  },
};

export function AuthNotice({ message, tone = 'info' }: AuthNoticeProps) {
  if (!message) {
    return null;
  }

  const styles = noticeStyles[tone];

  return (
    <View className={`border-b px-1 py-3 ${styles.container}`}>
      <Text className={`font-sans text-right text-sm font-medium leading-5 ${styles.text}`}>{message}</Text>
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
      accessibilityLabel={visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
      accessibilityRole="button"
      className="px-2 py-1 active:opacity-70"
      onPress={onPress}
    >
      <Text className="font-sans text-xs font-semibold text-[#111111] dark:text-[#E0E0E0]">
        {visible ? 'إخفاء' : 'إظهار'}
      </Text>
    </Pressable>
  );
}

/* ─────────────────────── Auth Text Button (Kinetic Link) ─────────────────────── */

interface AuthTextButtonProps {
  children: string;
  onPress: () => void;
}

export function AuthTextButton({ children, onPress }: AuthTextButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className="py-1 active:opacity-60"
      onPress={onPress}
    >
      <Text
        className="font-sans text-sm font-semibold text-[#8A8A8A] dark:text-[#A0A0A0]"
        style={{ textDecorationLine: 'underline' }}
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
    <View className="gap-2">
      <Text className="font-sans text-right text-sm font-semibold text-[#111111] dark:text-[#F5F5F5]">نوع الحساب</Text>
      <View className="flex-row-reverse gap-3">
        <RoleOption
          description="حجوزات ومتابعة مركبات"
          label="عميل"
          onPress={() => onChange('customer')}
          selected={value === 'customer'}
        />
        <RoleOption
          description="إدارة الطلبات والفروع"
          label="تاجر"
          onPress={() => onChange('merchant')}
          selected={value === 'merchant'}
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

function RoleOption({ description, label, onPress, selected }: RoleOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      className={`min-h-[88px] flex-1 justify-between rounded-md border p-4 active:opacity-80 ${
        selected
          ? 'border-[#111111] bg-[#111111] dark:border-[#E0E0E0] dark:bg-[#E0E0E0]'
          : 'border-[#E5E5E5] bg-white dark:border-[#2A2A2A] dark:bg-[#141414]'
      }`}
      onPress={onPress}
    >
      <Text
        className={`font-sans text-right text-base font-bold ${
          selected ? 'text-white dark:text-[#111111]' : 'text-[#111111] dark:text-[#F5F5F5]'
        }`}
      >
        {label}
      </Text>
      <Text
        className={`font-sans mt-2 text-right text-xs leading-5 ${
          selected ? 'text-white/60 dark:text-[#111111]/60' : 'text-[#8A8A8A] dark:text-[#A0A0A0]'
        }`}
      >
        {description}
      </Text>
    </Pressable>
  );
}
