import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { ProductCard } from '@/features/products/components/ProductCard';
import {
  filterProducts,
  getMerchantProducts,
  type ProductFilters,
} from '@/features/products/selectors/productSelectors';
import { useProductStore } from '@/features/products/store/useProductStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { AppButton } from '@/shared/components/AppButton';
import { AppInput } from '@/shared/components/AppInput';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function MerchantProductsScreen() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ProductFilters['status']>('all');
  const user = useAuthStore((state) => state.user);
  const products = useProductStore((state) => state.products);
  const toggleProductActive = useProductStore((state) => state.toggleProductActive);
  const merchantId = user?.merchantId;
  const merchantProducts = useMemo(
    () => (merchantId ? getMerchantProducts(products, merchantId) : []),
    [merchantId, products],
  );
  const filteredProducts = useMemo(
    () => filterProducts(merchantProducts, { query, status }),
    [merchantProducts, query, status],
  );
  const activeCount = merchantProducts.filter((product) => product.isActive).length;
  const inactiveCount = merchantProducts.length - activeCount;

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
            <Text className="mt-2 text-sm text-muted">
              {activeCount} active - {inactiveCount} paused
            </Text>
          </View>
          <AppButton onPress={() => router.push('/(merchant)/products/new' as Href)}>
            Add
          </AppButton>
        </View>

        <View className="gap-3 rounded-lg border border-line bg-white p-4">
          <AppInput
            label="Search inventory"
            onChangeText={setQuery}
            placeholder="Name, brand, part number, vehicle"
            value={query}
          />
          <View className="flex-row gap-2">
            <View className="flex-1">
              <AppButton
                onPress={() => setStatus('all')}
                variant={status === 'all' ? 'primary' : 'secondary'}
              >
                All
              </AppButton>
            </View>
            <View className="flex-1">
              <AppButton
                onPress={() => setStatus('active')}
                variant={status === 'active' ? 'primary' : 'secondary'}
              >
                Active
              </AppButton>
            </View>
            <View className="flex-1">
              <AppButton
                onPress={() => setStatus('inactive')}
                variant={status === 'inactive' ? 'primary' : 'secondary'}
              >
                Paused
              </AppButton>
            </View>
          </View>
          <Text className="text-sm text-muted">
            Showing {filteredProducts.length} of {merchantProducts.length} products
          </Text>
        </View>

        <View className="gap-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
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
              title={merchantProducts.length ? 'No matching products' : 'No products yet'}
              message={
                merchantProducts.length
                  ? 'Adjust the search or status filter to find more inventory.'
                  : 'Create your first product to make it available for customer ordering.'
              }
            />
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
