import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';

import { vehicleSchema, type VehicleFormValues } from '@/features/vehicles/schemas/vehicleSchema';
import { uploadVehicleDocument } from '@/features/vehicles/services/supabaseVehicleService';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';

import { AppText as Text } from '@/shared/components/AppText';

interface PickedVehicleImage {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  isRemote?: boolean;
}

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
  const [selectedImage, setSelectedImage] = useState<PickedVehicleImage | null>(
    initialValues?.documentUrl
      ? {
          uri: initialValues.documentUrl,
          isRemote: true,
        }
      : null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
      documentUrl: undefined,
      ...initialValues,
    },
  });

  const pickFromLibrary = async () => {
    setUploadError(null);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'إذن الصور مطلوب',
          'نحتاج إذن الوصول للصور حتى تتمكن من إرفاق صورة الاستمارة أو المركبة.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];
      setSelectedImage({
        uri: asset.uri,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      });
    } catch {
      setUploadError('تعذّر فتح مكتبة الصور. حاول مرة أخرى.');
    }
  };

  const takePhoto = async () => {
    setUploadError(null);

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'إذن الكاميرا مطلوب',
          'نحتاج إذن الكاميرا حتى تتمكن من تصوير الاستمارة أو المركبة.',
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];
      setSelectedImage({
        uri: asset.uri,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      });
    } catch {
      setUploadError('تعذّر فتح الكاميرا. حاول مرة أخرى.');
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setUploadError(null);
  };

  const submitWithDocumentUpload = async (values: VehicleFormValues) => {
    setUploadError(null);

    try {
      setIsUploading(Boolean(selectedImage && !selectedImage.isRemote));

      const documentUrl =
        selectedImage && !selectedImage.isRemote
          ? await uploadVehicleDocument(selectedImage)
          : selectedImage?.uri;

      await onSubmit({
        ...values,
        documentUrl,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'تعذّر رفع الصورة أو حفظ بيانات المركبة. حاول مرة أخرى.';
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
    >
      <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-4 p-4 pb-8"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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

          <View className="gap-3">
            <Text className="font-sans text-right text-sm font-semibold text-ink dark:text-dark-ink">
              ارفاق صورة الاستمارة / المركبة (اختياري)
            </Text>

            <View className="rounded-lg border border-dashed border-line bg-card p-4 dark:border-dark-line dark:bg-dark-card">
              {selectedImage ? (
                <View className="overflow-hidden rounded-lg border border-line bg-surface-soft dark:border-dark-line dark:bg-dark-surface">
                  <Image
                    accessibilityLabel="معاينة صورة المركبة"
                    className="h-40 w-full"
                    resizeMode="cover"
                    source={{ uri: selectedImage.uri }}
                  />
                  <TouchableOpacity
                    accessibilityRole="button"
                    className="absolute left-3 top-3 rounded-lg bg-red-600 px-3 py-1.5 shadow-sm shadow-red-900/20"
                    onPress={removeSelectedImage}
                  >
                    <Text className="font-sans text-xs font-bold text-white">حذف</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="items-center gap-2 py-3">
                  <View className="h-12 w-12 items-center justify-center rounded-lg bg-brand-50 dark:bg-dark-brand-50">
                    <Text className="font-sans text-lg font-black text-brand-500 dark:text-dark-brand-500">
                      ص
                    </Text>
                  </View>
                  <Text className="font-sans text-center text-sm font-medium text-ink dark:text-dark-ink">
                    أضف صورة واضحة للاستمارة أو المركبة.
                  </Text>
                  <Text className="font-sans text-center text-xs text-muted dark:text-dark-muted">
                    JPG أو PNG أو WebP، ويفضّل أن تكون الصورة مضاءة وواضحة.
                  </Text>
                </View>
              )}

              <View className="mt-4 flex-row-reverse gap-2">
                <View className="flex-1">
                  <AppButton
                    disabled={isUploading || isLoading}
                    onPress={pickFromLibrary}
                    variant="secondary"
                  >
                    من الصور
                  </AppButton>
                </View>
                <View className="flex-1">
                  <AppButton
                    disabled={isUploading || isLoading}
                    onPress={takePhoto}
                    variant="secondary"
                  >
                    الكاميرا
                  </AppButton>
                </View>
              </View>
            </View>
          </View>

          {Object.keys(errors).length > 0 && (
            <View className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500 dark:bg-red-950/30">
              <Text className="font-sans text-right text-sm text-red-700 dark:text-red-400">
                يرجى تصحيح الأخطاء أعلاه.
              </Text>
            </View>
          )}

          {uploadError ? (
            <View className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500 dark:bg-red-950/30">
              <Text className="font-sans text-right text-sm text-red-700 dark:text-red-400">
                {uploadError}
              </Text>
            </View>
          ) : null}

          {isUploading ? (
            <Text className="font-sans text-center text-sm font-medium text-muted dark:text-dark-muted">
              جارٍ رفع الصورة...
            </Text>
          ) : null}

          <AppButton loading={isLoading || isUploading} onPress={handleSubmit(submitWithDocumentUpload)}>
            {submitLabel}
          </AppButton>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
