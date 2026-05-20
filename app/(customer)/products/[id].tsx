import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert, Platform, Text, View } from 'react-native';

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

function showMixedMerchantMessage() {
  const message =
    'Your cart already has items from another merchant. Clear the cart or finish that order before adding products from a different merchant.';

  if (Platform.OS === 'web') {
    window.alert(message);
    return;
  }

  Alert.alert('One merchant per order', message);
}

export default function CustomerProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = useProductStore((state) =>
    state.products.find((item) => item.id === id && item.isActive),
  );
  const categories = useProductStore((state) => state.categories);
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

  const categoryLabel =
    product.categoryName ??
    categories.find((category) => category.id === product.categoryId)?.name ??
    'Uncategorized';
  const merchantLabel = product.merchantName ?? 'Merchant';

  const handleAddToCart = () => {
    const result = addProduct(product);

    if (!result.ok && result.reason === 'mixed_merchant') {
      showMixedMerchantMessage();
    }
  };

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
              In cart: {cartItem.quantity} {cartItem.unit} (
              {formatCurrency(cartItem.unitPrice * cartItem.quantity)})
            </Text>
          ) : null}
          <View className="mt-4 gap-3">
            <AppButton onPress={handleAddToCart}>Add to cart</AppButton>
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
            <Text className="text-sm text-muted">Category: {categoryLabel}</Text>
            <Text className="text-sm text-muted">Merchant: {merchantLabel}</Text>
          </View>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}
