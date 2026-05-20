import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { ProductCard } from '@/features/products/components/ProductCard';
import { getMerchantProducts } from '@/features/products/selectors/productSelectors';
import { useProductStore } from '@/features/products/store/useProductStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function MerchantProductsScreen() {
  const user = useAuthStore((state) => state.user);
  const products = useProductStore((state) => state.products);
  const toggleProductActive = useProductStore((state) => state.toggleProductActive);
  const merchantId = user?.merchantId;
  const merchantProducts = useMemo(
    () => (merchantId ? getMerchantProducts(products, merchantId) : []),
    [merchantId, products],
  );

  return (
    <ScreenContainer>
      <View className="gap-5">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-brand-700">Inventory</Text>
            <Text className="mt-2 text-3xl font-bold text-ink">Products</Text>
            <Text className="mt-2 text-base leading-6 text-muted">
              Manage products attached to your authenticated merchant account.
            </Text>
          </View>
          <AppButton onPress={() => router.push('/(merchant)/products/new' as Href)}>
            Add
          </AppButton>
        </View>

        <View className="gap-3">
          {merchantProducts.length > 0 ? (
            merchantProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                rightSlot={
                  <View className="flex-row gap-2">
                    <AppButton
                      accessibilityLabel={`Edit ${product.name}`}
                      onPress={() => router.push(`/(merchant)/products/${product.id}/edit` as Href)}
                      variant="ghost"
                    >
                      Edit
                    </AppButton>
                    <AppButton
                      accessibilityLabel={`${product.isActive ? 'Deactivate' : 'Activate'} ${
                        product.name
                      }`}
                      onPress={() => {
                        if (merchantId) {
                          void toggleProductActive(product.id, merchantId);
                        }
                      }}
                      variant="secondary"
                    >
                      {product.isActive ? 'Pause' : 'Activate'}
                    </AppButton>
                  </View>
                }
                showStatus
              />
            ))
          ) : (
            <EmptyState
              title="No products yet"
              message="Create your first product to make it available for customer ordering."
            />
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
