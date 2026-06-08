import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { RequestCard } from '@/features/requests/components/RequestCard';
import { useAllRequestsQuery } from '@/features/requests/hooks/useRequestsQuery';
import { useRequestRealtimeListener } from '@/features/requests/hooks/useRequestRealtimeListener';
import {
  selectActiveRequests,
  selectByStatus,
} from '@/features/requests/selectors/requestSelectors';
import type { ServiceRequestStatus } from '@/features/requests/types';
import { EmptyState } from '@/shared/components/EmptyState';
import { CommandHeader, FilterTabs } from '@/shared/components/OperationalUI';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { useScreenRefresh } from '@/shared/hooks/useScreenRefresh';

type OrdersTab = 'all' | ServiceRequestStatus;

const TABS: { id: OrdersTab; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'pending', label: 'قيد الانتظار' },
  { id: 'confirmed', label: 'مؤكد' },
  { id: 'in_progress', label: 'جارٍ' },
  { id: 'completed', label: 'مكتمل' },
  { id: 'cancelled', label: 'ملغى' },
];

const SKELETON_ITEMS = [
  'admin-orders-skeleton-1',
  'admin-orders-skeleton-2',
  'admin-orders-skeleton-3',
  'admin-orders-skeleton-4',
];

export default function AdminManageOrdersScreen() {
  const requestsQuery = useAllRequestsQuery();
  const { data: requests = [], isLoading } = requestsQuery;
  const refreshControl = useScreenRefresh(requestsQuery.refetch);
  const [activeTab, setActiveTab] = useState<OrdersTab>('all');

  useRequestRealtimeListener();

  const active = selectActiveRequests(requests);
  const displayed =
    activeTab === 'all' ? requests : selectByStatus(requests, activeTab as ServiceRequestStatus);

  const tabs = TABS.map((tab) => ({
    ...tab,
    count:
      tab.id === 'all'
        ? requests.length
        : selectByStatus(requests, tab.id as ServiceRequestStatus).length,
  }));

  return (
    <ScreenContainer scroll={false}>
      <View className="gap-4 px-5 py-5">
        <CommandHeader
          eyebrow="قائمة العمل"
          subtitle={`${active.length.toLocaleString('ar-SA')} طلب نشط بانتظار المتابعة.`}
          title="إدارة الطلبات"
        />
        <FilterTabs<OrdersTab> active={activeTab} onChange={setActiveTab} tabs={tabs} />
      </View>

      <ScrollView contentContainerClassName="gap-3 px-5 pb-5" refreshControl={refreshControl}>
        {isLoading ? (
          SKELETON_ITEMS.map((item) => <SkeletonCard key={item} />)
        ) : displayed.length === 0 ? (
          <EmptyState message="لا توجد طلبات في هذه الحالة." title="لا طلبات" />
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
