import { zodResolver } from '@hookform/resolvers/zod';
import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import { requestPasswordReset } from '@/features/auth/services/supabaseAuthService';
import { AuthNotice, AuthScreen, AuthTextButton } from '@/features/auth/components/AuthScreen';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('أدخل بريداً إلكترونياً صحيحاً.'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
    <AuthScreen
      eyebrow="استعادة الحساب"
      footer="بعد فتح الرابط من البريد، اختر كلمة مرور جديدة ثم عد إلى تسجيل الدخول."
      subtitle="أدخل بريد الحساب وسنرسل رابطاً آمناً لإعادة التعيين."
      title="إعادة تعيين كلمة المرور"
    >
      <View className="gap-4">
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

        <AuthNotice message={successMessage} tone="success" />
        <AuthNotice message={errorMessage} tone="error" />

        <AppButton loading={isSubmitting} onPress={() => void onSubmit()}>
          إرسال رابط إعادة التعيين
        </AppButton>
        <View className="items-center">
          <AuthTextButton onPress={() => router.replace('/(auth)/login' as Href)}>
            العودة لتسجيل الدخول
          </AuthTextButton>
        </View>
      </View>
    </AuthScreen>
  );
}
