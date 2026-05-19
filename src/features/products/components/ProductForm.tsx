import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Switch, Text, View } from 'react-native';

import { productCategories } from '@/features/products/data/mockProducts';
import {
  productFormSchema,
  type ProductFormInput,
  type ProductFormValues,
} from '@/features/products/schemas/productSchema';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';

interface ProductFormProps {
  defaultValues?: Partial<ProductFormInput>;
  submitLabel: string;
  onSubmit: (values: ProductFormValues) => void;
}

const editableCategories = productCategories.filter((category) => category.id !== 'all');

const baseDefaults: ProductFormInput = {
  categoryId: 'brakes',
  name: '',
  brand: '',
  description: '',
  price: 1,
  unit: 'piece',
  imageUrl: '',
  isActive: true,
};

export function ProductForm({ defaultValues, onSubmit, submitLabel }: ProductFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { ...baseDefaults, ...defaultValues },
  });

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="name"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            autoCapitalize="words"
            error={errors.name?.message}
            label="Product name"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Ceramic Brake Pad Set"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="brand"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            autoCapitalize="words"
            error={errors.brand?.message}
            label="Brand"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Akebono"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="categoryId"
        render={({ field: { onChange, value } }) => (
          <View className="gap-2">
            <Text className="text-sm font-semibold text-ink">Category</Text>
            <View className="flex-row flex-wrap gap-2">
              {editableCategories.map((category) => {
                const selected = category.id === value;

                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    className={`min-h-11 justify-center rounded-lg border px-4 ${
                      selected ? 'border-brand-600 bg-brand-50' : 'border-line bg-white'
                    }`}
                    key={category.id}
                    onPress={() => onChange(category.id)}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        selected ? 'text-brand-700' : 'text-ink'
                      }`}
                    >
                      {category.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {errors.categoryId?.message ? (
              <Text className="text-sm text-red-600">{errors.categoryId.message}</Text>
            ) : null}
          </View>
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            error={errors.description?.message}
            label="Description"
            multiline
            numberOfLines={4}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Describe fitment, packaging, and merchant terms."
            textAlignVertical="top"
            value={value}
          />
        )}
      />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Controller
            control={control}
            name="price"
            render={({ field: { onBlur, onChange, value } }) => (
              <AppInput
                error={errors.price?.message}
                keyboardType="decimal-pad"
                label="Price"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="42.50"
                value={String(value)}
              />
            )}
          />
        </View>
        <View className="flex-1">
          <Controller
            control={control}
            name="unit"
            render={({ field: { onBlur, onChange, value } }) => (
              <AppInput
                error={errors.unit?.message}
                label="Unit"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="piece"
                value={value}
              />
            )}
          />
        </View>
      </View>

      <Controller
        control={control}
        name="imageUrl"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            autoCapitalize="none"
            error={errors.imageUrl?.message}
            label="Image URL"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Optional"
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="isActive"
        render={({ field: { onChange, value } }) => (
          <View className="min-h-12 flex-row items-center justify-between rounded-lg border border-line bg-white px-4">
            <View>
              <Text className="text-base font-semibold text-ink">Active product</Text>
              <Text className="text-sm text-muted">Visible in the customer catalog</Text>
            </View>
            <Switch
              accessibilityLabel="Active product"
              onValueChange={onChange}
              thumbColor="#FFFFFF"
              trackColor={{ false: '#DDE5E1', true: '#22A45D' }}
              value={value}
            />
          </View>
        )}
      />

      <AppButton loading={isSubmitting} onPress={handleSubmit(onSubmit)}>
        {submitLabel}
      </AppButton>
    </View>
  );
}
