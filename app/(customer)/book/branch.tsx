import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';

import { BranchCard } from '@/features/branches/components/BranchCard';
import { useBranchStore } from '@/features/branches/store/useBranchStore';
import { AppText as Text } from '@/shared/components/AppText';
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
import { EmptyState } from '@/shared/components/EmptyState';
import { CommandHeader, SectionHeader, StepIndicator } from '@/shared/components/OperationalUI';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

const TIME_SLOTS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

function buildScheduledAt(dateStr: string, timeStr: string): string {
  return new Date(`${dateStr}T${timeStr}:00`).toISOString();
}

export default function BookBranchScreen() {
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
  } = useForm<BranchBookingValues & { date: string; time: string }>({
    resolver: zodResolver(
      branchBookingSchema.extend({
        date: branchBookingSchema.shape.scheduledAt.optional() as any,
        time: branchBookingSchema.shape.scheduledAt.optional() as any,
      }),
    ) as any,
    defaultValues: {
      vehicleId: '',
      serviceId: '',
      branchId: '',
      scheduledAt: '',
      date: todayStr,
      time: '',
      notes: '',
    },
  });

  const selectedVehicleId = watch('vehicleId');
  const selectedServiceId = watch('serviceId');
  const selectedBranchId = watch('branchId');
  const selectedDate = watch('date');
  const selectedTime = watch('time');
  const currentStep = selectedVehicleId && selectedServiceId && selectedBranchId && selectedTime ? 4
    : selectedVehicleId && selectedServiceId && selectedBranchId ? 3
      : selectedVehicleId && selectedServiceId ? 2
        : 1;

  const onSubmit = async (values: BranchBookingValues & { date: string; time: string }) => {
    if (!values.date || !values.time) {
      Alert.alert('خطأ', 'يرجى تحديد اليوم والوقت المطلوبين.');
      return;
    }

    const scheduled = buildScheduledAt(values.date, values.time);
    try {
      const req = await bookBranchAppointment({
        vehicleId: values.vehicleId,
        serviceId: values.serviceId,
        branchId: values.branchId,
        scheduledAt: scheduled,
        notes: values.notes,
      });
      router.replace(`/(customer)/requests/${req.id}`);
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
      <ScrollView contentContainerClassName="gap-5 px-5 py-5">
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
              onPress={() => setValue('vehicleId', v.id)}
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
              onPress={() => setValue('serviceId', sv.id)}
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
              onPress={() => setValue('branchId', b.id)}
              selected={selectedBranchId === b.id}
            />
          ))}
          {errors.branchId ? (
            <Text className="font-sans text-sm text-red-600">{errors.branchId.message}</Text>
          ) : null}
        </View>

        <SectionHeader subtitle="اختر تاريخًا ووقتًا يناسبك." title="موعد الخدمة" />
        <Controller
          control={control as any}
          name={'date' as any}
          render={({ field: { onBlur, onChange, value } }) => (
            <AppInput
              label="اليوم (YYYY-MM-DD)"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder={todayStr}
              textAlign="right"
              value={value}
            />
          )}
        />

        <View className="gap-2">
          <Text className="font-sans text-sm font-semibold text-ink">الوقت المفضّل</Text>
          <View className="flex-row flex-wrap gap-2">
            {TIME_SLOTS.map((slot) => (
              <TouchableOpacity
                accessibilityRole="radio"
                className={[
                  'rounded-lg border px-4 py-2.5',
                  selectedTime === slot
                    ? 'border-brand-600 bg-brand-50'
                    : 'border-line bg-white',
                ].join(' ')}
                key={slot}
                onPress={() => setValue('time' as any, slot)}
              >
                <Text
                  className={`font-sans text-sm font-semibold ${
                    selectedTime === slot ? 'text-brand-700' : 'text-ink'
                  }`}
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ملاحظات */}
        <Controller
          control={control}
          name="notes"
          render={({ field: { onBlur, onChange, value } }) => (
            <AppInput
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

        <AppButton loading={isLoading} onPress={handleSubmit(onSubmit as any)}>
          تأكيد الحجز
        </AppButton>
      </ScrollView>
    </ScreenContainer>
  );
}
