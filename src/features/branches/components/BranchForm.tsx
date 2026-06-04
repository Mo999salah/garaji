import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, Switch, Text, View } from 'react-native';

import { branchSchema, type BranchFormValues } from '@/features/branches/schemas/branchSchema';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';

interface BranchFormProps {
  initialValues?: Partial<BranchFormValues>;
  onSubmit: (values: BranchFormValues) => Promise<void> | void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function BranchForm({
  initialValues,
  isLoading = false,
  onSubmit,
  submitLabel = 'حفظ',
}: BranchFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      city: initialValues?.city ?? '',
      address: initialValues?.address ?? '',
      phone: initialValues?.phone ?? '',
      workingHours: initialValues?.workingHours ?? '',
      isActive: initialValues?.isActive ?? true,
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
            label="اسم الفرع"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="مثال: فرع الرياض"
            textAlign="right"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="city"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            error={errors.city?.message}
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
        name="address"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            error={errors.address?.message}
            label="العنوان"
            multiline
            numberOfLines={2}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="مثال: حي النرجس، شارع الملك فهد"
            textAlign="right"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            error={errors.phone?.message}
            keyboardType="phone-pad"
            label="رقم الهاتف (اختياري)"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="مثال: 0501234567"
            textAlign="right"
            value={value ?? ''}
          />
        )}
      />

      <Controller
        control={control}
        name="workingHours"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            error={errors.workingHours?.message}
            label="ساعات العمل (اختياري)"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="مثال: السبت – الخميس، 8 ص – 6 م"
            textAlign="right"
            value={value ?? ''}
          />
        )}
      />

      <Controller
        control={control}
        name="isActive"
        render={({ field: { onChange, value } }) => (
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium text-ink">الفرع نشط</Text>
            <Switch onValueChange={onChange} value={value} />
          </View>
        )}
      />

      <AppButton loading={isLoading} onPress={handleSubmit(onSubmit)}>
        {submitLabel}
      </AppButton>
    </ScrollView>
  );
}
