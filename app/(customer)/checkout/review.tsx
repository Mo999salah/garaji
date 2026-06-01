import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import {
  formatCurrency,
  getCartItemCount,
  getCartSubtotal,
  getCartValidationIssues,
} from '@/features/cart/selectors/cartSelectors';
import { useCartStore } from '@/features/cart/store/useCartStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { hasMixedMerchantCart } from '@/features/orders/selectors/orderSelectors';
import { useOrderStore } from '@/features/orders/store/useOrderStore';
import { useProductStore } from '@/features/products/store/useProductStore';
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
  const orderErrorMessage = useOrderStore((state) => state.errorMessage);
  const products = useProductStore((state) => state.products);
  const subtotal = getCartSubtotal(items);
  const itemCount = getCartItemCount(items);
  const hasMultipleMerchants = hasMixedMerchantCart(items);
  const validationIssues = getCartValidationIssues(items, products);
  const hasBlockingIssues = hasMultipleMerchants || validationIssues.length > 0;

  const placeOrder = async () => {
    if (!user || hasBlockingIssues) {
      return;
    }

    const order = await createOrderFromCart(user, items, notes);

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
            Confirm the order before it is sent to the merchant queue.
          </Text>
        </View>

        <AppCard>
          <Text className="text-base font-semibold text-ink">Subtotal</Text>
          <Text className="mt-2 text-3xl font-bold text-brand-700">{formatCurrency(subtotal)}</Text>
          <Text className="mt-2 text-sm text-muted">
            {itemCount} item{itemCount === 1 ? '' : 's'} in this order.
          </Text>
          {hasMultipleMerchants ? (
            <Text className="mt-3 text-sm font-semibold text-red-600">
              Checkout supports one merchant per order. Remove items from other merchants first.
            </Text>
          ) : null}
          {validationIssues.length ? (
            <View className="mt-3 gap-1">
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
        </AppCard>

        <AppCard>
          <Text className="text-base font-semibold text-ink">Order lines</Text>
          <View className="mt-3 gap-3">
            {items.map((item) => (
              <View
                className="rounded-lg border border-line bg-surface p-3"
                key={item.productId}
              >
                <Text className="text-sm font-semibold text-ink">{item.name}</Text>
                <Text className="mt-1 text-xs text-muted">
                  {item.quantity} {item.unit} - {formatCurrency(item.quantity * item.unitPrice)}
                </Text>
              </View>
            ))}
          </View>
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
            <AppButton disabled={hasBlockingIssues || !user} onPress={() => void placeOrder()}>
              Place order
            </AppButton>
            <AppButton onPress={() => router.push('/(customer)/cart')} variant="secondary">
              Back to cart
            </AppButton>
            {orderErrorMessage ? (
              <Text className="text-sm font-semibold leading-5 text-red-600">
                {orderErrorMessage}
              </Text>
            ) : null}
          </View>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}
