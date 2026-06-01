import { router } from 'expo-router';
import { Alert, Platform, Text, View } from 'react-native';

import { CartItemRow } from '@/features/cart/components/CartItemRow';
import {
  formatCurrency,
  getCartItemAvailabilityMessage,
  getCartItemCount,
  getCartSubtotal,
  getCartValidationIssues,
} from '@/features/cart/selectors/cartSelectors';
import { useCartStore } from '@/features/cart/store/useCartStore';
import { hasMixedMerchantCart } from '@/features/orders/selectors/orderSelectors';
import { useProductStore } from '@/features/products/store/useProductStore';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function CustomerCartScreen() {
  const items = useCartStore((state) => state.items);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const products = useProductStore((state) => state.products);

  const subtotal = getCartSubtotal(items);
  const itemCount = getCartItemCount(items);
  const validationIssues = getCartValidationIssues(items, products);
  const hasMultipleMerchants = hasMixedMerchantCart(items);
  const hasBlockingIssues = hasMultipleMerchants || validationIssues.length > 0;

  const confirmClearCart = () => {
    if (!items.length) {
      return;
    }

    if (Platform.OS === 'web') {
      if (window.confirm('Clear all items from your cart?')) {
        clearCart();
      }
      return;
    }

    Alert.alert('Clear cart?', 'This removes all items from your cart.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear cart', style: 'destructive', onPress: clearCart },
    ]);
  };

  return (
    <ScreenContainer>
      <View className="gap-5">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-brand-700">Cart</Text>
            <Text className="mt-2 text-3xl font-bold text-ink">Review items</Text>
            <Text className="mt-2 text-base leading-6 text-muted">
              Adjust quantities before sending the order to the merchant.
            </Text>
          </View>
          <AppButton disabled={!items.length} onPress={confirmClearCart} variant="ghost">
            Clear
          </AppButton>
        </View>

        {items.length ? (
          <>
            <View className="gap-3">
              {items.map((item) => (
                <CartItemRow
                  availabilityMessage={getCartItemAvailabilityMessage(item, products)}
                  disableIncrease={products.some(
                    (product) =>
                      product.id === item.productId &&
                      typeof product.stockQuantity === 'number' &&
                      item.quantity >= product.stockQuantity,
                  )}
                  item={item}
                  key={item.productId}
                  onDecrease={() => decreaseQuantity(item.productId)}
                  onIncrease={() => increaseQuantity(item.productId)}
                  onRemove={() => removeItem(item.productId)}
                />
              ))}
            </View>

            <AppCard>
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-semibold text-ink">Subtotal</Text>
                <Text className="text-2xl font-bold text-brand-700">{formatCurrency(subtotal)}</Text>
              </View>
              <Text className="mt-2 text-sm text-muted">
                {itemCount} item{itemCount === 1 ? '' : 's'} across {items.length} product
                {items.length === 1 ? '' : 's'}
              </Text>
              {hasBlockingIssues ? (
                <View className="mt-3 gap-1">
                  {hasMultipleMerchants ? (
                    <Text className="text-sm font-semibold text-red-600">
                      Checkout supports one merchant per order. Remove items from other merchants.
                    </Text>
                  ) : null}
                  {validationIssues.map((issue) => (
                    <Text
                      className="text-sm font-semibold text-red-600"
                      key={`${issue.productId}-${issue.message}`}
                    >
                      {issue.message}
                    </Text>
                  ))}
                </View>
              ) : null}
              <View className="mt-4 gap-3">
                <AppButton
                  disabled={hasBlockingIssues}
                  onPress={() => router.push('/(customer)/checkout/review')}
                >
                  Checkout
                </AppButton>
                <AppButton onPress={() => router.push('/(customer)/products')} variant="secondary">
                  Add more products
                </AppButton>
              </View>
            </AppCard>
          </>
        ) : (
          <EmptyState
            title="Your cart is empty"
            message="Browse the catalog and add products to prepare an order."
          />
        )}
      </View>
    </ScreenContainer>
  );
}
