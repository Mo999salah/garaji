import { zodResolver } from '@hookform/resolvers/zod';
import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { z } from 'zod';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { AppText as Text } from '@/shared/components/AppText';
import { AuthPublicGate } from '@/features/auth/components/AuthPublicGate';
import { AuthNotice } from '@/features/auth/components/AuthScreen';
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
    <View className="flex-col gap-1">
      <Text className="text-on-background font-label-sm text-[13px] leading-[18px] text-right font-bold pr-1">
        {label}
      </Text>
      <View className="relative justify-center">
        {trailing ? (
          <View className="absolute left-4 z-10">
            {trailing}
          </View>
        ) : null}
        <TextInput
          className={`w-full h-12 rounded-xl text-on-surface text-right font-body-md text-[16px] leading-[24px] ${
            trailing ? 'pl-12 pr-4' : 'px-4'
          } ${
            error
              ? 'border border-error'
              : focused
                ? 'bg-surface-container-lowest border border-primary'
                : 'bg-surface-container-low border-none'
          }`}
          onBlur={() => {
            setFocused(false);
            onBlur();
          }}
          onFocus={() => setFocused(true)}
          onChangeText={onChangeText}
          placeholderTextColor="#bcc9c6"
          style={{ fontFamily: 'Tajawal_400Regular' }}
          value={value}
          {...props}
        />
      </View>
      {error ? (
        <Text className="font-label-sm text-[13px] leading-[18px] text-error text-right">{error}</Text>
      ) : null}
    </View>
  );
}

/* ─────────────── Role Selector ─────────────── */

function CustomRoleSelector({ value, onChange }: { value: UserRole; onChange: (role: UserRole) => void }) {
  return (
    <View className="flex-row-reverse gap-4">
      <Pressable 
        className={`flex-1 flex-col items-end p-4 border-2 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] active:scale-95 ${
          value === 'customer' 
          ? 'bg-primary-container/10 border-primary' 
          : 'bg-surface-container-lowest border-transparent'
        }`}
        onPress={() => onChange('customer')}
      >
        <MaterialIcons 
          name="directions-car" 
          size={32} 
          color={value === 'customer' ? "#00685f" : "#3d4947"} 
          style={{ marginBottom: 12 }}
        />
        <Text className="text-on-background font-title-md text-[16px] leading-[24px] font-bold mb-1">عميل</Text>
        <Text className="text-on-surface-variant font-label-sm text-[13px] leading-[18px] text-right">حجز صيانة ومتابعة سياراتك</Text>
      </Pressable>

      <Pressable 
        className={`flex-1 flex-col items-end p-4 border-2 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] active:scale-95 ${
          value === 'merchant' 
          ? 'bg-primary-container/10 border-primary' 
          : 'bg-surface-container-lowest border-transparent'
        }`}
        onPress={() => onChange('merchant')}
      >
        <MaterialIcons 
          name="build" 
          size={32} 
          color={value === 'merchant' ? "#00685f" : "#3d4947"} 
          style={{ marginBottom: 12 }}
        />
        <Text className="text-on-background font-title-md text-[16px] leading-[24px] font-bold mb-1">مركز خدمة</Text>
        <Text className="text-on-surface-variant font-label-sm text-[13px] leading-[18px] text-right">إدارة الطلبات والفروع</Text>
      </Pressable>
    </View>
  );
}

/* ─────────────── Password Meter ─────────────── */

function PasswordMeter({ score }: { score: number }) {
  const label = score >= 4 ? 'قوية' : score >= 2 ? 'متوسطة' : 'ضعيفة';
  return (
    <View className="pt-2 flex-col space-y-2">
      <View className="flex-row-reverse gap-1 h-1">
        {[1, 2, 3, 4].map((step) => (
          <View
            className={`flex-1 rounded-full ${step <= score ? 'bg-primary' : 'bg-surface-variant'}`}
            key={step}
          />
        ))}
      </View>
      <Text className="text-on-surface-variant font-label-sm text-[13px] leading-[18px] text-right mt-1">
        قوة كلمة المرور: {label}
      </Text>
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
      router.replace('/login');
    } catch {
      // The auth store exposes a safe user-facing message.
    }
  });

  return (
    <AuthPublicGate>
      <View className="bg-background flex-1 flex-col items-center justify-center p-margin-mobile">
        <View className="w-full max-w-md flex-col gap-stack-lg pt-12 pb-12">
          
          {/* Header Section */}
          <View className="flex-col items-center gap-stack-sm">
            <View className="w-16 h-16 rounded-full bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex items-center justify-center mb-2 overflow-hidden">
              <Image 
                source={require('../assets/images/logo.png')} 
                className="w-full h-full"
                contentFit="cover" 
              />
            </View>
            <Text className="text-on-background font-bold text-[24px] leading-[32px]">كراجي</Text>
            <Text className="text-on-surface-variant text-[14px] leading-[20px]">منصة خدمات سيارتك</Text>
          </View>

          {/* Title Section */}
          <View className="text-right gap-stack-sm">
            <Text className="text-on-background font-display-lg-mobile text-[28px] leading-[36px] font-bold text-right">إنشاء حساب جديد</Text>
            <Text className="text-on-surface-variant font-body-md text-[16px] leading-[24px] text-right">اختر نوع حسابك وأكمل بياناتك</Text>
          </View>

          {/* Account Type Selector */}
          <CustomRoleSelector onChange={setRole} value={selectedRole} />

          {/* Form Card */}
          <View className="bg-surface-container-lowest rounded-[16px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex-col gap-stack-md">
            
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
                  placeholder="الاسم الكامل"
                  value={value}
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onBlur, onChange, value } }) => (
                <View className="mt-4">
                  <ArchInput
                    autoComplete="tel"
                    error={errors.phone?.message}
                    inputMode="tel"
                    keyboardType="phone-pad"
                    label="رقم الجوال"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="+966 5X XXX XXXX"
                    value={value ?? ''}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onBlur, onChange, value } }) => (
                <View className="mt-4">
                  <ArchInput
                    autoCapitalize="none"
                    autoComplete="email"
                    error={errors.email?.message}
                    inputMode="email"
                    keyboardType="email-address"
                    label="البريد الإلكتروني"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="example@email.com"
                    value={value}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onBlur, onChange, value } }) => (
                <View className="mt-4">
                  <ArchInput
                    autoCapitalize="none"
                    autoComplete="new-password"
                    error={errors.password?.message}
                    label="كلمة المرور"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="*********"
                    secureTextEntry={!passwordVisible}
                    trailing={
                      <Pressable 
                        className="p-2"
                        onPress={() => setPasswordVisible((current) => !current)}
                      >
                        <MaterialIcons 
                          name={passwordVisible ? "visibility" : "visibility-off"} 
                          size={20} 
                          color="#6d7a77" 
                        />
                      </Pressable>
                    }
                    value={value}
                  />
                  <PasswordMeter score={passwordScore} />
                </View>
              )}
            />

            {selectedRole === 'merchant' ? (
              <View className="flex-col gap-4 border-t border-black/5 mt-4 pt-4 dark:border-white/5">
                <Controller
                  control={control}
                  name="merchantName"
                  render={({ field: { onBlur, onChange, value } }) => (
                    <ArchInput
                      error={errors.merchantName?.message}
                      label="اسم المنشأة"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      placeholder="أدخل اسم المنشأة"
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
                      value={value ?? ''}
                    />
                  )}
                />
              </View>
            ) : null}

            <AuthNotice message={errorMessage} tone="error" />

            {/* Primary Button */}
            <Pressable
              disabled={isSubmitting}
              onPress={() => void onSubmit()}
              className={`w-full h-12 bg-primary rounded-[14px] shadow-[0px_4px_20px_rgba(0,104,95,0.2)] flex items-center justify-center mt-6 active:scale-95 ${isSubmitting ? 'opacity-70' : ''}`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-on-primary font-button-text text-[16px] leading-[16px] font-bold">إنشاء الحساب</Text>
              )}
            </Pressable>

          </View>

          {/* Footer Links */}
          <View className="flex-row-reverse items-center justify-center gap-2 mt-4">
            <Text className="text-on-surface-variant font-body-md text-[14px] leading-[20px]">لديك حساب بالفعل؟</Text>
            <Pressable onPress={() => router.replace('/login' as Href)}>
              <Text className="text-primary font-bold text-[14px] leading-[20px]">تسجيل الدخول</Text>
            </Pressable>
          </View>

        </View>
      </View>
    </AuthPublicGate>
  );
}
