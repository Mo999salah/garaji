import { zodResolver } from '@hookform/resolvers/zod';
import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { z } from 'zod';

import { AppText as Text } from '@/shared/components/AppText';
import { requestPasswordReset } from '@/features/auth/services/supabaseAuthService';
import { AuthPublicGate } from '@/features/auth/components/AuthPublicGate';
import { AuthNotice, AuthScreen, AuthTextButton } from '@/features/auth/components/AuthScreen';

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('أدخل بريداً إلكترونياً صحيحاً.'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await requestPasswordReset(values.email);
      setSuccessMessage('إذا كان البريد مسجلاً، ستصلك رسالة إعادة التعيين خلال لحظات.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'تعذّر إرسال رابط إعادة التعيين.');
    }
  });

  return (
    <AuthPublicGate>
    <AuthScreen
      footer="بعد فتح الرابط من البريد، اختر كلمة مرور جديدة ثم عد إلى تسجيل الدخول."
      subtitle="أدخل بريد الحساب وسنرسل رابطاً آمناً لإعادة التعيين."
      title={'إعادة\nتعيين.'}
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
                onBlur={() => {
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

        <AuthNotice message={successMessage} tone="success" />
        <AuthNotice message={errorMessage} tone="error" />

        {/* ── Monochrome Block CTA ── */}
        <Pressable
          accessibilityLabel="إرسال رابط إعادة التعيين"
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
              إرسال رابط إعادة التعيين
            </Text>
          )}
        </Pressable>

        {/* ── Kinetic Link ── */}
        <View className="mt-2 items-center">
          <AuthTextButton onPress={() => router.replace('/login' as Href)}>
            العودة لتسجيل الدخول
          </AuthTextButton>
        </View>
      </View>
    </AuthScreen>
    </AuthPublicGate>
  );
}
