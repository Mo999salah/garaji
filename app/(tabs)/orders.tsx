import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { RequestCard } from '@/features/requests/components/RequestCard';
import { useRequestRealtimeListener } from '@/features/requests/hooks/useRequestRealtimeListener';
import { useCustomerRequestsQuery } from '@/features/requests/hooks/useRequestsQuery';
import {
  selectActiveRequests,
  selectCancelledRequests,
  selectCompletedRequests,
} from '@/features/requests/selectors/requestSelectors';
import { EmptyState } from '@/shared/components/EmptyState';
import { CommandHeader, FilterTabs } from '@/shared/components/OperationalUI';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { useScreenRefresh } from '@/shared/hooks/useScreenRefresh';

type OrdersTab = 'active' | 'completed' | 'cancelled';

const SKELETON_ITEMS = ['orders-skeleton-1', 'orders-skeleton-2', 'orders-skeleton-3'];

export default function CustomerOrdersScreen() {
  const user = useAuthStore((s) => s.user);
  useRequestRealtimeListener({ customerId: user?.id, enabled: Boolean(user?.id) });
  const requestsQuery = useCustomerRequestsQuery(user?.id);
  const requests = requestsQuery.data ?? [];
  const isLoading = requestsQuery.isLoading;
  const refreshControl = useScreenRefresh(requestsQuery.refetch);
  const [activeTab, setActiveTab] = useState<OrdersTab>('active');

  const active = selectActiveRequests(requests);
  const completed = selectCompletedRequests(requests);
  const cancelled = selectCancelledRequests(requests);

  const displayed =
    activeTab === 'active' ? active : activeTab === 'completed' ? completed : cancelled;

  const tabs = [
    { id: 'active' as const, label: 'نشطة', count: active.length },
    { id: 'completed' as const, label: 'مكتملة', count: completed.length },
    { id: 'cancelled' as const, label: 'ملغاة', count: cancelled.length },
  ];

  return (
    <ScreenContainer scroll={false}>
      <View className="gap-4 px-5 py-5">
        <CommandHeader
          eyebrow="طلباتك"
          subtitle="تابع الطلبات النشطة، وارجع للسجل عند الحاجة."
          title="متابعة الصيانة"
        />
        <FilterTabs<OrdersTab> active={activeTab} onChange={setActiveTab} tabs={tabs} />
      </View>

      <ScrollView contentContainerClassName="gap-3 px-5 pb-5" refreshControl={refreshControl}>
        {isLoading ? (
          SKELETON_ITEMS.map((item) => <SkeletonCard key={item} />)
        ) : displayed.length === 0 ? (
          <EmptyState
            message={
              activeTab === 'active'
                ? 'ليس لديك طلبات نشطة حالياً.'
                : activeTab === 'completed'
                  ? 'لا يوجد طلبات مكتملة بعد.'
                  : 'لا يوجد طلبات ملغاة.'
            }
            title={
              activeTab === 'active'
                ? 'لا طلبات نشطة'
                : activeTab === 'completed'
                  ? 'لا طلبات مكتملة'
                  : 'لا طلبات ملغاة'
            }
          />
        ) : (
          displayed.map((request) => (
            <RequestCard
              key={request.id}
              onPress={() =>
                router.push({
                  pathname: '/order-details',
                  params: { id: request.id },
                })
              }
              request={request}
            />
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
