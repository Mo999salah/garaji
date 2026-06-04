import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { RequestCard } from '@/features/requests/components/RequestCard';
import { useAllRequestsQuery } from '@/features/requests/hooks/useRequestsQuery';
import { useRequestRealtimeListener } from '@/features/requests/hooks/useRequestRealtimeListener';
import {
  selectByStatus,
  selectActiveRequests,
} from '@/features/requests/selectors/requestSelectors';
import type { ServiceRequestStatus } from '@/features/requests/types';
import { EmptyState } from '@/shared/components/EmptyState';
import { CommandHeader, FilterTabs } from '@/shared/components/OperationalUI';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { SkeletonCard } from '@/shared/components/SkeletonCard';

type TabId = 'all' | ServiceRequestStatus;

const TABS: { id: TabId; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'pending', label: 'قيد الانتظار' },
  { id: 'confirmed', label: 'مؤكد' },
  { id: 'in_progress', label: 'جارٍ' },
  { id: 'completed', label: 'مكتمل' },
  { id: 'cancelled', label: 'ملغى' },
];

const SKELETON_ITEMS = ['request-skeleton-1', 'request-skeleton-2', 'request-skeleton-3', 'request-skeleton-4'];

export default function MerchantRequestsIndexScreen() {
  const { data: requests = [], isLoading } = useAllRequestsQuery();
  const [activeTab, setActiveTab] = useState<TabId>('all');

  useRequestRealtimeListener();

  const displayed =
    activeTab === 'all'
      ? requests
      : selectByStatus(requests, activeTab as ServiceRequestStatus);
  const active = selectActiveRequests(requests);
  const tabs = TABS.map((tab) => ({
    ...tab,
    count: tab.id === 'all' ? requests.length : selectByStatus(requests, tab.id as ServiceRequestStatus).length,
  }));

  return (
    <ScreenContainer scroll={false}>
      <View className="gap-4 px-5 py-5">
        <CommandHeader
          eyebrow="قائمة العمل"
          subtitle={`${active.length.toLocaleString('ar-SA')} طلب نشط بانتظار المتابعة.`}
          title="إدارة الطلبات"
        />
        <FilterTabs<TabId> active={activeTab} onChange={setActiveTab} tabs={tabs} />
      </View>

      <ScrollView contentContainerClassName="gap-3 px-5 pb-5">
        {isLoading ? (
          SKELETON_ITEMS.map((item) => <SkeletonCard key={item} />)
        ) : displayed.length === 0 ? (
          <EmptyState
            message="لا توجد طلبات في هذه الحالة."
            title="لا طلبات"
          />
        ) : (
          displayed.map((r) => (
            <RequestCard
              key={r.id}
              onPress={() => router.push(`/(merchant)/requests/${r.id}`)}
              request={r}
            />
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
