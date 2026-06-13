import { zodResolver } from '@hookform/resolvers/zod';
import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
 KeyboardAvoidingView,
 Platform,
 SafeAreaView,
 ScrollView,
 View,
} from 'react-native';
import { z } from 'zod';

import { AppText as Text } from '@/shared/components/AppText';
import { AppInput } from '@/shared/components/AppInput';
import { AppButton } from '@/shared/components/AppButton';
import { AnimatedPressable } from '@/shared/components/AnimatedPressable';
import { requestPasswordReset } from '@/features/auth/services/supabaseAuthService';
import { AuthPublicGate } from '@/features/auth/components/AuthPublicGate';
import { AuthNotice } from '@/features/auth/components/AuthScreen';

const forgotPasswordSchema = z.object({
 email: z.string().trim().email('أدخل بريداً إلكترونياً صحيحاً.')});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
 const [errorMessage, setErrorMessage] = useState<string | null>(null);
 const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
 const {
 control,
 handleSubmit,
 formState: { errors, isSubmitting }} = useForm<ForgotPasswordForm>({
 resolver: zodResolver(forgotPasswordSchema),
 defaultValues: { email: '' }});

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
  <SafeAreaView className="flex-1 bg-background">
  <KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  className="flex-1"
  >
  <ScrollView
  className="flex-1"
  contentContainerClassName="grow justify-center px-margin-mobile"
  keyboardShouldPersistTaps="handled"
  showsVerticalScrollIndicator={false}
  >
  {/* Container */}
  <View className="w-full max-w-md self-center flex-col gap-stack-lg py-stack-lg">
  
  {/* Brand Mark */}
  <View className="flex-col items-center justify-center gap-stack-sm">
  <View className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-soft">
  <Text className="text-on-primary font-display-lg text-display-lg font-bold" accessibilityLabel="شعار كراجي">ك</Text>
  </View>
  <Text className="text-on-surface font-title-md text-title-md font-bold">كراجي</Text>
  </View>

  {/* Page Title Section */}
  <View className="flex-col gap-stack-sm text-right">
  <Text className="text-on-surface font-display-lg-mobile text-display-lg-mobile font-extrabold tracking-tight text-right">إعادة تعيين كلمة المرور</Text>
  <Text className="text-secondary font-body-md text-body-md text-right">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</Text>
  </View>

  {/* Form Area (Card) */}
  <View className="bg-surface-container-lowest rounded-2xl p-6 shadow-soft w-full flex-col gap-stack-md">
  
  <Controller
  control={control}
  name="email"
  render={({ field: { onBlur, onChange, value } }) => (
             <AppInput
               label="البريد الإلكتروني"
               placeholder="example@email.com"
               keyboardType="email-address"
               autoComplete="email"
               autoCapitalize="none"
               inputMode="email"
               value={value}
               onChangeText={onChange}
               onBlur={onBlur}
               error={errors.email?.message}
             />
  )}
  />

  <View className="mt-2">
  <AuthNotice message={successMessage} tone="success" />
  <AuthNotice message={errorMessage} tone="error" />
           <View className="mt-stack-sm">
             <AppButton
               label="إرسال رابط إعادة التعيين"
               onPress={() => void onSubmit()}
               disabled={isSubmitting}
               loading={isSubmitting}
             />
           </View>
  </View>

  </View>

  {/* Footer Link */}
  <View className="flex-row items-center justify-center mt-stack-md pb-stack-lg">
  <AnimatedPressable
  accessibilityLabel="العودة لتسجيل الدخول"
  accessibilityRole="link"
  accessibilityHint="الانتقال إلى شاشة تسجيل الدخول"
  className="min-h-11 justify-center px-1"
  onPress={() => router.replace('/login' as Href)}
  >
  <Text className="text-primary font-button-text text-button-text font-bold">العودة لتسجيل الدخول</Text>
  </AnimatedPressable>
  </View>

  </View>
  </ScrollView>
  </KeyboardAvoidingView>
  </SafeAreaView>
  </AuthPublicGate>
  );
}
