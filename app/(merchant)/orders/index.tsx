import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { formatCurrency } from '@/features/cart/selectors/cartSelectors';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { OrderCard } from '@/features/orders/components/OrderCard';
import {
  countOrdersByStatus,
  filterOrdersByStatus,
  getMerchantOrders,
  getOrdersTotal,
  type OrderStatusFilter,
  statusLabels,
} from '@/features/orders/selectors/orderSelectors';
import { useOrderStore } from '@/features/orders/store/useOrderStore';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { DataStatus } from '@/shared/components/DataStatus';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

const statusFilters: Array<{ label: string; value: OrderStatusFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: statusLabels.pending, value: 'pending' },
  { label: statusLabels.processing, value: 'processing' },
  { label: statusLabels.on_the_way, value: 'on_the_way' },
  { label: statusLabels.delivered, value: 'delivered' },
  { label: statusLabels.cancelled, value: 'cancelled' },
];

export default function MerchantOrdersScreen() {
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('open');
  const user = useAuthStore((state) => state.user);
  const orders = useOrderStore((state) => state.orders);
  const isLoading = useOrderStore((state) => state.isLoading);
  const errorMessage = useOrderStore((state) => state.errorMessage);
  const loadMerchantOrders = useOrderStore((state) => state.loadMerchantOrders);
  const merchantId = user?.merchantId;
  const merchantOrders = useMemo(
    () => (merchantId ? getMerchantOrders(orders, merchantId) : []),
    [merchantId, orders],
  );
  const filteredOrders = useMemo(
    () => filterOrdersByStatus(merchantOrders, statusFilter),
    [merchantOrders, statusFilter],
  );
  const visibleOrderValue = getOrdersTotal(filteredOrders);

  return (
    <ScreenContainer>
      <View className="gap-5">
        <View>
          <Text className="text-sm font-semibold text-brand-700">Incoming orders</Text>
          <Text className="mt-2 text-3xl font-bold text-ink">Order queue</Text>
          <Text className="mt-2 text-base leading-6 text-muted">
            Manage orders assigned to your authenticated merchant account.
          </Text>
          <Text className="mt-2 text-sm text-muted">
            Showing {filteredOrders.length} of {merchantOrders.length} orders
          </Text>
        </View>

        <DataStatus
          errorMessage={errorMessage}
          errorTitle="Order queue unavailable"
          isLoading={isLoading && !merchantOrders.length}
          loadingLabel="Loading order queue"
          onRetry={merchantId ? () => void loadMerchantOrders(merchantId) : undefined}
        />

        <AppCard>
          <Text className="text-xs font-semibold uppercase text-muted">Visible order value</Text>
          <Text className="mt-2 text-3xl font-bold text-brand-700">
            {formatCurrency(visibleOrderValue)}
          </Text>
          <View className="mt-4 flex-row flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <AppButton
                key={filter.value}
                onPress={() => setStatusFilter(filter.value)}
                variant={statusFilter === filter.value ? 'primary' : 'secondary'}
              >
                {filter.label} ({countOrdersByStatus(merchantOrders, filter.value)})
              </AppButton>
            ))}
          </View>
        </AppCard>

        {filteredOrders.length ? (
          <View className="gap-3">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                onPress={() => router.push(`/(merchant)/orders/${order.id}` as Href)}
                order={order}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title={merchantOrders.length ? 'No orders in this view' : 'No incoming orders'}
            message={
              merchantOrders.length
                ? 'Choose another status filter to review more customer requests.'
                : 'Customer orders for your merchant account will appear here.'
            }
          />
        )}
      </View>
    </ScreenContainer>
  );
}
