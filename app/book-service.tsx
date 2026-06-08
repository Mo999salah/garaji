import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useState } from 'react';
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

import { RoleGate } from '@/features/auth/components/RoleGate';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import {
  mobileBookingSchema,
  type MobileBookingValues,
} from '@/features/requests/schemas/requestSchema';
import { useRequestStore } from '@/features/requests/store/useRequestStore';
import { ServiceCard } from '@/features/services/components/ServiceCard';
import { useActiveServicesQuery } from '@/features/services/hooks/useServicesQuery';
import { VehicleCard } from '@/features/vehicles/components/VehicleCard';
import { useCustomerVehiclesQuery } from '@/features/vehicles/hooks/useVehiclesQuery';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';
import {
  AppMapMarker,
  AppMapView,
  type AppMapCoordinate,
  type AppMapPressEvent,
  type AppMapRegion,
} from '@/shared/components/AppMap';
import { AppText as Text } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';
import { CommandHeader, SectionHeader, StepIndicator } from '@/shared/components/OperationalUI';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

const TIME_SLOTS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

const DEFAULT_MOBILE_REGION: AppMapRegion = {
  latitude: 24.7136,
  longitude: 46.6753,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const dateInputSchema = z
  .string()
  .min(1, 'حدد اليوم المطلوب')
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00`)), {
    message: 'اكتب التاريخ بصيغة YYYY-MM-DD',
  });

const mobileBookingFormSchema = mobileBookingSchema.omit({ scheduledAt: true }).extend({
  date: dateInputSchema,
  time: z.string().min(1, 'حدد الوقت المطلوب'),
});

type MobileBookingFormValues = z.infer<typeof mobileBookingFormSchema>;

function buildScheduledAt(dateStr: string, timeStr: string): string {
  return new Date(`${dateStr}T${timeStr}:00`).toISOString();
}

function buildAddressLabel(address: Location.LocationGeocodedAddress): string {
  return [
    address.district,
    address.street,
    address.name,
    address.subregion,
  ]
    .filter(Boolean)
    .join('، ');
}

function BookMobileScreen() {
  const [mapRegion, setMapRegion] = useState<AppMapRegion>(DEFAULT_MOBILE_REGION);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);
  const { data: vehicles = [] } = useCustomerVehiclesQuery(user?.id);
  const { data: allServices = [] } = useActiveServicesQuery();
  const services = allServices.filter(
    (sv) => sv.serviceType === 'mobile' || sv.serviceType === 'both',
  );
  const { bookMobileService, isLoading } = useRequestStore();

  const todayStr = new Date().toISOString().split('T')[0]!;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MobileBookingFormValues>({
    resolver: zodResolver(mobileBookingFormSchema),
    defaultValues: {
      vehicleId: '',
      serviceId: '',
      locationCity: '',
      locationAddress: '',
      locationLat: undefined,
      locationLng: undefined,
      date: todayStr,
      time: '',
      notes: '',
    },
    mode: 'onSubmit',
  });

  const selectedVehicleId = watch('vehicleId');
  const selectedServiceId = watch('serviceId');
  const selectedTime = watch('time');
  const locationCity = watch('locationCity');
  const selectedLat = watch('locationLat');
  const selectedLng = watch('locationLng');
  const selectedCoordinate =
    typeof selectedLat === 'number' && typeof selectedLng === 'number'
      ? { latitude: selectedLat, longitude: selectedLng }
      : undefined;
  const currentStep = selectedVehicleId && selectedServiceId && locationCity && selectedTime ? 4
    : selectedVehicleId && selectedServiceId && locationCity ? 3
      : selectedVehicleId && selectedServiceId ? 2
        : 1;

  const syncPickedLocation = async (coordinate: AppMapCoordinate) => {
    setValue('locationLat', coordinate.latitude);
    setValue('locationLng', coordinate.longitude);
    setMapRegion({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    });
    setLocationMessage('تم تثبيت الموقع على الخريطة.');

    try {
      const [address] = await Location.reverseGeocodeAsync(coordinate);

      if (!address) {
        return;
      }

      const city = address.city ?? address.subregion ?? address.region;
      const addressLabel = buildAddressLabel(address);

      if (city) {
        setValue('locationCity', city, { shouldValidate: true });
      }

      if (addressLabel) {
        setValue('locationAddress', addressLabel, { shouldValidate: true });
      }
    } catch {
      setLocationMessage('تم تثبيت الموقع، ويمكنك كتابة العنوان يدويًا.');
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setLocationMessage('لم يتم منح إذن الموقع. يمكنك تثبيت الموقع يدويًا على الخريطة.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      await syncPickedLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch {
      setLocationMessage('تعذّر تحديد موقعك الحالي. اختر الموقع يدويًا من الخريطة.');
    }
  };

  const handleMapPress = async (event: AppMapPressEvent) => {
    await syncPickedLocation(event.nativeEvent.coordinate);
  };

  const onSubmit = async (values: MobileBookingFormValues) => {
    const payload: MobileBookingValues = {
      vehicleId: values.vehicleId,
      serviceId: values.serviceId,
      locationCity: values.locationCity,
      locationAddress: values.locationAddress,
      locationLat: values.locationLat,
      locationLng: values.locationLng,
      scheduledAt: buildScheduledAt(values.date, values.time),
      notes: values.notes,
    };

    try {
      await bookMobileService(payload);
      router.replace('/(tabs)/orders');
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
          <AppButton onPress={() => router.push('/add-vehicle')}>
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
      >
        <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerClassName="gap-5 px-5 py-5 pb-8"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
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
                onPress={() => setValue('vehicleId', v.id, { shouldValidate: true })}
                selected={selectedVehicleId === v.id}
                vehicle={v}
              />
            ))}
            {errors.vehicleId ? (
              <Text className="font-sans text-right text-sm text-red-600 dark:text-red-400">
                {errors.vehicleId.message}
              </Text>
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
              <Text className="font-sans text-right text-sm text-red-600 dark:text-red-400">
                {errors.serviceId.message}
              </Text>
            ) : null}
          </View>

          <SectionHeader
            subtitle={
              Platform.OS === 'web'
                ? 'على الويب أدخل الإحداثيات يدويًا أو استخدم موقعك الحالي.'
                : 'ثبّت الموقع على الخريطة أو اكتب العنوان يدويًا.'
            }
            title="موقع الخدمة"
          />

          <View className="gap-3 rounded-lg border border-line bg-card p-3 dark:border-dark-line dark:bg-dark-card">
            {Platform.OS === 'web' ? (
              <View className="gap-3">
                <Text className="font-sans text-right text-sm text-muted dark:text-dark-muted">
                  الخريطة التفاعلية متاحة في تطبيق iOS/Android. يمكنك إدخال الإحداثيات يدويًا هنا.
                </Text>
                <AppInput
                  inputMode="decimal"
                  keyboardType="decimal-pad"
                  label="خط العرض (Latitude)"
                  onChangeText={(value) => {
                    const latitude = Number.parseFloat(value);
                    const longitude = selectedLng;
                    if (Number.isFinite(latitude) && typeof longitude === 'number') {
                      void syncPickedLocation({ latitude, longitude });
                    } else {
                      setValue('locationLat', Number.isFinite(latitude) ? latitude : undefined);
                    }
                  }}
                  placeholder="24.7136"
                  textAlign="right"
                  value={selectedLat != null ? String(selectedLat) : ''}
                />
                <AppInput
                  inputMode="decimal"
                  keyboardType="decimal-pad"
                  label="خط الطول (Longitude)"
                  onChangeText={(value) => {
                    const longitude = Number.parseFloat(value);
                    const latitude = selectedLat;
                    if (Number.isFinite(longitude) && typeof latitude === 'number') {
                      void syncPickedLocation({ latitude, longitude });
                    } else {
                      setValue('locationLng', Number.isFinite(longitude) ? longitude : undefined);
                    }
                  }}
                  placeholder="46.6753"
                  textAlign="right"
                  value={selectedLng != null ? String(selectedLng) : ''}
                />
              </View>
            ) : (
              <View className="h-56 overflow-hidden rounded-lg border border-line dark:border-dark-line">
                <AppMapView
                  className="h-full w-full"
                  initialRegion={DEFAULT_MOBILE_REGION}
                  onPress={(event) => {
                    void handleMapPress(event);
                  }}
                  onRegionChangeComplete={setMapRegion}
                  region={mapRegion}
                >
                  {selectedCoordinate ? (
                    <AppMapMarker
                      coordinate={selectedCoordinate}
                      description="موقع الخدمة المختار"
                      draggable
                      onDragEnd={(event) => {
                        void syncPickedLocation(event.nativeEvent.coordinate);
                      }}
                      title="موقع الخدمة"
                    />
                  ) : null}
                </AppMapView>
              </View>
            )}

            <View className="flex-row-reverse items-center gap-3">
              <View className="flex-1">
                <Text className="font-sans text-right text-xs text-muted dark:text-dark-muted">
                  {locationMessage ??
                    (Platform.OS === 'web'
                      ? 'أدخل الإحداثيات أو اضغط «موقعي الحالي».'
                      : 'اضغط على الخريطة لتثبيت موقع الخدمة.')}
                </Text>
              </View>
              <AppButton onPress={handleUseCurrentLocation} variant="secondary">
                موقعي الحالي
              </AppButton>
            </View>
          </View>

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
            تأكيد الطلب
          </AppButton>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

export default function BookMobileRoute() {
  return (
    <RoleGate role="customer">
      <BookMobileScreen />
    </RoleGate>
  );
}
