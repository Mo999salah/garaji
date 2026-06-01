import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { ProductCard } from '@/features/products/components/ProductCard';
import {
  filterProducts,
  getMerchantProducts,
  isLowStockProduct,
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
  const [inventoryStatus, setInventoryStatus] =
    useState<ProductFilters['inventoryStatus']>('all');
  const [updatingStockId, setUpdatingStockId] = useState<string | null>(null);
  const [stockErrorMessage, setStockErrorMessage] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const products = useProductStore((state) => state.products);
  const toggleProductActive = useProductStore((state) => state.toggleProductActive);
  const updateProductStock = useProductStore((state) => state.updateProductStock);
  const merchantId = user?.merchantId;
  const merchantProducts = useMemo(
    () => (merchantId ? getMerchantProducts(products, merchantId) : []),
    [merchantId, products],
  );
  const filteredProducts = useMemo(
    () => filterProducts(merchantProducts, { query, status, inventoryStatus }),
    [merchantProducts, query, status, inventoryStatus],
  );
  const activeCount = merchantProducts.filter((product) => product.isActive).length;
  const inactiveCount = merchantProducts.length - activeCount;
  const lowStockCount = merchantProducts.filter(isLowStockProduct).length;

  const handleStockChange = async (productId: string, nextStockQuantity: number) => {
    if (!merchantId || updatingStockId) {
      return;
    }

    setUpdatingStockId(productId);
    setStockErrorMessage(null);

    try {
      await updateProductStock(productId, merchantId, nextStockQuantity);
    } catch (error) {
      setStockErrorMessage(error instanceof Error ? error.message : 'Could not update stock.');
    } finally {
      setUpdatingStockId(null);
    }
  };

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
              {activeCount} active - {inactiveCount} paused - {lowStockCount} low stock
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
          <View className="flex-row gap-2">
            <View className="flex-1">
              <AppButton
                onPress={() => setInventoryStatus('all')}
                variant={inventoryStatus === 'all' ? 'primary' : 'secondary'}
              >
                All stock
              </AppButton>
            </View>
            <View className="flex-1">
              <AppButton
                onPress={() => setInventoryStatus('low_stock')}
                variant={inventoryStatus === 'low_stock' ? 'primary' : 'secondary'}
              >
                Low stock
              </AppButton>
            </View>
          </View>
          <Text className="text-sm text-muted">
            Showing {filteredProducts.length} of {merchantProducts.length} products
          </Text>
          {stockErrorMessage ? (
            <Text className="text-sm font-semibold text-red-600">{stockErrorMessage}</Text>
          ) : null}
        </View>

        <View className="gap-3">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                rightSlot={
                  <View className="gap-2">
                    <View className="flex-row gap-2">
                      <AppButton
                        accessibilityLabel={`Edit ${product.name}`}
                        onPress={() =>
                          router.push(`/(merchant)/products/${product.id}/edit` as Href)
                        }
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
                    <View className="gap-2 rounded-lg border border-line bg-surface p-3">
                      <Text className="text-xs font-semibold uppercase text-muted">
                        Quick stock
                      </Text>
                      <Text className="text-sm font-semibold text-ink">
                        {typeof product.stockQuantity === 'number'
                          ? `${product.stockQuantity} ${product.unit}`
                          : 'Not tracked'}
                      </Text>
                      <View className="flex-row gap-2">
                        <View className="flex-1">
                          <AppButton
                            accessibilityLabel={`Decrease stock for ${product.name}`}
                            disabled={
                              updatingStockId === product.id ||
                              (product.stockQuantity ?? 0) <= 0
                            }
                            onPress={() =>
                              void handleStockChange(
                                product.id,
                                Math.max(0, (product.stockQuantity ?? 0) - 1),
                              )
                            }
                            variant="secondary"
                          >
                            -1
                          </AppButton>
                        </View>
                        <View className="flex-1">
                          <AppButton
                            accessibilityLabel={`Increase stock for ${product.name}`}
                            disabled={updatingStockId === product.id}
                            onPress={() =>
                              void handleStockChange(product.id, (product.stockQuantity ?? 0) + 1)
                            }
                          >
                            +1
                          </AppButton>
                        </View>
                      </View>
                      {isLowStockProduct(product) ? (
                        <Text className="text-xs font-semibold text-red-600">
                          Reorder at or below {product.minOrderQuantity} {product.unit}
                        </Text>
                      ) : null}
                    </View>
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
