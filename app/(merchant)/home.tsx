import { router } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { formatCurrency } from '@/features/cart/selectors/cartSelectors';
import { OrderCard } from '@/features/orders/components/OrderCard';
import { getMerchantOrders } from '@/features/orders/selectors/orderSelectors';
import { useOrderStore } from '@/features/orders/store/useOrderStore';
import { getMerchantProducts } from '@/features/products/selectors/productSelectors';
import { useProductStore } from '@/features/products/store/useProductStore';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[47%] flex-1 rounded-lg border border-line bg-white p-4">
      <Text className="text-xs font-semibold uppercase text-muted">{label}</Text>
      <Text className="mt-2 text-2xl font-bold text-ink">{value}</Text>
    </View>
  );
}

export default function MerchantHomeScreen() {
  const { signOut, user } = useAuthStore();
  const products = useProductStore((state) => state.products);
  const orders = useOrderStore((state) => state.orders);
  const merchantId = user?.merchantId;
  const merchantProducts = useMemo(
    () => (merchantId ? getMerchantProducts(products, merchantId) : []),
    [merchantId, products],
  );
  const merchantOrders = useMemo(
    () => (merchantId ? getMerchantOrders(orders, merchantId) : []),
    [merchantId, orders],
  );
  const activeProducts = merchantProducts.filter((product) => product.isActive).length;
  const lowStockProducts = merchantProducts.filter(
    (product) =>
      typeof product.stockQuantity === 'number' &&
      product.stockQuantity <= product.minOrderQuantity,
  ).length;
  const pendingOrders = merchantOrders.filter((order) => order.status === 'pending');
  const openOrders = merchantOrders.filter(
    (order) =>
      order.status === 'pending' ||
      order.status === 'processing' ||
      order.status === 'on_the_way',
  );
  const openOrderValue = openOrders.reduce((total, order) => total + order.subtotal, 0);
  const recentOrders = merchantOrders.slice(0, 3);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <ScreenContainer>
      <View className="gap-5">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-brand-700">Merchant portal</Text>
            <Text className="mt-2 text-3xl font-bold text-ink">{user?.fullName}</Text>
            <Text className="mt-1 text-base text-muted">
              {user?.merchantName ?? 'Merchant workspace'}
            </Text>
          </View>
          <AppButton onPress={handleSignOut} variant="ghost">
            Sign out
          </AppButton>
        </View>

        <View className="flex-row flex-wrap gap-3">
          <MetricCard label="Open orders" value={String(openOrders.length)} />
          <MetricCard label="Pending" value={String(pendingOrders.length)} />
          <MetricCard label="Active products" value={String(activeProducts)} />
          <MetricCard label="Low stock" value={String(lowStockProducts)} />
        </View>

        <AppCard>
          <Text className="text-xs font-semibold uppercase text-muted">Open order value</Text>
          <Text className="mt-2 text-3xl font-bold text-brand-700">
            {formatCurrency(openOrderValue)}
          </Text>
          <Text className="mt-2 text-sm text-muted">
            Pending, processing, and on-the-way orders.
          </Text>
        </AppCard>

        <AppCard>
          <Text className="text-lg font-semibold text-ink">Order desk</Text>
          <Text className="mt-2 text-sm leading-5 text-muted">
            Review customer demand, confirm availability, and prepare fulfillment updates.
          </Text>
          <View className="mt-4">
            <AppButton onPress={() => router.push('/(merchant)/orders')}>Incoming orders</AppButton>
          </View>
          <View className="mt-3">
            <AppButton onPress={() => router.push('/(merchant)/products')}>Manage products</AppButton>
          </View>
        </AppCard>

        {recentOrders.length ? (
          <View className="gap-3">
            <Text className="text-lg font-semibold text-ink">Recent orders</Text>
            {recentOrders.map((order) => (
              <OrderCard
                key={order.id}
                onPress={() => router.push(`/(merchant)/orders/${order.id}`)}
                order={order}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title="No pending requests"
            message="Customer order requests will appear here once submitted."
          />
        )}
      </View>
    </ScreenContainer>
  );
}
