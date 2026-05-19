import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { OrderCard } from '@/features/orders/components/OrderCard';
import { getMerchantOrders } from '@/features/orders/selectors/orderSelectors';
import { useOrderStore } from '@/features/orders/store/useOrderStore';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function MerchantOrdersScreen() {
  const user = useAuthStore((state) => state.user);
  const orders = useOrderStore((state) => state.orders);
  const merchantOrders = user ? getMerchantOrders(orders, user.id) : [];

  return (
    <ScreenContainer>
      <View className="gap-5">
        <View>
          <Text className="text-sm font-semibold text-brand-700">Incoming orders</Text>
          <Text className="mt-2 text-3xl font-bold text-ink">Order queue</Text>
          <Text className="mt-2 text-base leading-6 text-muted">
            Manage orders assigned to your authenticated merchant account.
          </Text>
        </View>

        {merchantOrders.length ? (
          <View className="gap-3">
            {merchantOrders.map((order) => (
              <OrderCard
                key={order.id}
                onPress={() => router.push(`/(merchant)/orders/${order.id}` as Href)}
                order={order}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title="No incoming orders"
            message="Customer orders for your merchant account will appear here."
          />
        )}
      </View>
    </ScreenContainer>
  );
}
