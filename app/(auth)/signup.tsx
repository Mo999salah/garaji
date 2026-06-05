import { zodResolver } from '@hookform/resolvers/zod';
import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { z } from 'zod';

import { AppText as Text } from '@/shared/components/AppText';
import {
  AuthNotice,
  AuthScreen,
  AuthTextButton,
  PasswordToggle,
  RoleSelector,
} from '@/features/auth/components/AuthScreen';
import { getHomePathForRole, useAuthStore } from '@/features/auth/store/useAuthStore';
import type { UserRole } from '@/shared/types/auth';

const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, 'أدخل الاسم الكامل.'),
    phone: z.string().trim().optional(),
    email: z.string().trim().email('أدخل بريداً إلكترونياً صحيحاً.'),
    password: z.string().min(8, 'استخدم 8 أحرف على الأقل.'),
    role: z.enum(['customer', 'merchant']),
    merchantName: z.string().trim().optional(),
    region: z.string().trim().optional(),
  })
  .superRefine((value, context) => {
    if (value.role === 'merchant' && !value.merchantName) {
      context.addIssue({
        code: 'custom',
        message: 'أدخل اسم المنشأة.',
        path: ['merchantName'],
      });
    }
  });

type SignupForm = z.infer<typeof signupSchema>;

function getPasswordScore(password: string) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return score;
}

/* ─────────────── Architectural Input Line ─────────────── */

interface ArchInputProps {
  label: string;
  error?: string;
  trailing?: React.ReactNode;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  inputMode?: TextInputProps['inputMode'];
  keyboardType?: TextInputProps['keyboardType'];
  placeholder?: string;
  secureTextEntry?: boolean;
  textAlign?: 'left' | 'right' | 'center';
  value: string;
  onBlur: () => void;
  onChangeText: (text: string) => void;
}

function ArchInput({
  label,
  error,
  trailing,
  value,
  onBlur,
  onChangeText,
  ...props
}: ArchInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="gap-1.5">
      <Text className="font-sans text-right text-xs font-semibold text-[#8A8A8A] dark:text-[#A0A0A0]">
        {label}
      </Text>
      <View className="relative">
        <TextInput
          className={`font-sans min-h-12 border-b text-base text-[#111111] dark:text-[#F5F5F5] ${
            trailing ? 'pl-20' : ''
          } ${
            error
              ? 'border-red-400'
              : focused
                ? 'border-[#111111] dark:border-[#E0E0E0]'
                : 'border-black/10 dark:border-white/10'
          }`}
          onBlur={() => {
            setFocused(false);
            onBlur();
          }}
          onFocus={() => setFocused(true)}
          onChangeText={onChangeText}
          placeholderTextColor="#C0C0C0"
          style={{ fontFamily: 'Tajawal_400Regular' }}
          textAlign={props.textAlign || 'right'}
          value={value}
          {...props}
        />
        {trailing ? (
          <View className="absolute bottom-0 left-1 top-0 justify-center">{trailing}</View>
        ) : null}
      </View>
      {error ? (
        <Text className="font-sans text-right text-xs text-red-500">{error}</Text>
      ) : null}
    </View>
  );
}

/* ─────────────── Signup Screen ─────────────── */

export default function SignupScreen() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const signUp = useAuthStore((state) => state.signUp);
  const errorMessage = useAuthStore((state) => state.errorMessage);
  const clearError = useAuthStore((state) => state.clearError);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      password: '',
      role: 'customer',
      merchantName: '',
      region: '',
    },
  });
  const selectedRole = useWatch({ control, name: 'role' });
  const password = useWatch({ control, name: 'password' });
  const passwordScore = useMemo(() => getPasswordScore(password ?? ''), [password]);

  const setRole = (role: UserRole) => {
    setValue('role', role, { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    clearError();
    try {
      const result = await signUp(values);

      if (result.user) {
        router.replace(getHomePathForRole(result.user.role) as Href);
        return;
      }

      useAuthStore.getState().setInfoMessage(result.message);
      router.replace('/(auth)/login');
    } catch {
      // The auth store exposes a safe user-facing message.
    }
  });

  return (
    <AuthScreen
      footer="يتم إنشاء الملف الشخصي تلقائياً بعد اكتمال التسجيل في Supabase."
      subtitle="اختر نوع الحساب، ثم أكمل بياناتك الأساسية."
      title={'أنشئ\nحسابك.'}
    >
      <View className="gap-5">
        <RoleSelector onChange={setRole} value={selectedRole} />

        <Controller
          control={control}
          name="fullName"
          render={({ field: { onBlur, onChange, value } }) => (
            <ArchInput
              autoComplete="name"
              error={errors.fullName?.message}
              label="الاسم الكامل"
              onBlur={onBlur}
              onChangeText={onChange}
              textAlign="right"
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onBlur, onChange, value } }) => (
            <ArchInput
              autoComplete="tel"
              error={errors.phone?.message}
              inputMode="tel"
              keyboardType="phone-pad"
              label="رقم الجوال"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="+966 5X XXX XXXX"
              textAlign="right"
              value={value ?? ''}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onBlur, onChange, value } }) => (
            <ArchInput
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email?.message}
              inputMode="email"
              keyboardType="email-address"
              label="البريد الإلكتروني"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="name@example.com"
              textAlign="right"
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onBlur, onChange, value } }) => (
            <ArchInput
              autoCapitalize="none"
              autoComplete="new-password"
              error={errors.password?.message}
              label="كلمة المرور"
              onBlur={onBlur}
              onChangeText={onChange}
              secureTextEntry={!passwordVisible}
              textAlign="right"
              trailing={
                <PasswordToggle
                  onPress={() => setPasswordVisible((current) => !current)}
                  visible={passwordVisible}
                />
              }
              value={value}
            />
          )}
        />

        <PasswordMeter score={passwordScore} />

        {selectedRole === 'merchant' ? (
          <View className="gap-5 border-t border-black/5 pt-5 dark:border-white/5">
            <Controller
              control={control}
              name="merchantName"
              render={({ field: { onBlur, onChange, value } }) => (
                <ArchInput
                  error={errors.merchantName?.message}
                  label="اسم المنشأة"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  textAlign="right"
                  value={value ?? ''}
                />
              )}
            />
            <Controller
              control={control}
              name="region"
              render={({ field: { onBlur, onChange, value } }) => (
                <ArchInput
                  error={errors.region?.message}
                  label="المنطقة"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="مثال: الرياض"
                  textAlign="right"
                  value={value ?? ''}
                />
              )}
            />
          </View>
        ) : null}

        <AuthNotice message={errorMessage} tone="error" />

        {/* ── Monochrome Block CTA ── */}
        <Pressable
          accessibilityLabel="إنشاء الحساب"
          accessibilityRole="button"
          className="mt-3 h-14 w-full items-center justify-center rounded-md bg-[#111111] active:opacity-90 dark:bg-[#E0E0E0]"
          disabled={isSubmitting}
          onPress={() => void onSubmit()}
          style={isSubmitting ? { opacity: 0.5 } : undefined}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-sans text-base font-bold text-white dark:text-[#111111]">
              إنشاء الحساب
            </Text>
          )}
        </Pressable>

        {/* ── Kinetic Staggered Link ── */}
        <View className="mt-2 flex-row items-center justify-center gap-2">
          <Text className="font-sans text-sm text-[#C0C0C0] dark:text-[#555555]">لديك حساب؟</Text>
          <AuthTextButton onPress={() => router.replace('/(auth)/login' as Href)}>
            تسجيل الدخول
          </AuthTextButton>
        </View>
      </View>
    </AuthScreen>
  );
}

/* ─────────────── Password Meter ─────────────── */

function PasswordMeter({ score }: { score: number }) {
  const label = score >= 4 ? 'قوية' : score >= 2 ? 'متوسطة' : 'ضعيفة';

  return (
    <View className="gap-2">
      <View className="flex-row gap-2">
        {[1, 2, 3, 4].map((step) => (
          <View
            className={`h-1 flex-1 ${step <= score ? 'bg-[#111111] dark:bg-[#E0E0E0]' : 'bg-[#E5E5E5] dark:bg-[#2A2A2A]'}`}
            key={step}
          />
        ))}
      </View>
      <Text className="font-sans text-right text-xs font-medium text-[#8A8A8A] dark:text-[#A0A0A0]">قوة كلمة المرور: {label}</Text>
    </View>
  );
}
