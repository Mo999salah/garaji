import { zodResolver } from '@hookform/resolvers/zod';
import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, View, I18nManager } from 'react-native';
import { z } from 'zod';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { AppText as Text } from '@/shared/components/AppText';
import { AppInput } from '@/shared/components/AppInput';
import { AppButton } from '@/shared/components/AppButton';
import { AuthPublicGate } from '@/features/auth/components/AuthPublicGate';
import { AuthNotice } from '@/features/auth/components/AuthScreen';
import { getHomePathForRole, useAuthStore } from '@/features/auth/store/useAuthStore';

const loginSchema = z.object({
 email: z.string().trim().email('أدخل بريداً إلكترونياً صحيحاً.'),
 password: z.string().min(1, 'أدخل كلمة المرور.')});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
 const [passwordVisible, setPasswordVisible] = useState(false);
   const [rememberMe, setRememberMe] = useState(false);
 
 const signIn = useAuthStore((state) => state.signIn);
 const errorMessage = useAuthStore((state) => state.errorMessage);
 const infoMessage = useAuthStore((state) => state.infoMessage);
 const clearError = useAuthStore((state) => state.clearError);
 const clearInfo = useAuthStore((state) => state.clearInfo);
 
 const {
 control,
 handleSubmit,
 formState: { errors, isSubmitting }} = useForm<LoginForm>({
 resolver: zodResolver(loginSchema),
 defaultValues: {
 email: '',
 password: ''}});

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
 <View className="w-24 h-24 rounded-3xl bg-surface-container-lowest shadow-soft flex items-center justify-center mb-2 overflow-hidden">
 <Image 
 source={require('../assets/images/logo.png')} 
 className="w-full h-full"
 contentFit="cover" 
 />
 </View>
 </View>
 
 {/* 2. PAGE TITLE */}
 <View className="flex-col gap-unit">
 <Text className="font-display-lg-mobile text-display-lg-mobile text-on-surface text-right font-bold">تسجيل الدخول</Text>
 <Text className="font-body-md text-body-md text-secondary text-right">أدخل بياناتك للوصول إلى حسابك</Text>
 </View>

 {/* 3. LOGIN FORM */}
 <View className="bg-surface-container-lowest rounded-2xl shadow-soft p-6 flex-col gap-stack-md">
 
 {/* Email Field */}
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
              trailing={<MaterialIcons name="mail-outline" size={20} color="#6d7a77" />}
            />
 )}
 />

 {/* Password Field */}
 <Controller
 control={control}
 name="password"
 render={({ field: { onBlur, onChange, value } }) => (
            <View className="mt-4">
              <AppInput
                label="كلمة المرور"
                placeholder="••••••••"
                secureTextEntry={!passwordVisible}
                autoComplete="password"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                trailing={
                  <Pressable className="p-2" onPress={() => setPasswordVisible(!passwordVisible)}>
                    <MaterialIcons name={passwordVisible ? "visibility" : "visibility-off"} size={20} color="#6d7a77" />
                  </Pressable>
                }
              />
            </View>
 )}
 />

 <View className="mt-2">
 <AuthNotice message={infoMessage} tone="info" />
 <AuthNotice message={errorMessage} tone="error" />
 </View>

 {/* Utility Row */}
 <View className={`flex-row${I18nManager.isRTL ? '-reverse' : ''} justify-between items-center mt-2`}>
 <Pressable className={`flex-row${I18nManager.isRTL ? '-reverse' : ''} items-center gap-2`} onPress={() => setRememberMe(!rememberMe)}>
 <View className={`w-5 h-5 rounded-[4px] border-[1.5px] items-center justify-center ${rememberMe ? 'bg-primary border-primary' : 'border-outline'}`}>
 {rememberMe && <MaterialIcons name="check" size={16} color="#ffffff" />}
 </View>
 <Text className="font-label-sm text-label-sm text-secondary">تذكرني</Text>
 </Pressable>
 <Pressable onPress={() => router.push('/reset-password' as Href)}>
 <Text className="font-label-sm text-label-sm text-primary font-bold">نسيت كلمة المرور؟</Text>
 </Pressable>
 </View>

          <View className="mt-4">
            <AppButton
              label="تسجيل الدخول"
              onPress={() => void onSubmit()}
              disabled={isSubmitting}
              loading={isSubmitting}
            />
          </View>

 </View>

 {/* 5. FOOTER */}
 <View className={`flex-row${I18nManager.isRTL ? '-reverse' : ''} items-center justify-center gap-2 mt-4`}>
 <Text className="font-body-md text-body-md text-secondary">ليس لديك حساب؟</Text>
 <Pressable onPress={() => router.push('/register' as Href)}>
 <Text className="font-body-md text-body-md text-primary font-bold">إنشاء حساب جديد</Text>
 </Pressable>
 </View>

 </View>
 </View>
 </AuthPublicGate>
 );
}
