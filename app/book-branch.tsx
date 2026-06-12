import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import {
 Alert,
 Keyboard,
 KeyboardAvoidingView,
 Platform,
 ScrollView,
 View,
 Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { z } from 'zod';

import { RoleGate } from '@/features/auth/components/RoleGate';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { BranchCard } from '@/features/branches/components/BranchCard';
import { useActiveBranchesQuery } from '@/features/branches/hooks/useBranchesQuery';
import {
 branchBookingSchema,
 type BranchBookingValues,
} from '@/features/requests/schemas/requestSchema';
import { useRequestStore } from '@/features/requests/store/useRequestStore';
import { ServiceCard } from '@/features/services/components/ServiceCard';
import { useActiveServicesQuery } from '@/features/services/hooks/useServicesQuery';
import { VehicleCard } from '@/features/vehicles/components/VehicleCard';
import { useCustomerVehiclesQuery } from '@/features/vehicles/hooks/useVehiclesQuery';
import { AppInput } from '@/shared/components/AppInput';
import { AppText as Text } from '@/shared/components/AppText';
import { AppHeader } from '@/shared/components/AppHeader';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';

const TIME_SLOTS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

const dateInputSchema = z
 .string()
 .min(1, 'حدد اليوم المطلوب')
 .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00`)), {
 message: 'اكتب التاريخ بصيغة YYYY-MM-DD',
 });

const branchBookingFormSchema = branchBookingSchema.omit({ scheduledAt: true }).extend({
 date: dateInputSchema,
 time: z.string().min(1, 'حدد الوقت المطلوب'),
});

type BranchBookingFormValues = z.infer<typeof branchBookingFormSchema>;

function buildScheduledAt(dateStr: string, timeStr: string): string {
 return new Date(`${dateStr}T${timeStr}:00`).toISOString();
}

function BookBranchScreen() {
 const { branchId } = useLocalSearchParams<{ branchId?: string }>();
 const user = useAuthStore((s) => s.user);
 const { data: vehicles = [] } = useCustomerVehiclesQuery(user?.id);
 const { data: allServices = [] } = useActiveServicesQuery();
 const { data: allBranches = [] } = useActiveBranchesQuery();
 const services = allServices.filter(
 (sv) => sv.serviceType === 'branch' || sv.serviceType === 'both',
 );
 const branches = allBranches.filter((b) => b.isActive);
 const { bookBranchAppointment, isLoading } = useRequestStore();

 const todayStr = new Date().toISOString().split('T')[0]!;

 const {
 control,
 handleSubmit,
 setValue,
 watch,
 formState: { errors },
 } = useForm<BranchBookingFormValues>({
 resolver: zodResolver(branchBookingFormSchema),
 defaultValues: {
 vehicleId: '',
 serviceId: '',
 branchId: typeof branchId === 'string' ? branchId : '',
 date: todayStr,
 time: '',
 notes: '',
 },
 mode: 'onSubmit',
 });

 const selectedVehicleId = watch('vehicleId');
 const selectedServiceId = watch('serviceId');
 const selectedBranchId = watch('branchId');
 const selectedTime = watch('time');

 const onSubmit = async (values: BranchBookingFormValues) => {
 const payload: BranchBookingValues = {
 vehicleId: values.vehicleId,
 serviceId: values.serviceId,
 branchId: values.branchId,
 scheduledAt: buildScheduledAt(values.date, values.time),
 notes: values.notes,
 };

 try {
 await bookBranchAppointment(payload);
 router.replace('/(tabs)/orders');
 } catch {
 Alert.alert('خطأ', 'تعذّر إتمام الحجز. يرجى المحاولة مجدداً.');
 }
 };

 if (!vehicles.length) {
 return (
 <View className="flex-1 bg-background">
 <AppHeader title="حجز موعد" onBack={() => router.back()} />
 <EmptyState
 message="يجب إضافة سيارة أولاً قبل حجز موعد."
 title="لا توجد سيارات"
 />
 <View className="mt-4 px-margin-mobile">
 <AppButton label="إضافة سيارة" onPress={() => router.push('/add-vehicle')} />
 </View>
 </View>
 );
 }

 const STEPS = ['السيارة', 'الخدمة', 'الفرع', 'التأكيد'];
 const currentStepNum = selectedVehicleId && selectedServiceId && selectedBranchId && selectedTime ? 4
 : selectedVehicleId && selectedServiceId && selectedBranchId ? 3
 : selectedVehicleId && selectedServiceId ? 2
 : 1;

 return (
 <View className="flex-1 bg-background pb-[100px]">
 <AppHeader title="حجز موعد" onBack={() => router.back()} />

 <KeyboardAvoidingView
 behavior={Platform.OS === 'ios' ? 'padding' : undefined}
 className="flex-1"
 >
 <Pressable accessible={false} onPress={Keyboard.dismiss} style={{ flex: 1 }}>
 <ScrollView
 contentContainerClassName="px-margin-mobile pt-stack-lg flex-grow"
 keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
 keyboardShouldPersistTaps="handled"
 showsVerticalScrollIndicator={false}
 >
 {/* Progress Indicator */}
 <View className="mb-stack-lg">
 <View className="flex-row-reverse justify-between items-center relative z-10">
 {STEPS.map((step, idx) => {
 const stepNum = idx + 1;
 const isActive = stepNum === currentStepNum;
 const isComplete = stepNum < currentStepNum;
 return (
 <View key={step} className="flex-col items-center gap-2">
 <View className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm z-10 ${
 isActive || isComplete ? 'bg-primary' : 'bg-surface-container-high'
 }`}>
 {isComplete ? (
 <MaterialIcons name="check" size={16} color="white" />
 ) : (
 <Text className={`font-label-sm text-label-sm ${
 isActive || isComplete ? 'text-on-primary' : 'text-on-surface-variant'
 }`}>{stepNum}</Text>
 )}
 </View>
 <Text className={`font-label-sm text-label-sm ${
 isActive || isComplete ? 'text-primary' : 'text-on-surface-variant'
 }`}>{step}</Text>
 </View>
 );
 })}
 </View>
 </View>

 <View className="gap-stack-md mb-stack-lg">
 <Text className="font-title-md text-title-md text-on-background text-right font-bold mb-2">اختر السيارة</Text>
 {vehicles.map((v) => (
 <VehicleCard
 key={v.id}
 onPress={() => setValue('vehicleId', v.id, { shouldValidate: true })}
 selected={selectedVehicleId === v.id}
 vehicle={v}
 />
 ))}
 {errors.vehicleId ? (
 <Text className="font-label-sm text-label-sm text-error text-right">{errors.vehicleId.message}</Text>
 ) : null}
 </View>

 <View className="gap-stack-md mb-stack-lg">
 <Text className="font-title-md text-title-md text-on-background text-right font-bold mb-2">اختر الخدمة</Text>
 {services.map((sv) => (
 <ServiceCard
 key={sv.id}
 onPress={() => setValue('serviceId', sv.id, { shouldValidate: true })}
 selected={selectedServiceId === sv.id}
 service={sv}
 />
 ))}
 {errors.serviceId ? (
 <Text className="font-label-sm text-label-sm text-error text-right">{errors.serviceId.message}</Text>
 ) : null}
 </View>

 <View className="gap-stack-md mb-stack-lg">
 <Text className="font-title-md text-title-md text-on-background text-right font-bold mb-2">اختر الفرع</Text>
 {branches.map((b) => (
 <BranchCard
 key={b.id}
 branch={b}
 onPress={() => setValue('branchId', b.id, { shouldValidate: true })}
 selected={selectedBranchId === b.id}
 />
 ))}
 {errors.branchId ? (
 <Text className="font-label-sm text-label-sm text-error text-right">{errors.branchId.message}</Text>
 ) : null}
 </View>

 <View className="gap-stack-md mb-stack-lg pb-10">
 <Text className="font-title-md text-title-md text-on-background text-right font-bold mb-2">موعد الخدمة</Text>
 <Controller
 control={control}
 name="date"
 render={({ field: { onBlur, onChange, value } }) => (
 <AppInput
 error={errors.date?.message}
 label="اليوم (YYYY-MM-DD)"
 onBlur={onBlur}
 onChangeText={onChange}
 placeholder={todayStr}
 textAlign="right"
 value={value}
 />
 )}
 />

 <Controller
 control={control}
 name="time"
 render={({ field: { onChange, value } }) => (
 <View className="gap-2">
 <Text className="font-body-md text-body-md text-right text-on-surface-variant font-bold">
 الوقت المفضّل
 </Text>
 <View className="flex-row-reverse flex-wrap gap-2">
 {TIME_SLOTS.map((slot) => {
 const isSelected = value === slot;
 return (
 <Pressable
 accessibilityRole="radio"
 accessibilityState={{ selected: isSelected }}
 className={`rounded-2xl border px-4 py-2.5 ${
 isSelected
 ? 'border-primary bg-primary-container/10'
 : 'border-outline-variant bg-surface-container-lowest'
 }`}
 key={slot}
 onPress={() => onChange(slot)}
 >
 <Text
 className={`font-label-sm text-label-sm font-bold ${
 isSelected ? 'text-primary' : 'text-on-surface-variant'
 }`}
 >
 {slot}
 </Text>
 </Pressable>
 );
 })}
 </View>
 {errors.time ? (
 <Text className="font-label-sm text-label-sm text-error text-right">
 {errors.time.message}
 </Text>
 ) : null}
 </View>
 )}
 />

 <Controller
 control={control}
 name="notes"
 render={({ field: { onBlur, onChange, value } }) => (
 <AppInput
 error={errors.notes?.message}
 label="ملاحظات (اختياري)"
 multiline
 numberOfLines={3}
 onBlur={onBlur}
 onChangeText={onChange}
 placeholder="أي تفاصيل إضافية..."
 textAlign="right"
 value={value ?? ''}
 />
 )}
 />
 </View>

 </ScrollView>
 </Pressable>
 </KeyboardAvoidingView>

 {/* Bottom Action Bar (Fixed) */}
 <View className="absolute bottom-0 left-0 right-0 bg-surface-container-lowest px-margin-mobile py-4 shadow-elevated z-40 rounded-t-2xl">
 <AppButton 
   onPress={handleSubmit(onSubmit)} 
   disabled={isLoading}
   loading={isLoading}
   size="lg"
 >
   <View className="flex-row-reverse items-center justify-center gap-2">
     <Text className="font-button-text text-on-primary">تأكيد الحجز</Text>
     <MaterialIcons name="arrow-back" size={20} color="white" />
   </View>
 </AppButton>
 </View>
 </View>
 );
}

export default function BookBranchRoute() {
 return (
 <RoleGate role="customer">
 <BookBranchScreen />
 </RoleGate>
 );
}
