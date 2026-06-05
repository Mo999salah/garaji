import { zodResolver } from '@hookform/resolvers/zod';
import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { z } from 'zod';

import { AppText as Text } from '@/shared/components/AppText';
import {
  AuthNotice,
  AuthScreen,
  AuthTextButton,
  PasswordToggle,
} from '@/features/auth/components/AuthScreen';
import { getHomePathForRole, useAuthStore } from '@/features/auth/store/useAuthStore';

const loginSchema = z.object({
  email: z.string().trim().email('أدخل بريداً إلكترونياً صحيحاً.'),
  password: z.string().min(1, 'أدخل كلمة المرور.'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
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
      footer="تتم حماية الجلسة وبيانات الحساب عبر Supabase وسياسات الوصول."
      subtitle="ادخل إلى جراجك الرقمي وتابع مواعيد الصيانة وطلبات الموقع من مكان واحد."
      title={'أهلاً بك.\nفي كراجي.'}
      variant="login"
    >
      <View className="gap-6">
        {/* ── Email Architectural Line ── */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onBlur, onChange, value } }) => (
            <View className="gap-1.5">
              <Text className="font-sans text-right text-xs font-semibold text-[#8A8A8A] dark:text-[#A0A0A0]">
                البريد الإلكتروني
              </Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                inputMode="email"
                keyboardType="email-address"
                className={`font-sans min-h-12 border-b text-base text-[#111111] dark:text-[#F5F5F5] ${
                  errors.email
                    ? 'border-red-400'
                    : emailFocused
                      ? 'border-[#111111] dark:border-[#E0E0E0]'
                      : 'border-black/10 dark:border-white/10'
                }`}
                onBlur={(e) => {
                  setEmailFocused(false);
                  onBlur();
                }}
                onFocus={() => setEmailFocused(true)}
                onChangeText={onChange}
                placeholder="name@example.com"
                placeholderTextColor="#C0C0C0"
                style={{ fontFamily: 'Tajawal_400Regular' }}
                textAlign="right"
                value={value}
              />
              {errors.email?.message ? (
                <Text className="font-sans text-right text-xs text-red-500">{errors.email.message}</Text>
              ) : null}
            </View>
          )}
        />

        {/* ── Password Architectural Line ── */}
        <Controller
          control={control}
          name="password"
          render={({ field: { onBlur, onChange, value } }) => (
            <View className="gap-1.5">
              <Text className="font-sans text-right text-xs font-semibold text-[#8A8A8A] dark:text-[#A0A0A0]">
                كلمة المرور
              </Text>
              <View className="relative">
                <TextInput
                  autoCapitalize="none"
                  autoComplete="password"
                  secureTextEntry={!passwordVisible}
                  className={`font-sans min-h-12 border-b pl-20 text-base text-[#111111] dark:text-[#F5F5F5] ${
                    errors.password
                      ? 'border-red-400'
                      : passwordFocused
                        ? 'border-[#111111] dark:border-[#E0E0E0]'
                        : 'border-black/10 dark:border-white/10'
                  }`}
                  onBlur={() => {
                    setPasswordFocused(false);
                    onBlur();
                  }}
                  onFocus={() => setPasswordFocused(true)}
                  onChangeText={onChange}
                  placeholderTextColor="#C0C0C0"
                  style={{ fontFamily: 'Tajawal_400Regular' }}
                  textAlign="right"
                  value={value}
                />
                <View className="absolute bottom-0 left-1 top-0 justify-center">
                  <PasswordToggle
                    onPress={() => setPasswordVisible((current) => !current)}
                    visible={passwordVisible}
                  />
                </View>
              </View>
              {errors.password?.message ? (
                <Text className="font-sans text-right text-xs text-red-500">{errors.password.message}</Text>
              ) : null}
            </View>
          )}
        />

        <AuthNotice message={infoMessage} tone="success" />
        <AuthNotice message={errorMessage} tone="error" />

        {/* ── Forgot Password Link ── */}
        <View className="items-end">
          <AuthTextButton onPress={() => router.push('/(auth)/forgot-password' as Href)}>
            نسيت كلمة المرور؟
          </AuthTextButton>
        </View>

        {/* ── Monochrome Block CTA ── */}
        <Pressable
          accessibilityLabel="تسجيل الدخول"
          accessibilityRole="button"
          className="mt-2 h-14 w-full items-center justify-center rounded-md bg-[#111111] active:opacity-90 dark:bg-[#E0E0E0]"
          disabled={isSubmitting}
          onPress={() => void onSubmit()}
          style={isSubmitting ? { opacity: 0.5 } : undefined}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-sans text-base font-bold text-white dark:text-[#111111]">
              تسجيل الدخول
            </Text>
          )}
        </Pressable>

        {/* ── Kinetic Staggered Link ── */}
        <View className="mt-4 flex-row-reverse items-center justify-center gap-2">
          <Text className="font-sans text-sm text-[#C0C0C0] dark:text-[#555555]">ليس لديك حساب؟</Text>
          <AuthTextButton onPress={() => router.push('/(auth)/signup' as Href)}>
            إنشاء حساب
          </AuthTextButton>
        </View>
      </View>
    </AuthScreen>
  );
}
