import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { ProductForm } from '@/features/products/components/ProductForm';
import type { ProductFormValues } from '@/features/products/schemas/productSchema';
import { useProductStore } from '@/features/products/store/useProductStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function NewProductScreen() {
  const user = useAuthStore((state) => state.user);
  const addProduct = useProductStore((state) => state.addProduct);
  const merchantId = user?.merchantId;

  const handleSubmit = async (values: ProductFormValues) => {
    if (!merchantId) {
      return;
    }

    await addProduct(merchantId, values);
    router.replace('/(merchant)/products');
  };

  if (!merchantId) {
    return (
      <ScreenContainer>
        <EmptyState title="Session required" message="Sign in again to manage products." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="gap-5">
        <View>
          <Text className="text-sm font-semibold text-brand-700">New product</Text>
          <Text className="mt-2 text-3xl font-bold text-ink">Add inventory</Text>
          <Text className="mt-2 text-base leading-6 text-muted">
            Product ownership is assigned from your signed-in merchant session.
          </Text>
        </View>

        <ProductForm onSubmit={handleSubmit} submitLabel="Create product" />
      </View>
    </ScreenContainer>
  );
}
