import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, TouchableOpacity, View } from 'react-native';

import {
  maintenancePlanSchema,
  type MaintenancePlanFormValues,
} from '@/features/operations/schemas/maintenancePlanSchema';
import type { Vehicle } from '@/features/vehicles/types';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';
import { AppText as Text } from '@/shared/components/AppText';

interface MaintenancePlanFormProps {
  vehicles: Vehicle[];
  onSubmit: (values: MaintenancePlanFormValues) => Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
  getVehicleLabel?: (vehicle: Vehicle) => string;
  initialValues?: Partial<MaintenancePlanFormValues>;
  lockVehicle?: boolean;
}

function defaultVehicleLabel(vehicle: Vehicle): string {
  return `${vehicle.make} ${vehicle.model}`;
}

export function MaintenancePlanForm({
  getVehicleLabel = defaultVehicleLabel,
  initialValues,
  isLoading,
  lockVehicle = false,
  onSubmit,
  submitLabel = 'حفظ الخطة',
  vehicles,
}: MaintenancePlanFormProps) {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MaintenancePlanFormValues>({
    resolver: zodResolver(maintenancePlanSchema),
    defaultValues: {
      vehicleId: initialValues?.vehicleId ?? vehicles[0]?.id ?? '',
      title: initialValues?.title ?? '',
      intervalKm: initialValues?.intervalKm ?? '',
      intervalMonths: initialValues?.intervalMonths ?? '',
      lastServiceMileage: initialValues?.lastServiceMileage ?? '',
      lastServiceAt: initialValues?.lastServiceAt ?? '',
      nextDueMileage: initialValues?.nextDueMileage ?? '',
      nextDueAt: initialValues?.nextDueAt ?? '',
      notes: initialValues?.notes ?? '',
    },
  });

  const selectedVehicleId = watch('vehicleId');
  const lockedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId);

  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-4 p-4">
      {lockVehicle && lockedVehicle ? (
        <View className="gap-2">
          <Text className="font-sans text-right text-sm font-semibold text-ink dark:text-dark-ink">
            المركبة
          </Text>
          <Text className="font-sans text-right text-base font-bold text-ink dark:text-dark-ink">
            {getVehicleLabel(lockedVehicle)}
          </Text>
        </View>
      ) : (
        <View className="gap-2">
          <Text className="font-sans text-right text-sm font-semibold text-ink dark:text-dark-ink">
            المركبة
          </Text>
          <View className="flex-row-reverse flex-wrap gap-2">
            {vehicles.map((vehicle) => {
              const selected = vehicle.id === selectedVehicleId;
              return (
                <TouchableOpacity
                  key={vehicle.id}
                  className={`rounded-lg border px-3 py-2 ${selected ? 'border-brand-500 bg-brand-50 dark:border-dark-brand-500 dark:bg-dark-brand-50' : 'border-line dark:border-dark-line'}`}
                  onPress={() => setValue('vehicleId', vehicle.id, { shouldValidate: true })}
                >
                  <Text
                    className={`font-sans text-sm ${selected ? 'font-bold text-brand-700 dark:text-dark-brand-500' : 'text-muted dark:text-dark-muted'}`}
                  >
                    {getVehicleLabel(vehicle)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.vehicleId?.message ? (
            <Text className="font-sans text-right text-xs text-red-500">{errors.vehicleId.message}</Text>
          ) : null}
        </View>
      )}

      <Controller
        control={control}
        name="title"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            error={errors.title?.message}
            label="عنوان الخطة"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="مثال: تغيير زيت المحرك"
            textAlign="right"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="intervalKm"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            error={errors.intervalKm?.message}
            keyboardType="number-pad"
            label="التكرار (كم)"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="مثال: 5000"
            textAlign="right"
            value={value ?? ''}
          />
        )}
      />

      <Controller
        control={control}
        name="intervalMonths"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            error={errors.intervalMonths?.message}
            keyboardType="number-pad"
            label="التكرار (أشهر)"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="مثال: 6"
            textAlign="right"
            value={value ?? ''}
          />
        )}
      />

      <Controller
        control={control}
        name="nextDueAt"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            error={errors.nextDueAt?.message}
            label="الموعد القادم (YYYY-MM-DD)"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="2026-12-01"
            textAlign="right"
            value={value ?? ''}
          />
        )}
      />

      <Controller
        control={control}
        name="nextDueMileage"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            error={errors.nextDueMileage?.message}
            keyboardType="number-pad"
            label="العداد القادم (كم)"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="مثال: 85000"
            textAlign="right"
            value={value ?? ''}
          />
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
            placeholder="تفاصيل إضافية عن الخطة..."
            textAlign="right"
            value={value ?? ''}
          />
        )}
      />

      <AppButton loading={isLoading} onPress={handleSubmit(onSubmit)}>
        {submitLabel}
      </AppButton>
    </ScrollView>
  );
}
