import type { PropsWithChildren } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AppCard } from '@/shared/components/AppCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import type { UserRole } from '@/shared/types/auth';

interface AuthScreenProps extends PropsWithChildren {
  eyebrow: string;
  title: string;
  subtitle: string;
  footer?: string;
}

export function AuthScreen({ children, eyebrow, footer, subtitle, title }: AuthScreenProps) {
  return (
    <ScreenContainer>
      <View className="min-h-full justify-center py-6">
        <View style={[{ alignSelf: 'flex-start', maxWidth: 350, width: '100%' }, { direction: 'ltr' } as any]}>
          <View className="mb-6 overflow-hidden rounded-lg border border-line bg-white p-5 shadow-sm">
            <View className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-50" />
            <View className="absolute -bottom-10 left-8 h-20 w-20 rounded-full bg-[#EEF4FF]" />

            <View className="relative">
              <View className="mb-5 flex-row items-center justify-between">
                <View className="h-11 w-11 items-center justify-center rounded-lg bg-ink">
                  <Text className="text-lg font-bold text-white">ق</Text>
                </View>
                <View className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1">
                  <Text className="text-xs font-semibold text-brand-700">{eyebrow}</Text>
                </View>
              </View>

              <Text className="text-right text-4xl font-bold leading-tight text-ink">{title}</Text>
              <Text className="mt-3 text-right text-base leading-7 text-muted">{subtitle}</Text>

              <View className="mt-5 flex-row flex-wrap justify-end gap-2">
                <TrustPill label="حساب آمن" />
                <TrustPill label="حفظ الجلسة" />
                <TrustPill label="سياسات وصول" />
              </View>
            </View>
          </View>

          <AppCard className="gap-4 p-5">{children}</AppCard>

          {footer ? (
            <Text className="mt-5 text-center text-xs leading-5 text-muted">{footer}</Text>
          ) : null}
        </View>
      </View>
    </ScreenContainer>
  );
}

function TrustPill({ label }: { label: string }) {
  return (
    <View className="rounded-full border border-line bg-surface px-3 py-1.5">
      <Text className="text-xs font-semibold text-muted">{label}</Text>
    </View>
  );
}

interface AuthNoticeProps {
  message?: string | null;
  tone?: 'success' | 'error' | 'info';
}

const noticeStyles = {
  success: {
    container: 'border-brand-100 bg-brand-50',
    text: 'text-brand-700',
  },
  error: {
    container: 'border-red-100 bg-red-50',
    text: 'text-red-700',
  },
  info: {
    container: 'border-[#D7E4FF] bg-[#EEF4FF]',
    text: 'text-[#315EAD]',
  },
};

export function AuthNotice({ message, tone = 'info' }: AuthNoticeProps) {
  if (!message) {
    return null;
  }

  const styles = noticeStyles[tone];

  return (
    <View className={`rounded-lg border px-4 py-3 ${styles.container}`}>
      <Text className={`text-right text-sm font-medium leading-5 ${styles.text}`}>{message}</Text>
    </View>
  );
}

interface PasswordToggleProps {
  visible: boolean;
  onPress: () => void;
}

export function PasswordToggle({ onPress, visible }: PasswordToggleProps) {
  return (
    <Pressable
      accessibilityLabel={visible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
      accessibilityRole="button"
      className="rounded-full px-2 py-1 active:opacity-70"
      onPress={onPress}
    >
      <Text className="text-xs font-semibold text-brand-700">{visible ? 'إخفاء' : 'إظهار'}</Text>
    </Pressable>
  );
}

interface AuthTextButtonProps {
  children: string;
  onPress: () => void;
}

export function AuthTextButton({ children, onPress }: AuthTextButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className="rounded-full px-2 py-1 active:opacity-70"
      onPress={onPress}
    >
      <Text className="text-sm font-semibold text-brand-700">{children}</Text>
    </Pressable>
  );
}

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

export function RoleSelector({ onChange, value }: RoleSelectorProps) {
  return (
    <View className="gap-2">
      <Text className="text-right text-sm font-semibold text-ink">نوع الحساب</Text>
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
      className={`min-h-[88px] flex-1 justify-between rounded-lg border p-3 active:opacity-80 ${
        selected ? 'border-brand-600 bg-brand-50' : 'border-line bg-white'
      }`}
      onPress={onPress}
    >
      <Text className={`text-right text-base font-bold ${selected ? 'text-brand-700' : 'text-ink'}`}>
        {label}
      </Text>
      <Text className="mt-2 text-right text-xs leading-5 text-muted">{description}</Text>
    </Pressable>
  );
}
