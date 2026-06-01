import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Pressable, Switch, Text, View } from 'react-native';

import { useProductStore } from '@/features/products/store/useProductStore';
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

const baseDefaults: ProductFormInput = {
  categoryId: '',
  name: '',
  brand: '',
  partNumber: '',
  description: '',
  vehicleMake: '',
  vehicleModel: '',
  yearStart: '',
  yearEnd: '',
  price: 1,
  unit: 'piece',
  stockQuantity: '',
  minOrderQuantity: 1,
  imageUrl: '',
  isActive: true,
};

export function ProductForm({ defaultValues, onSubmit, submitLabel }: ProductFormProps) {
  const categories = useProductStore((state) => state.categories);
  const editableCategories = categories.filter((category) => category.id !== 'all');
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      ...baseDefaults,
      categoryId: editableCategories[0]?.id ?? '',
      ...defaultValues,
    },
  });
  const selectedCategoryId = useWatch({ control, name: 'categoryId' });

  useEffect(() => {
    if (!editableCategories.length) {
      return;
    }

    const categoryExists = editableCategories.some(
      (category) => category.id === selectedCategoryId,
    );

    if (!selectedCategoryId || !categoryExists) {
      setValue('categoryId', editableCategories[0].id, { shouldValidate: true });
    }
  }, [editableCategories, selectedCategoryId, setValue]);

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
        name="partNumber"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            autoCapitalize="characters"
            error={errors.partNumber?.message}
            label="Part number"
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="ACT1089"
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
            {editableCategories.length ? (
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
            ) : (
              <Text className="rounded-lg border border-line bg-white p-4 text-sm text-muted">
                Categories are still loading. Apply Supabase migrations and seed categories before
                creating products.
              </Text>
            )}
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

      <View className="gap-3 rounded-lg border border-line bg-white p-4">
        <Text className="text-base font-semibold text-ink">Vehicle fitment</Text>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Controller
              control={control}
              name="vehicleMake"
              render={({ field: { onBlur, onChange, value } }) => (
                <AppInput
                  autoCapitalize="words"
                  error={errors.vehicleMake?.message}
                  label="Make"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Toyota"
                  value={value}
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="vehicleModel"
              render={({ field: { onBlur, onChange, value } }) => (
                <AppInput
                  autoCapitalize="words"
                  error={errors.vehicleModel?.message}
                  label="Model"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Hiace"
                  value={value}
                />
              )}
            />
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Controller
              control={control}
              name="yearStart"
              render={({ field: { onBlur, onChange, value } }) => (
                <AppInput
                  error={errors.yearStart?.message}
                  inputMode="numeric"
                  keyboardType="number-pad"
                  label="From year"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="2016"
                  value={String(value ?? '')}
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="yearEnd"
              render={({ field: { onBlur, onChange, value } }) => (
                <AppInput
                  error={errors.yearEnd?.message}
                  inputMode="numeric"
                  keyboardType="number-pad"
                  label="To year"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="2025"
                  value={String(value ?? '')}
                />
              )}
            />
          </View>
        </View>
      </View>

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

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Controller
            control={control}
            name="stockQuantity"
            render={({ field: { onBlur, onChange, value } }) => (
              <AppInput
                error={errors.stockQuantity?.message}
                inputMode="numeric"
                keyboardType="number-pad"
                label="Stock"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="24"
                value={String(value ?? '')}
              />
            )}
          />
        </View>
        <View className="flex-1">
          <Controller
            control={control}
            name="minOrderQuantity"
            render={({ field: { onBlur, onChange, value } }) => (
              <AppInput
                error={errors.minOrderQuantity?.message}
                inputMode="numeric"
                keyboardType="number-pad"
                label="Minimum order"
                onBlur={onBlur}
                onChangeText={onChange}
                placeholder="1"
                value={String(value)}
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

      <AppButton
        disabled={!editableCategories.length}
        loading={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      >
        {submitLabel}
      </AppButton>
    </View>
  );
}
