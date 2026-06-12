import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, Switch, View } from 'react-native';

import {
 technicianSchema,
 type TechnicianFormValues,
} from '@/features/operations/schemas/technicianSchema';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';
import { AppText as Text } from '@/shared/components/AppText';

interface TechnicianFormProps {
 initialValues?: Partial<TechnicianFormValues>;
 onSubmit: (values: TechnicianFormValues) => Promise<void> | void;
 isLoading?: boolean;
 submitLabel?: string;
 showActiveToggle?: boolean;
}

export function TechnicianForm({
 initialValues,
 isLoading = false,
 onSubmit,
 showActiveToggle = false,
 submitLabel = 'حفظ',
}: TechnicianFormProps) {
 const {
 control,
 handleSubmit,
 formState: { errors },
 } = useForm<TechnicianFormValues>({
 resolver: zodResolver(technicianSchema),
 defaultValues: {
 fullName: initialValues?.fullName ?? '',
 phone: initialValues?.phone ?? '',
 specialties: initialValues?.specialties ?? '',
 isActive: initialValues?.isActive ?? true,
 },
 });

 return (
 <ScrollView className="flex-1" contentContainerClassName="gap-4 p-4">
 <Controller
 control={control}
 name="fullName"
 render={({ field: { onBlur, onChange, value } }) => (
 <AppInput
 error={errors.fullName?.message}
 label="اسم الفني"
 onBlur={onBlur}
 onChangeText={onChange}
 placeholder="مثال: أحمد العتيبي"
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
 label="رقم الجوال (اختياري)"
 onBlur={onBlur}
 onChangeText={onChange}
 placeholder="05xxxxxxxx"
 textAlign="right"
 value={value ?? ''}
 />
 )}
 />

 <Controller
 control={control}
 name="specialties"
 render={({ field: { onBlur, onChange, value } }) => (
 <AppInput
 error={errors.specialties?.message}
 label="التخصصات (اختياري)"
 onBlur={onBlur}
 onChangeText={onChange}
 placeholder="ميكانيك، كهرباء، تكييف"
 textAlign="right"
 value={value ?? ''}
 />
 )}
 />

 {showActiveToggle ? (
 <Controller
 control={control}
 name="isActive"
 render={({ field: { onChange, value } }) => (
 <View className="flex-row-reverse items-center justify-between rounded-lg border border-outline-variant bg-white p-4">
 <Text className="font-sans text-right text-sm font-semibold text-on-surface">
 فني نشط
 </Text>
 <Switch onValueChange={onChange} value={value ?? true} />
 </View>
 )}
 />
 ) : null}

 <AppButton loading={isLoading} onPress={handleSubmit(onSubmit)}>
 {submitLabel}
 </AppButton>
 </ScrollView>
 );
}
