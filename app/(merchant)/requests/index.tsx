import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { RequestCard } from '@/features/requests/components/RequestCard';
import {
  selectByStatus,
  selectActiveRequests,
} from '@/features/requests/selectors/requestSelectors';
import { useRequestStore } from '@/features/requests/store/useRequestStore';
import type { ServiceRequestStatus } from '@/features/requests/types';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { CommandHeader, FilterTabs } from '@/shared/components/OperationalUI';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

type TabId = 'all' | ServiceRequestStatus;

const TABS: { id: TabId; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'pending', label: 'قيد الانتظار' },
  { id: 'confirmed', label: 'مؤكد' },
  { id: 'in_progress', label: 'جارٍ' },
  { id: 'completed', label: 'مكتمل' },
  { id: 'cancelled', label: 'ملغى' },
];

export default function MerchantRequestsIndexScreen() {
  const { requests, loadAllRequests, isLoading } = useRequestStore();
  const [activeTab, setActiveTab] = useState<TabId>('all');

  useEffect(() => {
    void loadAllRequests();
  }, [loadAllRequests]);

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

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ScrollView contentContainerClassName="gap-3 px-5 pb-5">
          {displayed.length === 0 ? (
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
      )}
    </ScreenContainer>
  );
}
