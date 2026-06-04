import type { PropsWithChildren } from 'react';
import { Pressable, View } from 'react-native';

import { AppCard } from '@/shared/components/AppCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import type { UserRole } from '@/shared/types/auth';

import { AppText as Text } from '@/shared/components/AppText';
interface AuthScreenProps extends PropsWithChildren {
  eyebrow: string;
  title: string;
  subtitle: string;
  footer?: string;
  variant?: 'default' | 'login';
}

export function AuthScreen({
  children,
  eyebrow,
  footer,
  subtitle,
  title,
  variant = 'default',
}: AuthScreenProps) {
  if (variant === 'login') {
    return (
      <ScreenContainer>
        <View className="min-h-full justify-center py-6">
          <View style={[{ alignSelf: 'flex-start', maxWidth: 350, width: '100%' }, { direction: 'ltr' } as any]}>
            <View className="overflow-hidden rounded-lg border border-brand-500/15 bg-card shadow-md shadow-brand-700/10 dark:border-dark-line dark:bg-dark-card dark:shadow-none">
              <View className="bg-brand-500 p-5 dark:bg-dark-card">
                <View className="flex-row items-start justify-between">
                  <View className="h-12 w-12 items-center justify-center rounded-lg bg-white/90 dark:bg-dark-brand-500">
                    <Text className="font-sans text-lg font-black text-brand-600 dark:text-brand-700">ج</Text>
                  </View>
                  <View className="rounded-lg border border-white/20 bg-white/15 px-3 py-1 dark:border-dark-gold-500/30 dark:bg-dark-gold-50">
                    <Text className="font-sans text-xs font-bold text-white dark:text-dark-gold-500">{eyebrow}</Text>
                  </View>
                </View>

                <View className="mt-7 items-end">
                  <Text className="font-sans text-right text-4xl font-black leading-tight text-white dark:text-dark-ink">{title}</Text>
                  <Text className="font-sans mt-3 max-w-[280px] text-right text-base leading-7 text-white/85 dark:text-dark-muted">
                    {subtitle}
                  </Text>
                </View>

                <View className="mt-6 flex-row-reverse gap-2">
                  <TrustPill label="طلب سريع" inverse />
                  <TrustPill label="حساب آمن" inverse />
                  <TrustPill label="متابعة مباشرة" inverse />
                </View>
              </View>

              <View className="gap-5 p-5">
                <View className="flex-row-reverse items-center justify-between rounded-lg border border-line bg-surface-soft px-4 py-3 dark:border-dark-line dark:bg-dark-surface">
                  <AuthStep number="01" label="دخول" />
                  <View className="h-px flex-1 bg-line dark:bg-dark-line" />
                  <AuthStep number="02" label="اختيار الخدمة" />
                  <View className="h-px flex-1 bg-line dark:bg-dark-line" />
                  <AuthStep number="03" label="متابعة الطلب" />
                </View>

                {children}
              </View>
            </View>

            {footer ? (
              <Text className="font-sans mt-5 text-center text-xs leading-5 text-muted dark:text-dark-muted">{footer}</Text>
            ) : null}
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="min-h-full justify-center py-8">
        <View style={[{ alignSelf: 'flex-start', maxWidth: 320, width: '100%' }, { direction: 'ltr' } as any]}>
          <View className="mb-5 overflow-hidden rounded-lg border border-line bg-card p-5 shadow-md shadow-brand-700/10 dark:border-dark-line dark:bg-dark-card dark:shadow-none">
            <View className="relative">
              <View className="mb-5 flex-row items-center justify-between">
                <View className="h-12 w-12 items-center justify-center rounded-lg bg-brand-500 dark:bg-dark-brand-500">
                  <Text className="font-sans text-lg font-black text-white dark:text-brand-700">ج</Text>
                </View>
                <View className="rounded-lg border border-gold-500/20 bg-gold-50 px-3 py-1 dark:border-dark-gold-500/30 dark:bg-dark-gold-50">
                  <Text className="font-sans text-xs font-semibold text-gold-500 dark:text-dark-gold-500">{eyebrow}</Text>
                </View>
              </View>

              <Text className="font-sans text-right text-3xl font-extrabold leading-tight text-ink dark:text-dark-ink">{title}</Text>
              <Text className="font-sans mt-3 text-right text-base leading-7 text-muted dark:text-dark-muted">{subtitle}</Text>

              <View className="mt-5 flex-row flex-wrap justify-end gap-2">
                <TrustPill label="جلسة آمنة" />
                <TrustPill label="تجربة عربية" />
                <TrustPill label="طلبات واضحة" />
              </View>
            </View>
          </View>

          <AppCard className="gap-4 p-5" tone="elevated">{children}</AppCard>

          {footer ? (
            <Text className="font-sans mt-5 text-center text-xs leading-5 text-muted dark:text-dark-muted">{footer}</Text>
          ) : null}
        </View>
      </View>
    </ScreenContainer>
  );
}

function TrustPill({ inverse = false, label }: { inverse?: boolean; label: string }) {
  if (inverse) {
    return (
      <View className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 dark:border-dark-line dark:bg-dark-surface">
        <Text className="font-sans text-xs font-semibold text-white dark:text-dark-muted">{label}</Text>
      </View>
    );
  }

  return (
    <View className="rounded-lg border border-line bg-surface-soft px-3 py-1.5 dark:border-dark-line dark:bg-dark-surface">
      <Text className="font-sans text-xs font-semibold text-muted dark:text-dark-muted">{label}</Text>
    </View>
  );
}

function AuthStep({ label, number }: { label: string; number: string }) {
  return (
    <View className="items-center gap-1">
      <Text className="font-sans text-[10px] font-black text-brand-500 dark:text-dark-brand-500">{number}</Text>
      <Text className="font-sans text-[10px] font-bold text-muted dark:text-dark-muted">{label}</Text>
    </View>
  );
}

interface AuthNoticeProps {
  message?: string | null;
  tone?: 'success' | 'error' | 'info';
}

const noticeStyles = {
  success: {
    container: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  error: {
    container: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/40',
    text: 'text-red-700 dark:text-red-300',
  },
  info: {
    container: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
  },
};

export function AuthNotice({ message, tone = 'info' }: AuthNoticeProps) {
  if (!message) {
    return null;
  }

  const styles = noticeStyles[tone];

  return (
    <View className={`rounded-lg border px-4 py-3 ${styles.container}`}>
      <Text className={`font-sans text-right text-sm font-medium leading-5 ${styles.text}`}>{message}</Text>
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
      className="rounded-lg px-2 py-1 active:opacity-70"
      onPress={onPress}
    >
      <Text className="font-sans text-xs font-semibold text-brand-500 dark:text-dark-brand-500">{visible ? 'إخفاء' : 'إظهار'}</Text>
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
      className="rounded-lg px-2 py-1 active:opacity-70"
      onPress={onPress}
    >
      <Text className="font-sans text-sm font-semibold text-brand-500 dark:text-dark-brand-500">{children}</Text>
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
      <Text className="font-sans text-right text-sm font-semibold text-ink dark:text-dark-ink">نوع الحساب</Text>
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
      className={`min-h-[88px] flex-1 justify-between rounded-lg border p-4 active:opacity-80 ${
        selected
          ? 'border-brand-500 bg-brand-50 dark:border-dark-brand-500 dark:bg-dark-brand-50'
          : 'border-line bg-card dark:border-dark-line dark:bg-dark-card'
      }`}
      onPress={onPress}
    >
      <Text className={`font-sans text-right text-base font-bold ${selected ? 'text-brand-500 dark:text-dark-brand-500' : 'text-ink dark:text-dark-ink'}`}>
        {label}
      </Text>
      <Text className="font-sans mt-2 text-right text-xs leading-5 text-muted dark:text-dark-muted">{description}</Text>
    </Pressable>
  );
}
