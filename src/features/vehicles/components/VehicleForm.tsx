import { Controller, useForm } from 'react-hook-form';
import { ScrollView, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';

import { vehicleSchema, type VehicleFormValues } from '@/features/vehicles/schemas/vehicleSchema';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';

import { AppText as Text } from '@/shared/components/AppText';
interface VehicleFormProps {
  initialValues?: Partial<VehicleFormValues>;
  onSubmit: (values: VehicleFormValues) => Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
}

export function VehicleForm({
  initialValues,
  isLoading,
  onSubmit,
  submitLabel = 'حفظ',
}: VehicleFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      plateNumber: '',
      color: '',
      mileage: undefined,
      ...initialValues,
    },
  });

  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-4 p-4">
      <Controller
        control={control}
        name="make"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            error={errors.make?.message}
            label="الشركة المصنعة"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="مثال: تويوتا"
            textAlign="right"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="model"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            error={errors.model?.message}
            label="الموديل"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="مثال: كامري"
            textAlign="right"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="year"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            error={errors.year?.message}
            keyboardType="number-pad"
            label="سنة الصنع"
            maxLength={4}
            onBlur={onBlur}
            onChangeText={(v) => onChange(v ? parseInt(v, 10) : undefined)}
            placeholder={String(new Date().getFullYear())}
            textAlign="right"
            value={value ? String(value) : ''}
          />
        )}
      />

      <Controller
        control={control}
        name="plateNumber"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            error={errors.plateNumber?.message}
            label="رقم اللوحة"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="مثال: أ ب ج 1234"
            textAlign="right"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="color"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            error={errors.color?.message}
            label="اللون (اختياري)"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="مثال: أبيض"
            textAlign="right"
            value={value ?? ''}
          />
        )}
      />

      <Controller
        control={control}
        name="mileage"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            error={errors.mileage?.message}
            keyboardType="number-pad"
            label="عداد المسافة (كم) — اختياري"
            onBlur={onBlur}
            onChangeText={(v) => onChange(v ? parseInt(v, 10) : undefined)}
            placeholder="مثال: 45000"
            textAlign="right"
            value={value !== undefined ? String(value) : ''}
          />
        )}
      />

      {Object.keys(errors).length > 0 && (
        <View className="rounded-lg border border-red-200 bg-red-50 p-3">
          <Text className="font-sans text-sm text-red-700">يرجى تصحيح الأخطاء أعلاه.</Text>
        </View>
      )}

      <AppButton loading={isLoading} onPress={handleSubmit(onSubmit)}>
        {submitLabel}
      </AppButton>
    </ScrollView>
  );
}
