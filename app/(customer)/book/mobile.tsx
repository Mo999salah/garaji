import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';

import { AppText as Text } from '@/shared/components/AppText';
import {
  mobileBookingSchema,
  type MobileBookingValues,
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

type FormValues = MobileBookingValues & { date: string; time: string };

export default function BookMobileScreen() {
  const vehicles = useVehicleStore((s) => s.vehicles);
  const services = useServiceStore((s) =>
    s.services.filter((sv) => sv.serviceType === 'mobile' || sv.serviceType === 'both'),
  );
  const { bookMobileService, isLoading } = useRequestStore();

  const todayStr = new Date().toISOString().split('T')[0]!;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      vehicleId: '',
      serviceId: '',
      locationCity: '',
      locationAddress: '',
      scheduledAt: '',
      date: todayStr,
      time: '',
      notes: '',
    },
  });

  const selectedVehicleId = watch('vehicleId');
  const selectedServiceId = watch('serviceId');
  const selectedTime = watch('time');
  const locationCity = watch('locationCity');
  const currentStep = selectedVehicleId && selectedServiceId && locationCity && selectedTime ? 4
    : selectedVehicleId && selectedServiceId && locationCity ? 3
      : selectedVehicleId && selectedServiceId ? 2
        : 1;

  const onSubmit = async (values: FormValues) => {
    const validationResult = mobileBookingSchema.safeParse({
      ...values,
      scheduledAt: values.date && values.time ? buildScheduledAt(values.date, values.time) : '',
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message ?? 'يرجى مراجعة البيانات.';
      Alert.alert('خطأ', firstError);
      return;
    }

    if (!values.time) {
      Alert.alert('خطأ', 'يرجى تحديد الوقت المطلوب.');
      return;
    }

    try {
      const req = await bookMobileService({
        vehicleId: values.vehicleId,
        serviceId: values.serviceId,
        locationCity: values.locationCity,
        locationAddress: values.locationAddress,
        scheduledAt: buildScheduledAt(values.date, values.time),
        notes: values.notes,
      });
      router.replace(`/(customer)/requests/${req.id}`);
    } catch {
      Alert.alert('خطأ', 'تعذّر إتمام الطلب. يرجى المحاولة مجدداً.');
    }
  };

  if (!vehicles.length) {
    return (
      <ScreenContainer>
        <EmptyState
          message="يجب إضافة سيارة أولاً قبل طلب الخدمة."
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
          eyebrow="خدمة بالموقع"
          subtitle="اختر السيارة والخدمة، وحدد الموقع والوقت."
          title="طلب صيانة"
        />
        <StepIndicator current={currentStep} steps={['السيارة', 'الخدمة', 'الموقع', 'التأكيد']} />

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

        <SectionHeader subtitle="اكتب المدينة والعنوان بشكل يساعد الفني على الوصول." title="موقع الخدمة" />
        <Controller
          control={control}
          name="locationCity"
          render={({ field: { onBlur, onChange, value } }) => (
            <AppInput
              error={errors.locationCity?.message}
              label="المدينة"
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="مثال: الرياض"
              textAlign="right"
              value={value}
            />
          )}
        />

        <Controller
          control={control}
          name="locationAddress"
          render={({ field: { onBlur, onChange, value } }) => (
            <AppInput
              error={errors.locationAddress?.message}
              label="العنوان التفصيلي"
              multiline
              numberOfLines={2}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="مثال: حي النرجس، شارع 15، بجانب المسجد"
              textAlign="right"
              value={value}
            />
          )}
        />

        <SectionHeader subtitle="اختر تاريخًا ووقتًا يناسبك." title="موعد الخدمة" />
        <Controller
          control={control}
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

        <AppButton loading={isLoading} onPress={handleSubmit(onSubmit)}>
          تأكيد الطلب
        </AppButton>
      </ScrollView>
    </ScreenContainer>
  );
}
