import { Controller, useForm } from 'react-hook-form';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';

import { serviceSchema, type ServiceFormValues } from '@/features/services/schemas/serviceSchema';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';
import type { ServiceType } from '@/features/services/types';

interface ServiceFormProps {
  initialValues?: Partial<ServiceFormValues>;
  onSubmit: (values: ServiceFormValues) => Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
}

const SERVICE_TYPE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: 'branch', label: 'في الفرع فقط' },
  { value: 'mobile', label: 'بالموقع فقط' },
  { value: 'both', label: 'كلاهما' },
];

export function ServiceForm({
  initialValues,
  isLoading,
  onSubmit,
  submitLabel = 'حفظ',
}: ServiceFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      serviceType: 'both',
      estimatedPrice: undefined,
      durationMinutes: undefined,
      isActive: true,
      sortOrder: 0,
      ...initialValues,
    },
  });

  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-4 p-4">
      <Controller
        control={control}
        name="name"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            error={errors.name?.message}
            label="اسم الخدمة"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="مثال: تغيير الزيت والفلتر"
            textAlign="right"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            error={errors.description?.message}
            label="الوصف (اختياري)"
            multiline
            numberOfLines={3}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="وصف مختصر للخدمة..."
            textAlign="right"
            value={value ?? ''}
          />
        )}
      />

      <Controller
        control={control}
        name="serviceType"
        render={({ field: { onChange, value } }) => (
          <View className="gap-2">
            <Text className="text-sm font-semibold text-ink">نوع الخدمة</Text>
            <View className="flex-row gap-2">
              {SERVICE_TYPE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  accessibilityRole="radio"
                  className={[
                    'flex-1 rounded-lg border px-3 py-2.5',
                    value === opt.value ? 'border-brand-600 bg-brand-50' : 'border-line bg-white',
                  ].join(' ')}
                  key={opt.value}
                  onPress={() => onChange(opt.value)}
                >
                  <Text
                    className={`text-center text-xs font-semibold ${
                      value === opt.value ? 'text-brand-700' : 'text-ink'
                    }`}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.serviceType ? (
              <Text className="text-sm text-red-600">{errors.serviceType.message}</Text>
            ) : null}
          </View>
        )}
      />

      <Controller
        control={control}
        name="estimatedPrice"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            error={errors.estimatedPrice?.message}
            keyboardType="decimal-pad"
            label="السعر التقديري (ر.س) — اختياري"
            onBlur={onBlur}
            onChangeText={(v) => onChange(v ? parseFloat(v) : undefined)}
            placeholder="مثال: 150"
            textAlign="right"
            value={value !== undefined ? String(value) : ''}
          />
        )}
      />

      <Controller
        control={control}
        name="durationMinutes"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            error={errors.durationMinutes?.message}
            keyboardType="number-pad"
            label="المدة التقديرية (بالدقائق) — اختياري"
            onBlur={onBlur}
            onChangeText={(v) => onChange(v ? parseInt(v, 10) : undefined)}
            placeholder="مثال: 60"
            textAlign="right"
            value={value !== undefined ? String(value) : ''}
          />
        )}
      />

      <Controller
        control={control}
        name="sortOrder"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            error={errors.sortOrder?.message}
            keyboardType="number-pad"
            label="ترتيب العرض"
            onBlur={onBlur}
            onChangeText={(v) => onChange(v ? parseInt(v, 10) : 0)}
            textAlign="right"
            value={String(value)}
          />
        )}
      />

      <AppButton loading={isLoading} onPress={handleSubmit(onSubmit)}>
        {submitLabel}
      </AppButton>
    </ScrollView>
  );
}
