import { zodResolver } from '@hookform/resolvers/zod';
import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Text, View } from 'react-native';
import { z } from 'zod';

import {
  AuthNotice,
  AuthScreen,
  AuthTextButton,
  PasswordToggle,
  RoleSelector,
} from '@/features/auth/components/AuthScreen';
import { getHomePathForRole, useAuthStore } from '@/features/auth/store/useAuthStore';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';
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
      eyebrow="حساب جديد"
      footer="يتم إنشاء الملف الشخصي تلقائياً بعد اكتمال التسجيل في Supabase."
      subtitle="اختر نوع الحساب، ثم أكمل بياناتك الأساسية."
      title="ابدأ مع قِطع"
    >
      <View className="gap-4">
        <RoleSelector onChange={setRole} value={selectedRole} />

        <Controller
          control={control}
          name="fullName"
          render={({ field: { onBlur, onChange, value } }) => (
            <AppInput
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
            <AppInput
              autoComplete="tel"
              error={errors.phone?.message}
              inputMode="tel"
              keyboardType="phone-pad"
              label="رقم الجوال"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="+966 5X XXX XXXX"
              textAlign="right"
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onBlur, onChange, value } }) => (
            <AppInput
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
            <AppInput
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
          <View className="gap-4 border-t border-line pt-4">
            <Controller
              control={control}
              name="merchantName"
              render={({ field: { onBlur, onChange, value } }) => (
                <AppInput
                  error={errors.merchantName?.message}
                  label="اسم المنشأة"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  textAlign="right"
                  value={value}
                />
              )}
            />
            <Controller
              control={control}
              name="region"
              render={({ field: { onBlur, onChange, value } }) => (
                <AppInput
                  error={errors.region?.message}
                  label="المنطقة"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="مثال: الرياض"
                  textAlign="right"
                  value={value}
                />
              )}
            />
          </View>
        ) : null}

        <AuthNotice message={errorMessage} tone="error" />

        <AppButton loading={isSubmitting} onPress={() => void onSubmit()}>
          إنشاء الحساب
        </AppButton>

        <View className="flex-row items-center justify-center gap-2">
          <Text className="text-sm text-muted">لديك حساب؟</Text>
          <AuthTextButton onPress={() => router.replace('/(auth)/login' as Href)}>
            تسجيل الدخول
          </AuthTextButton>
        </View>
      </View>
    </AuthScreen>
  );
}

function PasswordMeter({ score }: { score: number }) {
  const label = score >= 4 ? 'قوية' : score >= 2 ? 'متوسطة' : 'ضعيفة';

  return (
    <View className="gap-2">
      <View className="flex-row gap-2">
        {[1, 2, 3, 4].map((step) => (
          <View
            className={`h-1.5 flex-1 rounded-full ${step <= score ? 'bg-brand-600' : 'bg-line'}`}
            key={step}
          />
        ))}
      </View>
      <Text className="text-right text-xs font-medium text-muted">قوة كلمة المرور: {label}</Text>
    </View>
  );
}
