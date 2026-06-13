import { zodResolver } from '@hookform/resolvers/zod';
import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
 I18nManager,
 KeyboardAvoidingView,
 Platform,
 SafeAreaView,
 ScrollView,
 View,
} from 'react-native';
import { z } from 'zod';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { AppText as Text } from '@/shared/components/AppText';
import { AppInput } from '@/shared/components/AppInput';
import { AppButton } from '@/shared/components/AppButton';
import { AnimatedPressable } from '@/shared/components/AnimatedPressable';
import { AuthPublicGate } from '@/features/auth/components/AuthPublicGate';
import { AuthNotice } from '@/features/auth/components/AuthScreen';
import { AppColors } from '@/shared/lib/colors';
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
 region: z.string().trim().optional()})
 .superRefine((value, context) => {
 if (value.role === 'merchant' && !value.merchantName) {
 context.addIssue({
 code: 'custom',
 message: 'أدخل اسم المنشأة.',
 path: ['merchantName']});
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

/* ─────────────── Role Selector ─────────────── */

function CustomRoleSelector({ value, onChange }: { value: UserRole; onChange: (role: UserRole) => void }) {
 return (
 <View className={`flex-row${I18nManager.isRTL ? '-reverse' : ''} gap-4`}>
 <AnimatedPressable
 accessibilityLabel="عميل"
 accessibilityRole="radio"
 accessibilityState={{ checked: value === 'customer' }}
 accessibilityHint="إنشاء حساب كعميل لحجز الصيانة"
 className={`flex-1 flex-col items-end p-4 border-2 rounded-2xl shadow-soft ${
 value === 'customer' 
 ? 'bg-primary-container/10 border-primary' 
 : 'bg-surface-container-lowest border-transparent'
 }`}
 onPress={() => onChange('customer')}
 >
 <MaterialIcons 
 name="directions-car" 
 size={32} 
 color={value === 'customer' ? AppColors.primary : AppColors.onSurfaceVariant} 
 style={{ marginBottom: 12 }}
 />
 <Text className="text-on-background font-title-md text-body-md font-bold mb-1">عميل</Text>
 <Text className="text-on-surface-variant font-label-sm text-label-sm text-right">حجز صيانة ومتابعة سياراتك</Text>
 </AnimatedPressable>

 <AnimatedPressable
 accessibilityLabel="مركز خدمة"
 accessibilityRole="radio"
 accessibilityState={{ checked: value === 'merchant' }}
 accessibilityHint="إنشاء حساب كمركز خدمة لإدارة الطلبات"
 className={`flex-1 flex-col items-end p-4 border-2 rounded-2xl shadow-soft ${
 value === 'merchant' 
 ? 'bg-primary-container/10 border-primary' 
 : 'bg-surface-container-lowest border-transparent'
 }`}
 onPress={() => onChange('merchant')}
 >
 <MaterialIcons 
 name="build" 
 size={32} 
 color={value === 'merchant' ? AppColors.primary : AppColors.onSurfaceVariant} 
 style={{ marginBottom: 12 }}
 />
 <Text className="text-on-background font-title-md text-body-md font-bold mb-1">مركز خدمة</Text>
 <Text className="text-on-surface-variant font-label-sm text-label-sm text-right">إدارة الطلبات والفروع</Text>
 </AnimatedPressable>
 </View>
 );
}

/* ─────────────── Password Meter ─────────────── */

function PasswordMeter({ score }: { score: number }) {
 const label = score >= 4 ? 'قوية' : score >= 2 ? 'متوسطة' : 'ضعيفة';
 return (
 <View className="pt-2 flex-col space-y-2">
 <View className={`flex-row${I18nManager.isRTL ? '-reverse' : ''} gap-1 h-1`}>
 {[1, 2, 3, 4].map((step) => (
 <View
 className={`flex-1 rounded-full ${step <= score ? 'bg-primary' : 'bg-surface-variant'}`}
 key={step}
 />
 ))}
 </View>
 <Text className="text-on-surface-variant font-label-sm text-label-sm text-right mt-1">
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
 formState: { errors, isSubmitting }} = useForm<SignupForm>({
 resolver: zodResolver(signupSchema),
 defaultValues: {
 fullName: '',
 phone: '',
 email: '',
 password: '',
 role: 'customer',
 merchantName: '',
 region: ''}});
 
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
  <SafeAreaView className="flex-1 bg-background">
  <KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  className="flex-1"
  >
  <ScrollView
  className="flex-1"
  contentContainerClassName="grow justify-center p-margin-mobile"
  keyboardShouldPersistTaps="handled"
  showsVerticalScrollIndicator={false}
  >
  <View className="w-full max-w-md self-center flex-col gap-stack-lg py-12">
  
  {/* Header Section */}
  <View className="flex-col items-center gap-stack-sm">
  <View className="w-16 h-16 rounded-full bg-surface-container-lowest shadow-soft flex items-center justify-center mb-2 overflow-hidden">
  <Image 
  source={require('../assets/images/logo.png')} 
  className="w-full h-full"
  contentFit="cover"
  accessibilityLabel="شعار كراجي"
  />
  </View>
  <Text className="text-on-background font-bold text-title-md">كراجي</Text>
  <Text className="text-on-surface-variant text-body-md">منصة خدمات سيارتك</Text>
  </View>

  {/* Title Section */}
  <View className="text-right gap-stack-sm">
  <Text className="text-on-background font-display-lg-mobile text-display-lg-mobile font-bold text-right">إنشاء حساب جديد</Text>
  <Text className="text-on-surface-variant font-body-md text-body-md text-right">اختر نوع حسابك وأكمل بياناتك</Text>
  </View>

  {/* Account Type Selector */}
  <CustomRoleSelector onChange={setRole} value={selectedRole} />

  {/* Form Card */}
  <View className="bg-surface-container-lowest rounded-2xl p-6 shadow-soft flex-col gap-stack-md">
  
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
  <AppInput
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
  <AppInput
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
  <AppInput
  autoCapitalize="none"
  autoComplete="new-password"
  error={errors.password?.message}
  label="كلمة المرور"
  onBlur={onBlur}
  onChangeText={onChange}
  placeholder="*********"
  secureTextEntry={!passwordVisible}
  trailing={
  <AnimatedPressable
  accessibilityLabel={passwordVisible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
  accessibilityHint="اضغط لإظهار أو إخفاء كلمة المرور"
  accessibilityRole="button"
  className="min-h-11 min-w-11 items-center justify-center px-2"
  onPress={() => setPasswordVisible((current) => !current)}
  >
  <MaterialIcons 
  name={passwordVisible ? "visibility" : "visibility-off"} 
  size={20} 
  color={AppColors.outline} 
  />
  </AnimatedPressable>
  }
  value={value}
  />
  <PasswordMeter score={passwordScore} />
  </View>
  )}
  />

  {selectedRole === 'merchant' ? (
  <View className="flex-col gap-4 border-t border-outline-variant mt-4 pt-4">
  <Controller
  control={control}
  name="merchantName"
  render={({ field: { onBlur, onChange, value } }) => (
  <AppInput
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
  <AppInput
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

  <View className="mt-6">
   <AppButton
     label="إنشاء الحساب"
     onPress={() => void onSubmit()}
     disabled={isSubmitting}
     loading={isSubmitting}
   />
  </View>

  </View>

  {/* Footer Links */}
  <View className={`flex-row${I18nManager.isRTL ? '-reverse' : ''} items-center justify-center gap-2 mt-4`}>
  <Text className="text-on-surface-variant font-body-md text-body-md">لديك حساب بالفعل؟</Text>
  <AnimatedPressable
  accessibilityLabel="تسجيل الدخول"
  accessibilityRole="link"
  accessibilityHint="الانتقال إلى شاشة تسجيل الدخول"
  className="min-h-11 justify-center px-1"
  onPress={() => router.replace('/login' as Href)}
  >
  <Text className="text-primary font-bold text-body-md">تسجيل الدخول</Text>
  </AnimatedPressable>
  </View>

  </View>
  </ScrollView>
  </KeyboardAvoidingView>
  </SafeAreaView>
  </AuthPublicGate>
  );
}
