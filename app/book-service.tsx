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
 View,
 Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { z } from 'zod';

import { AnimatedPressable } from '@/shared/components/AnimatedPressable';
import { AppColors } from '@/shared/lib/colors';
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
import { AppInput } from '@/shared/components/AppInput';
import { AppHeader } from '@/shared/components/AppHeader';
import { AppButton } from '@/shared/components/AppButton';
import {
 AppMapMarker,
 AppMapView,
 type AppMapCoordinate,
 type AppMapPressEvent,
 type AppMapRegion,
} from '@/shared/components/AppMap';
import { AppText as Text } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';

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

function formatDisplayDate(dateStr: string): string {
 if (!dateStr || Number.isNaN(Date.parse(`${dateStr}T00:00:00`))) return '';
 return new Date(`${dateStr}T00:00:00`).toLocaleDateString('ar-SA', {
 weekday: 'long',
 year: 'numeric',
 month: 'long',
 day: 'numeric',
 });
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

 const syncPickedLocation = async (coordinate: AppMapCoordinate) => {
 setValue('locationLat', coordinate.latitude);
 setValue('locationLng', coordinate.longitude);
 setMapRegion({
 latitude: coordinate.latitude,
 longitude: coordinate.longitude,
 latitudeDelta: 0.02,
 longitudeDelta: 0.02,
 });
 setLocationMessage('تم تثبيت الموقع بنجاح');

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
 setLocationMessage('تم تثبيت الموقع، الرجاء إكمال العنوان يدوياً');
 }
 };

 const handleUseCurrentLocation = async () => {
 try {
 const permission = await Location.requestForegroundPermissionsAsync();

 if (permission.status !== Location.PermissionStatus.GRANTED) {
 setLocationMessage('لم يتم منح إذن الموقع.');
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
 setLocationMessage('تعذّر تحديد موقعك الحالي.');
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
 <View className="flex-1 bg-background">
 <AppHeader title="خدمة بالموقع" onBack={() => router.back()} />
 <EmptyState
 message="يجب إضافة سيارة أولاً قبل طلب الخدمة."
 title="لا توجد سيارات"
 />
 <View className="mt-4 px-margin-mobile">
 <AppButton label="إضافة سيارة" onPress={() => router.push('/add-vehicle')} />
 </View>
 </View>
 );
 }

 const STEPS = ['الموقع', 'السيارة', 'الخدمة', 'التأكيد'];
 const currentStepNum = locationCity && selectedVehicleId && selectedServiceId && selectedTime ? 4
 : locationCity && selectedVehicleId && selectedServiceId ? 3
 : locationCity && selectedVehicleId ? 2
 : 1;

 return (
 <View className="flex-1 bg-background pb-[100px]">
 <AppHeader title="خدمة بالموقع" onBack={() => router.back()} />

 <KeyboardAvoidingView
 behavior={Platform.OS === 'ios' ? 'padding' : undefined}
 className="flex-1"
 >
 <Pressable accessible={false} onPress={Keyboard.dismiss} style={{ flex: 1 }}>
 <ScrollView
 contentContainerClassName="pt-stack-md flex-grow"
 keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
 keyboardShouldPersistTaps="handled"
 showsVerticalScrollIndicator={false}
 >
 {/* Progress Indicator */}
 <View className="mb-stack-lg px-margin-mobile">
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
  <MaterialIcons name="check" size={16} color={AppColors.onPrimary} />
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

 {/* Map Section */}
 <View className="relative mb-stack-lg">
 {Platform.OS === 'web' ? (
  <View
          className="w-full h-48 bg-surface-container-high relative overflow-hidden flex items-center justify-center"
          accessibilityLabel="الخريطة غير متاحة على الويب"
          accessibilityRole="image"
        >
          <MaterialIcons name="map" size={48} color={AppColors.outlineVariant} />
        </View>
 ) : (
 <View className="w-full h-48 bg-surface-container-high relative overflow-hidden">
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

 {/* Location Card overlaid */}
 <View className="px-margin-mobile -mt-8 relative z-10">
 <View className="bg-surface-container-lowest rounded-2xl shadow-soft p-4 flex-row-reverse items-center justify-between border border-surface-container/50">
 <View className="flex-col items-end flex-1">
 <Text className="font-label-sm text-label-sm text-on-surface-variant mb-1">موقع الخدمة</Text>
  <Text className="text-body-md font-bold text-on-surface text-right" numberOfLines={1}>
 {locationCity ? `${locationCity}${watch('locationAddress') ? `، ${watch('locationAddress')}` : ''}` : 'الرجاء تحديد الموقع'}
 </Text>
 {locationMessage ? (
  <Text className="font-label-sm text-label-sm text-primary mt-1">{locationMessage}</Text>
 ) : null}
 </View>
  <AnimatedPressable
            onPress={handleUseCurrentLocation}
            accessibilityLabel="تحديد الموقع تلقائياً"
            accessibilityHint="استخدام موقع الجهاز الحالي"
            accessibilityRole="button"
            className="mr-4 px-2 py-1 rounded-lg"
          >
            <Text className="text-primary font-label-sm text-label-sm font-bold">تحديد تلقائي</Text>
          </AnimatedPressable>
 </View>
 </View>
 </View>

 {/* Address Form Inputs (Fallback / Manual adjustment) */}
 <View className="px-margin-mobile gap-stack-md mb-stack-lg">
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
 {Platform.OS === 'web' ? (
 <>
 <Controller
 control={control}
 name="locationLat"
 render={({ field: { value } }) => (
 <AppInput
 label="خط العرض (Latitude)"
 inputMode="decimal"
 keyboardType="decimal-pad"
 onChangeText={(v) => {
 const num = Number.parseFloat(v);
 setValue('locationLat', Number.isFinite(num) ? num : undefined);
 }}
 placeholder="24.7136"
 textAlign="right"
 value={value != null ? String(value) : ''}
 />
 )}
 />
 <Controller
 control={control}
 name="locationLng"
 render={({ field: { value } }) => (
 <AppInput
 label="خط الطول (Longitude)"
 inputMode="decimal"
 keyboardType="decimal-pad"
 onChangeText={(v) => {
 const num = Number.parseFloat(v);
 setValue('locationLng', Number.isFinite(num) ? num : undefined);
 }}
 placeholder="46.6753"
 textAlign="right"
 value={value != null ? String(value) : ''}
 />
 )}
 />
 </>
 ) : null}
 </View>

 <View className="gap-stack-md px-margin-mobile mb-stack-lg">
  <Text className="text-title-md text-on-surface text-right font-bold mb-2">اختر السيارة</Text>
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

 <View className="gap-stack-md px-margin-mobile mb-stack-lg">
  <Text className="text-title-md text-on-surface text-right font-bold mb-2">اختر الخدمة</Text>
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

 <View className="gap-stack-md px-margin-mobile mb-stack-lg pb-10">
  <Text className="text-title-md text-on-surface text-right font-bold mb-2">الموعد</Text>
  <Controller
          control={control}
          name="date"
          render={({ field: { onBlur, onChange, value } }) => (
            <View className="gap-2">
              <AppInput
                error={errors.date?.message}
                label="اليوم"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder={todayStr}
                textAlign="right"
                value={value}
                accessibilityLabel="تاريخ الموعد (YYYY-MM-DD)"
              />
              {value ? (
                <Text className="font-label-sm text-label-sm text-on-surface-variant text-right">
                  {formatDisplayDate(value)}
                </Text>
              ) : null}
            </View>
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
                <AnimatedPressable
                  accessibilityLabel={`الساعة ${slot}`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => onChange(slot)}
                  className={`rounded-2xl border px-4 py-2.5 min-h-11 items-center justify-center ${
                    isSelected
                      ? 'border-primary bg-primary-container/10'
                      : 'border-outline-variant bg-surface-container-lowest'
                  }`}
                  key={slot}
                >
                  <Text
                    className={`font-label-sm text-label-sm font-bold ${
                      isSelected ? 'text-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    {slot}
                  </Text>
                </AnimatedPressable>
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
 placeholder="أي تفاصيل إضافية حول موقعك..."
 textAlign="right"
 value={value ?? ''}
 />
 )}
 />
 </View>

 </ScrollView>
 </Pressable>
 </KeyboardAvoidingView>

      <View className="absolute bottom-0 left-0 right-0 bg-surface-container-lowest px-margin-mobile py-4 shadow-elevated z-40 rounded-t-2xl">
        <AppButton
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          loading={isLoading}
          size="lg"
          label="تأكيد الطلب"
          accessibilityLabel="تأكيد طلب الخدمة بالموقع"
          icon={
            <MaterialIcons name="arrow-back" size={20} color={AppColors.onPrimary} />
          }
        />
      </View>
 </View>
 );
}

export default function BookMobileRoute() {
 return (
 <RoleGate role="customer">
 <BookMobileScreen />
 </RoleGate>
 );
}
