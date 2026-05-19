import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import {
  formatCurrency,
  getCartItemCount,
} from '@/features/cart/selectors/cartSelectors';
import { useCartStore } from '@/features/cart/store/useCartStore';
import { ProductCard } from '@/features/products/components/ProductCard';
import { formatProductPrice } from '@/features/products/selectors/productSelectors';
import { useProductStore } from '@/features/products/store/useProductStore';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function CustomerProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = useProductStore((state) =>
    state.products.find((item) => item.id === id && item.isActive),
  );
  const addProduct = useCartStore((state) => state.addProduct);
  const cartItems = useCartStore((state) => state.items);
  const cartItem = cartItems.find((item) => item.productId === product?.id);
  const cartCount = getCartItemCount(cartItems);

  if (!product) {
    return (
      <ScreenContainer>
        <Stack.Screen options={{ title: 'Product not found' }} />
        <EmptyState
          title="Product unavailable"
          message="This item is inactive or no longer exists in the catalog."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="gap-5">
        <Stack.Screen options={{ title: product.name }} />
        <ProductCard product={product} />

        <AppCard>
          <Text className="text-sm font-semibold uppercase text-muted">Trade price</Text>
          <Text className="mt-2 text-3xl font-bold text-brand-700">
            {formatProductPrice(product)}
          </Text>
          {cartItem ? (
            <Text className="mt-2 text-sm text-muted">
              In cart: {cartItem.quantity} {cartItem.unit} ({formatCurrency(cartItem.unitPrice * cartItem.quantity)})
            </Text>
          ) : null}
          <View className="mt-4 gap-3">
            <AppButton onPress={() => addProduct(product)}>Add to cart</AppButton>
            <AppButton onPress={() => router.push('/(customer)/cart')} variant="secondary">
              View cart{cartCount ? ` (${cartCount})` : ''}
            </AppButton>
          </View>
        </AppCard>

        <AppCard>
          <Text className="text-lg font-semibold text-ink">Product details</Text>
          <Text className="mt-3 text-base leading-6 text-muted">{product.description}</Text>
          <View className="mt-4 gap-2">
            <Text className="text-sm text-muted">Brand: {product.brand}</Text>
            <Text className="text-sm text-muted">Category: {product.categoryId}</Text>
            <Text className="text-sm text-muted">Merchant: {product.merchantId}</Text>
          </View>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}
