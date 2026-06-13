import { Controller, useForm } from 'react-hook-form';
import {
 Keyboard,
 KeyboardAvoidingView,
 Platform,
 ScrollView,
 TouchableWithoutFeedback,
 View} from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';

import { vehicleSchema, type VehicleFormValues } from '@/features/vehicles/schemas/vehicleSchema';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';

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
 submitLabel = 'حفظ المركبة'}: VehicleFormProps) {
 const {
 control,
 handleSubmit,
 formState: { errors }} = useForm<VehicleFormValues>({
 resolver: zodResolver(vehicleSchema),
 defaultValues: {
 make: '',
 model: '',
 year: new Date().getFullYear(),
 plateNumber: '',
 color: '',
 mileage: undefined,
 documentUrl: undefined,
 ...initialValues}});

 return (
 <KeyboardAvoidingView
 behavior={Platform.OS === 'ios' ? 'padding' : undefined}
 className="flex-1"
 >
 <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
 <ScrollView
 className="flex-1"
 contentContainerClassName="pb-32 pt-stack-sm px-margin-mobile"
 keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
 keyboardShouldPersistTaps="handled"
 showsVerticalScrollIndicator={false}
 >
 {/* Form Card */}
 <View className="bg-surface-container-lowest rounded-2xl p-6 shadow-soft flex-col gap-stack-md">
 
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
 value={value}
 />
 )}
 />

 <View className="flex-row-reverse gap-gutter">
 <View className="flex-1">
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
 placeholder="YYYY"
 value={value ? String(value) : ''}
 />
 )}
 />
 </View>
 <View className="flex-1">
 <Controller
 control={control}
 name="color"
 render={({ field: { onBlur, onChange, value } }) => (
 <AppInput
 error={errors.color?.message}
 label="اللون"
 onBlur={onBlur}
 onChangeText={onChange}
 placeholder="أدخل اللون"
 value={value ?? ''}
 />
 )}
 />
 </View>
 </View>

 <Controller
 control={control}
 name="plateNumber"
 render={({ field: { onBlur, onChange, value } }) => (
 <AppInput
 error={errors.plateNumber?.message}
 label="رقم اللوحة"
 onBlur={onBlur}
 onChangeText={onChange}
 placeholder="ABC 1234"
 textAlign="left"
 value={value}
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
 label="رقم الهيكل (VIN) / عداد"
 optional={true}
 onBlur={onBlur}
 onChangeText={(v) => onChange(v ? parseInt(v, 10) : undefined)}
 placeholder="أدخل رقم الهيكل أو المسافة"
 textAlign="left"
 value={value !== undefined ? String(value) : ''}
 />
 )}
 />

 </View>
 </ScrollView>
 </TouchableWithoutFeedback>

 {/* Fixed Bottom Action Area */}
 <View className="absolute bottom-0 left-0 w-full px-margin-mobile py-4 bg-surface-container-lowest shadow-[0px_-4px_20px_rgba(0,0,0,0.04)] z-50 pb-8">
 <AppButton loading={isLoading} onPress={handleSubmit(onSubmit)}>
 {submitLabel}
 </AppButton>
 </View>
 </KeyboardAvoidingView>
 );
}
