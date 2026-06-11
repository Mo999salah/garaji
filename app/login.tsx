import { zodResolver } from '@hookform/resolvers/zod';
import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { z } from 'zod';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { AppText as Text } from '@/shared/components/AppText';
import { AuthPublicGate } from '@/features/auth/components/AuthPublicGate';
import { AuthNotice } from '@/features/auth/components/AuthScreen';
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
  const [rememberMe, setRememberMe] = useState(false);
  
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
    <AuthPublicGate>
      <View className="bg-background flex-1 flex-col items-center justify-center p-margin-mobile">
        {/* Main Container */}
        <View className="w-full max-w-md flex-col gap-stack-lg">
          
          {/* 1. BRAND MARK */}
          <View className="flex-col items-center text-center gap-stack-sm">
            <View className="w-24 h-24 rounded-3xl bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex items-center justify-center mb-2 overflow-hidden">
              <Image 
                source={require('../assets/images/logo.png')} 
                className="w-full h-full"
                contentFit="cover" 
              />
            </View>
          </View>
          
          {/* 2. PAGE TITLE */}
          <View className="flex-col gap-unit">
            <Text className="font-display-lg-mobile text-[28px] leading-[36px] text-on-surface text-right font-bold">تسجيل الدخول</Text>
            <Text className="font-body-md text-[16px] leading-[24px] text-secondary text-right">أدخل بياناتك للوصول إلى حسابك</Text>
          </View>

          {/* 3. LOGIN FORM */}
          <View className="bg-surface-container-lowest rounded-[20px] shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-6 flex-col gap-stack-md">
            
            {/* Email Field */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onBlur, onChange, value } }) => (
                <View className="flex-col gap-unit">
                  <Text className="font-label-sm text-[13px] leading-[18px] text-on-surface-variant font-bold pr-1 text-right">البريد الإلكتروني</Text>
                  <View className="relative justify-center">
                    <View className="absolute right-4 z-10">
                      <MaterialIcons name="mail-outline" size={20} color="#6d7a77" />
                    </View>
                    <TextInput
                      autoCapitalize="none"
                      autoComplete="email"
                      inputMode="email"
                      keyboardType="email-address"
                      className={`w-full h-12 rounded-xl pr-12 pl-4 font-body-md text-[16px] leading-[24px] text-on-surface text-right ${
                        errors.email ? 'border border-error' : 
                        emailFocused ? 'bg-surface-container-lowest border border-primary' : 'bg-surface-container-low border-none'
                      }`}
                      onBlur={(e) => {
                        setEmailFocused(false);
                        onBlur();
                      }}
                      onFocus={() => setEmailFocused(true)}
                      onChangeText={onChange}
                      placeholder="example@email.com"
                      placeholderTextColor="#bcc9c6"
                      value={value}
                      style={{ fontFamily: 'Tajawal_400Regular' }}
                    />
                  </View>
                  {errors.email?.message ? (
                    <Text className="font-label-sm text-[13px] leading-[18px] text-error text-right">{errors.email.message}</Text>
                  ) : null}
                </View>
              )}
            />

            {/* Password Field */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onBlur, onChange, value } }) => (
                <View className="flex-col gap-unit mt-4">
                  <Text className="font-label-sm text-[13px] leading-[18px] text-on-surface-variant font-bold pr-1 text-right">كلمة المرور</Text>
                  <View className="relative justify-center">
                    <View className="absolute right-4 z-10">
                      <MaterialIcons name="lock-outline" size={20} color="#6d7a77" />
                    </View>
                    <TextInput
                      autoCapitalize="none"
                      autoComplete="password"
                      secureTextEntry={!passwordVisible}
                      className={`w-full h-12 rounded-xl pr-12 pl-12 font-body-md text-[16px] leading-[24px] text-on-surface text-right ${
                        errors.password ? 'border border-error' :
                        passwordFocused ? 'bg-surface-container-lowest border border-primary' : 'bg-surface-container-low border-none'
                      }`}
                      onBlur={() => {
                        setPasswordFocused(false);
                        onBlur();
                      }}
                      onFocus={() => setPasswordFocused(true)}
                      onChangeText={onChange}
                      placeholder="••••••••"
                      placeholderTextColor="#bcc9c6"
                      value={value}
                      style={{ fontFamily: 'Tajawal_400Regular' }}
                    />
                    <Pressable 
                      className="absolute left-4 z-10 p-2"
                      onPress={() => setPasswordVisible(!passwordVisible)}
                    >
                      <MaterialIcons name={passwordVisible ? "visibility" : "visibility-off"} size={20} color="#6d7a77" />
                    </Pressable>
                  </View>
                  {errors.password?.message ? (
                    <Text className="font-label-sm text-[13px] leading-[18px] text-error text-right">{errors.password.message}</Text>
                  ) : null}
                </View>
              )}
            />

            <View className="mt-2">
              <AuthNotice message={infoMessage} tone="info" />
              <AuthNotice message={errorMessage} tone="error" />
            </View>

            {/* Utility Row */}
            <View className="flex-row-reverse justify-between items-center mt-2">
              <Pressable className="flex-row-reverse items-center gap-2" onPress={() => setRememberMe(!rememberMe)}>
                <View className={`w-5 h-5 rounded-[4px] border-[1.5px] items-center justify-center ${rememberMe ? 'bg-primary border-primary' : 'border-outline'}`}>
                  {rememberMe && <MaterialIcons name="check" size={16} color="#ffffff" />}
                </View>
                <Text className="font-label-sm text-[13px] leading-[18px] text-secondary">تذكرني</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/reset-password' as Href)}>
                <Text className="font-label-sm text-[13px] leading-[18px] text-primary font-bold">نسيت كلمة المرور؟</Text>
              </Pressable>
            </View>

            {/* 4. PRIMARY ACTION */}
            <Pressable
              disabled={isSubmitting}
              onPress={() => void onSubmit()}
              className={`w-full h-12 bg-primary rounded-[14px] shadow-[0px_4px_20px_rgba(0,104,95,0.2)] flex items-center justify-center mt-4 active:scale-95 ${isSubmitting ? 'opacity-70' : ''}`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-on-primary font-button-text text-[16px] leading-[16px] font-bold">تسجيل الدخول</Text>
              )}
            </Pressable>

          </View>

          {/* 5. FOOTER */}
          <View className="flex-row-reverse items-center justify-center gap-2 mt-4">
            <Text className="font-body-md text-[16px] leading-[24px] text-secondary">ليس لديك حساب؟</Text>
            <Pressable onPress={() => router.push('/register' as Href)}>
              <Text className="font-body-md text-[16px] leading-[24px] text-primary font-bold">إنشاء حساب جديد</Text>
            </Pressable>
          </View>

        </View>
      </View>
    </AuthPublicGate>
  );
}
