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
import { AuthNotice } from '@/features/auth/components/AuthScreen';

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
      <View className="bg-background flex-1 flex-col items-center justify-center px-margin-mobile">
        {/* Container */}
        <View className="w-full max-w-md flex-col gap-stack-lg">
          
          {/* Brand Mark */}
          <View className="flex-col items-center justify-center gap-stack-sm mt-stack-lg">
            <View className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
              <Text className="text-on-primary font-display-lg text-[32px] leading-[40px] font-bold">ك</Text>
            </View>
            <Text className="text-on-surface font-title-md text-[20px] leading-[28px] font-bold">كراجي</Text>
          </View>

          {/* Page Title Section */}
          <View className="flex-col gap-stack-sm text-right">
            <Text className="text-on-surface font-display-lg-mobile text-[28px] leading-[36px] font-extrabold tracking-tight text-right">إعادة تعيين كلمة المرور</Text>
            <Text className="text-tertiary-container font-body-md text-[16px] leading-[24px] text-right">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</Text>
          </View>

          {/* Form Area (Card) */}
          <View className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] w-full flex-col gap-stack-md">
            
            <Controller
              control={control}
              name="email"
              render={({ field: { onBlur, onChange, value } }) => (
                <View className="flex-col gap-2">
                  <Text className="text-on-surface font-label-sm text-[13px] leading-[18px] text-right block font-bold">البريد الإلكتروني</Text>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="email"
                    inputMode="email"
                    keyboardType="email-address"
                    className={`w-full h-12 rounded-[14px] px-4 font-body-md text-[16px] leading-[24px] text-on-surface text-right ${
                      errors.email ? 'border border-error' :
                      emailFocused ? 'bg-surface-container-lowest border border-primary' : 'bg-surface-container-low border-none'
                    }`}
                    onBlur={() => {
                      setEmailFocused(false);
                      onBlur();
                    }}
                    onFocus={() => setEmailFocused(true)}
                    onChangeText={onChange}
                    placeholder="example@email.com"
                    placeholderTextColor="#bcc9c6"
                    style={{ fontFamily: 'Tajawal_400Regular' }}
                    value={value}
                  />
                  {errors.email?.message ? (
                    <Text className="font-label-sm text-[13px] leading-[18px] text-error text-right">{errors.email.message}</Text>
                  ) : null}
                </View>
              )}
            />

            <View className="mt-2">
              <AuthNotice message={successMessage} tone="success" />
              <AuthNotice message={errorMessage} tone="error" />
            </View>

            {/* Action Button */}
            <Pressable
              disabled={isSubmitting}
              onPress={() => void onSubmit()}
              className={`w-full h-12 bg-primary rounded-[14px] flex items-center justify-center mt-stack-sm active:scale-95 shadow-[0px_4px_20px_rgba(0,104,95,0.2)] ${isSubmitting ? 'opacity-70' : ''}`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-on-primary font-button-text text-[16px] leading-[16px] font-bold">إرسال رابط إعادة التعيين</Text>
              )}
            </Pressable>

          </View>

          {/* Footer Link */}
          <View className="flex-row items-center justify-center mt-stack-md pb-stack-lg">
            <Pressable onPress={() => router.replace('/login' as Href)} className="active:opacity-80">
              <Text className="text-primary font-button-text text-[16px] leading-[16px] font-bold">العودة لتسجيل الدخول</Text>
            </Pressable>
          </View>

        </View>
      </View>
    </AuthPublicGate>
  );
}
