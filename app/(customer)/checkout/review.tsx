import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import {
  formatCurrency,
  getCartItemCount,
  getCartSubtotal,
} from '@/features/cart/selectors/cartSelectors';
import { useCartStore } from '@/features/cart/store/useCartStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { hasMixedMerchantCart } from '@/features/orders/selectors/orderSelectors';
import { useOrderStore } from '@/features/orders/store/useOrderStore';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { AppInput } from '@/shared/components/AppInput';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function CheckoutReviewScreen() {
  const [notes, setNotes] = useState('');
  const user = useAuthStore((state) => state.user);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const createOrderFromCart = useOrderStore((state) => state.createOrderFromCart);
  const subtotal = getCartSubtotal(items);
  const itemCount = getCartItemCount(items);
  const hasMultipleMerchants = hasMixedMerchantCart(items);

  const placeOrder = () => {
    if (!user || hasMultipleMerchants) {
      return;
    }

    const order = createOrderFromCart(user, items, notes);

    if (order) {
      clearCart();
      router.replace(`/(customer)/orders/${order.id}`);
    }
  };

  if (!items.length) {
    return (
      <ScreenContainer>
        <EmptyState
          title="No items to review"
          message="Add products to your cart before reviewing checkout."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="gap-5">
        <View>
          <Text className="text-sm font-semibold text-brand-700">Checkout</Text>
          <Text className="mt-2 text-3xl font-bold text-ink">Review order</Text>
          <Text className="mt-2 text-base leading-6 text-muted">
            Confirm the mock order before it is sent to the merchant queue.
          </Text>
        </View>

        <AppCard>
          <Text className="text-base font-semibold text-ink">Mock subtotal</Text>
          <Text className="mt-2 text-3xl font-bold text-brand-700">{formatCurrency(subtotal)}</Text>
          <Text className="mt-2 text-sm text-muted">
            {itemCount} item{itemCount === 1 ? '' : 's'} ready for future order creation.
          </Text>
          {hasMultipleMerchants ? (
            <Text className="mt-3 text-sm font-semibold text-red-600">
              Mock checkout currently supports one merchant per order. Remove items from other
              merchants before placing this order.
            </Text>
          ) : null}
        </AppCard>

        <AppInput
          label="Order notes"
          multiline
          numberOfLines={4}
          onChangeText={setNotes}
          placeholder="Optional delivery or fitment notes"
          textAlignVertical="top"
          value={notes}
        />

        <AppCard>
          <View className="mt-4 gap-3">
            <AppButton disabled={hasMultipleMerchants || !user} onPress={placeOrder}>
              Place mock order
            </AppButton>
            <AppButton onPress={() => router.push('/(customer)/cart')} variant="secondary">
              Back to cart
            </AppButton>
          </View>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}
