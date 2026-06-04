import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { z } from 'zod';

import { BranchCard } from '@/features/branches/components/BranchCard';
import { useBranchStore } from '@/features/branches/store/useBranchStore';
import {
  branchBookingSchema,
  type BranchBookingValues,
} from '@/features/requests/schemas/requestSchema';
import { useRequestStore } from '@/features/requests/store/useRequestStore';
import { ServiceCard } from '@/features/services/components/ServiceCard';
import { useServiceStore } from '@/features/services/store/useServiceStore';
import { VehicleCard } from '@/features/vehicles/components/VehicleCard';
import { useVehicleStore } from '@/features/vehicles/store/useVehicleStore';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';
import { AppText as Text } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';
import { CommandHeader, SectionHeader, StepIndicator } from '@/shared/components/OperationalUI';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

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

export default function BookBranchScreen() {
  const { branchId } = useLocalSearchParams<{ branchId?: string }>();
  const vehicles = useVehicleStore((s) => s.vehicles);
  const services = useServiceStore((s) =>
    s.services.filter((sv) => sv.serviceType === 'branch' || sv.serviceType === 'both'),
  );
  const branches = useBranchStore((s) => s.branches.filter((b) => b.isActive));
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
  const currentStep = selectedVehicleId && selectedServiceId && selectedBranchId && selectedTime ? 4
    : selectedVehicleId && selectedServiceId && selectedBranchId ? 3
      : selectedVehicleId && selectedServiceId ? 2
        : 1;

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
      router.replace('/(customer)/requests');
    } catch {
      Alert.alert('خطأ', 'تعذّر إتمام الحجز. يرجى المحاولة مجدداً.');
    }
  };

  if (!vehicles.length) {
    return (
      <ScreenContainer>
        <EmptyState
          message="يجب إضافة سيارة أولاً قبل حجز موعد."
          title="لا توجد سيارات"
        />
        <View className="mt-4">
          <AppButton onPress={() => router.push('/(customer)/vehicles/new')}>
            إضافة سيارة
          </AppButton>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerClassName="gap-5 px-5 py-5 pb-8"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <CommandHeader
              eyebrow="حجز فرع"
              subtitle="اختر السيارة والخدمة والفرع، ثم ثبّت الموعد."
              title="موعد صيانة"
            />
            <StepIndicator current={currentStep} steps={['السيارة', 'الخدمة', 'الفرع', 'التأكيد']} />

            <View className="gap-2">
              <SectionHeader title="اختر السيارة" />
              {vehicles.map((v) => (
                <VehicleCard
                  key={v.id}
                  onPress={() => setValue('vehicleId', v.id, { shouldValidate: true })}
                  selected={selectedVehicleId === v.id}
                  vehicle={v}
                />
              ))}
              {errors.vehicleId ? (
                <Text className="font-sans text-sm text-red-600">{errors.vehicleId.message}</Text>
              ) : null}
            </View>

            <View className="gap-2">
              <SectionHeader title="اختر الخدمة" />
              {services.map((sv) => (
                <ServiceCard
                  key={sv.id}
                  onPress={() => setValue('serviceId', sv.id, { shouldValidate: true })}
                  selected={selectedServiceId === sv.id}
                  service={sv}
                />
              ))}
              {errors.serviceId ? (
                <Text className="font-sans text-sm text-red-600">{errors.serviceId.message}</Text>
              ) : null}
            </View>

            <View className="gap-2">
              <SectionHeader title="اختر الفرع" />
              {branches.map((b) => (
                <BranchCard
                  key={b.id}
                  branch={b}
                  onPress={() => setValue('branchId', b.id, { shouldValidate: true })}
                  selected={selectedBranchId === b.id}
                />
              ))}
              {errors.branchId ? (
                <Text className="font-sans text-sm text-red-600">{errors.branchId.message}</Text>
              ) : null}
            </View>

            <SectionHeader subtitle="اختر تاريخًا ووقتًا يناسبك." title="موعد الخدمة" />
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
              <Text className="font-sans text-right text-sm font-semibold text-ink dark:text-dark-ink">
                الوقت المفضّل
              </Text>
              <View className="flex-row-reverse flex-wrap gap-2">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = value === slot;

                  return (
                    <TouchableOpacity
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      className={[
                        'rounded-lg border px-4 py-2.5',
                        isSelected
                          ? 'border-brand-600 bg-brand-50 dark:border-dark-brand-500 dark:bg-dark-brand-50/60'
                          : 'border-line bg-card dark:border-dark-line dark:bg-dark-card',
                      ].join(' ')}
                      key={slot}
                      onPress={() => onChange(slot)}
                    >
                      <Text
                        className={`font-sans text-sm font-semibold ${
                          isSelected
                            ? 'text-brand-700 dark:text-dark-brand-500'
                            : 'text-ink dark:text-dark-ink'
                        }`}
                      >
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.time ? (
                <Text className="font-sans text-right text-sm text-red-600 dark:text-red-400">
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

            <AppButton loading={isLoading} onPress={handleSubmit(onSubmit)}>
              تأكيد الحجز
            </AppButton>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
