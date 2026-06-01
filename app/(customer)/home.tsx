import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { formatCurrency, getCartItemCount, getCartSubtotal } from '@/features/cart/selectors/cartSelectors';
import { useCartStore } from '@/features/cart/store/useCartStore';
import { OrderCard } from '@/features/orders/components/OrderCard';
import { getCustomerOrders } from '@/features/orders/selectors/orderSelectors';
import { useOrderStore } from '@/features/orders/store/useOrderStore';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function CustomerHomeScreen() {
  const { signOut, user } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = getCartItemCount(cartItems);
  const cartSubtotal = getCartSubtotal(cartItems);
  const orders = useOrderStore((state) => state.orders);
  const recentOrders = user ? getCustomerOrders(orders, user.id).slice(0, 3) : [];
  const activeOrderCount = user
    ? getCustomerOrders(orders, user.id).filter(
        (order) =>
          order.status === 'pending' ||
          order.status === 'processing' ||
          order.status === 'on_the_way',
      ).length
    : 0;

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <ScreenContainer>
      <View className="gap-5">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-brand-700">Customer portal</Text>
            <Text className="mt-2 text-3xl font-bold text-ink">{user?.fullName}</Text>
            <Text className="mt-1 text-base text-muted">Welcome back</Text>
          </View>
          <AppButton onPress={handleSignOut} variant="ghost">
            Sign out
          </AppButton>
        </View>

        <AppCard>
          <Text className="text-lg font-semibold text-ink">Quick order</Text>
          <Text className="mt-2 text-sm leading-5 text-muted">
            Search inventory, build purchase orders, and track fulfillment from this workspace.
          </Text>
          <View className="mt-4">
            <AppButton onPress={() => router.push('/(customer)/products')}>Browse catalog</AppButton>
          </View>
          <View className="mt-3">
            <AppButton onPress={() => router.push('/(customer)/cart')} variant="secondary">
              View cart{cartCount ? ` (${cartCount})` : ''}
            </AppButton>
          </View>
          <View className="mt-3">
            <AppButton onPress={() => router.push('/(customer)/orders')} variant="secondary">
              Order history
            </AppButton>
          </View>
        </AppCard>

        <View className="flex-row gap-3">
          <AppCard className="flex-1">
            <Text className="text-xs font-semibold uppercase text-muted">Cart</Text>
            <Text className="mt-2 text-2xl font-bold text-ink">{cartCount}</Text>
            <Text className="mt-1 text-xs text-muted">{formatCurrency(cartSubtotal)}</Text>
          </AppCard>
          <AppCard className="flex-1">
            <Text className="text-xs font-semibold uppercase text-muted">Active orders</Text>
            <Text className="mt-2 text-2xl font-bold text-ink">{activeOrderCount}</Text>
            <Text className="mt-1 text-xs text-muted">Awaiting merchant progress</Text>
          </AppCard>
        </View>

        {recentOrders.length ? (
          <View className="gap-3">
            <Text className="text-lg font-semibold text-ink">Recent orders</Text>
            {recentOrders.map((order) => (
              <OrderCard
                key={order.id}
                onPress={() => router.push(`/(customer)/orders/${order.id}`)}
                order={order}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title="No active orders"
            message="Submitted orders and merchant confirmations will appear here."
          />
        )}
      </View>
    </ScreenContainer>
  );
}
