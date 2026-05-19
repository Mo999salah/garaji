import { router } from 'expo-router';
import { Alert, Platform, Text, View } from 'react-native';

import { CartItemRow } from '@/features/cart/components/CartItemRow';
import {
  formatCurrency,
  getCartItemCount,
  getCartSubtotal,
} from '@/features/cart/selectors/cartSelectors';
import { useCartStore } from '@/features/cart/store/useCartStore';
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

  const subtotal = getCartSubtotal(items);
  const itemCount = getCartItemCount(items);

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
              Adjust quantities before order creation is added.
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
              <View className="mt-4 gap-3">
                <AppButton onPress={() => router.push('/(customer)/checkout/review')}>
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
            message="Browse the catalog and add products to prepare a mock order."
          />
        )}
      </View>
    </ScreenContainer>
  );
}
