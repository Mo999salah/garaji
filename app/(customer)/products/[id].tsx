import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Text, View } from 'react-native';

import {
  formatCurrency,
  getCartItemCount,
} from '@/features/cart/selectors/cartSelectors';
import { useCartStore } from '@/features/cart/store/useCartStore';
import { ProductCard } from '@/features/products/components/ProductCard';
import {
  formatProductFitment,
  formatProductPrice,
  formatProductStock,
} from '@/features/products/selectors/productSelectors';
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
  const [cartMessage, setCartMessage] = useState<string | null>(null);
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
  const isOutOfStock =
    typeof product.stockQuantity === 'number' &&
    product.stockQuantity < product.minOrderQuantity;
  const availabilityLabel = isOutOfStock
    ? 'Not enough stock for the minimum order'
    : typeof product.stockQuantity === 'number'
      ? `${product.stockQuantity} ${product.unit} ready to order`
      : 'Stock will be confirmed by the merchant';

  const handleAddToCart = () => {
    setCartMessage(null);
    const result = addProduct(product);

    if (!result.ok && result.reason === 'mixed_merchant') {
      showMixedMerchantMessage();
      return;
    }

    if (!result.ok && result.reason === 'out_of_stock') {
      setCartMessage('This product does not have enough stock for the minimum order.');
      return;
    }

    if (!result.ok && result.reason === 'stock_limit') {
      setCartMessage('Your cart already has the available stock for this product.');
      return;
    }

    if (result.ok) {
      setCartMessage('Added to cart.');
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
          <Text
            className={`mt-2 text-sm font-semibold ${
              isOutOfStock ? 'text-red-600' : 'text-brand-700'
            }`}
          >
            {availabilityLabel}
          </Text>
          {cartMessage ? (
            <Text className="mt-2 text-sm font-semibold text-brand-700">{cartMessage}</Text>
          ) : null}
          <View className="mt-4 gap-3">
            <AppButton disabled={isOutOfStock} onPress={handleAddToCart}>
              Add minimum order
            </AppButton>
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
            {product.partNumber ? (
              <Text className="text-sm text-muted">Part number: {product.partNumber}</Text>
            ) : null}
            <Text className="text-sm text-muted">Category: {categoryLabel}</Text>
            <Text className="text-sm text-muted">Merchant: {merchantLabel}</Text>
            <Text className="text-sm text-muted">Fitment: {formatProductFitment(product)}</Text>
            <Text className="text-sm text-muted">Stock: {formatProductStock(product)}</Text>
            <Text className="text-sm text-muted">
              Minimum order: {product.minOrderQuantity} {product.unit}
            </Text>
          </View>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}
