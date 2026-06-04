import { zodResolver } from '@hookform/resolvers/zod';
import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import { AppText as Text } from '@/shared/components/AppText';
import {
  AuthNotice,
  AuthScreen,
  AuthTextButton,
  PasswordToggle,
} from '@/features/auth/components/AuthScreen';
import { getHomePathForRole, useAuthStore } from '@/features/auth/store/useAuthStore';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';

const loginSchema = z.object({
  email: z.string().trim().email('أدخل بريداً إلكترونياً صحيحاً.'),
  password: z.string().min(1, 'أدخل كلمة المرور.'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const signIn = useAuthStore((state) => state.signIn);
  const errorMessage = useAuthStore((state) => state.errorMessage);
  const infoMessage = useAuthStore((state) => state.infoMessage);
  const clearError = useAuthStore((state) => state.clearError);
  const clearInfo = useAuthStore((state) => state.clearInfo);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    clearError();
    clearInfo();
    try {
      const user = await signIn(values);
      router.replace(getHomePathForRole(user.role) as Href);
    } catch {
      // The auth store exposes a safe user-facing message.
    }
  });

  return (
    <AuthScreen
      eyebrow="تسجيل الدخول"
      footer="تتم حماية الجلسة وبيانات الحساب عبر Supabase وسياسات الوصول."
      subtitle="ادخل إلى جراجك الرقمي وتابع مواعيد الصيانة وطلبات الموقع من مكان واحد."
      title="مرحباً بعودتك"
      variant="login"
    >
      <View className="gap-5">
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
              autoComplete="password"
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

        <AuthNotice message={infoMessage} tone="success" />
        <AuthNotice message={errorMessage} tone="error" />

        <View className="gap-3">
          <View className="items-end">
            <AuthTextButton onPress={() => router.push('/(auth)/forgot-password' as Href)}>
              نسيت كلمة المرور؟
            </AuthTextButton>
          </View>

          <AppButton
            loading={isSubmitting}
            onPress={() => void onSubmit()}
            className="min-h-14 border-gold-500 bg-gold-500 shadow-md shadow-gold-700/20 dark:border-gold-500 dark:bg-gold-500"
          >
            تسجيل الدخول
          </AppButton>
        </View>

        <View className="flex-row-reverse items-center justify-center gap-2 border-t border-line pt-4 dark:border-dark-line">
          <Text className="font-sans text-sm text-muted">ليس لديك حساب؟</Text>
          <AuthTextButton onPress={() => router.push('/(auth)/signup' as Href)}>
            إنشاء حساب
          </AuthTextButton>
        </View>
      </View>
    </AuthScreen>
  );
}
