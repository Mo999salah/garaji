import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { ProductForm } from '@/features/products/components/ProductForm';
import type { ProductFormValues } from '@/features/products/schemas/productSchema';
import { useProductStore } from '@/features/products/store/useProductStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const merchantId = user?.merchantId;
  const product = useProductStore((state) =>
    merchantId
      ? state.products.find((item) => item.id === id && item.merchantId === merchantId)
      : undefined,
  );
  const updateProduct = useProductStore((state) => state.updateProduct);

  const handleSubmit = async (values: ProductFormValues) => {
    if (!merchantId || !product) {
      return;
    }

    const updated = await updateProduct(product.id, merchantId, values);

    if (updated) {
      router.replace('/(merchant)/products');
    }
  };

  if (!merchantId || !product) {
    return (
      <ScreenContainer>
        <EmptyState
          title="Product not found"
          message="This product does not belong to the signed-in merchant."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="gap-5">
        <View>
          <Text className="text-sm font-semibold text-brand-700">Edit product</Text>
          <Text className="mt-2 text-3xl font-bold text-ink">{product.name}</Text>
          <Text className="mt-2 text-base leading-6 text-muted">
            Changes apply only to products owned by your merchant account.
          </Text>
        </View>

        <ProductForm
          defaultValues={{
            categoryId: product.categoryId,
            name: product.name,
            brand: product.brand,
            description: product.description,
            price: product.price,
            unit: product.unit,
            imageUrl: product.imageUrl ?? '',
            isActive: product.isActive,
          }}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
        />
      </View>
    </ScreenContainer>
  );
}
