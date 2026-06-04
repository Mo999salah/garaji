import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { RequestCard } from '@/features/requests/components/RequestCard';
import {
  selectActiveRequests,
  selectCompletedRequests,
} from '@/features/requests/selectors/requestSelectors';
import { useRequestStore } from '@/features/requests/store/useRequestStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { EmptyState } from '@/shared/components/EmptyState';
import { CommandHeader, FilterTabs } from '@/shared/components/OperationalUI';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { SkeletonCard } from '@/shared/components/SkeletonCard';

type Tab = 'active' | 'history';

const SKELETON_ITEMS = ['request-skeleton-1', 'request-skeleton-2', 'request-skeleton-3'];

export default function RequestsIndexScreen() {
  const user = useAuthStore((s) => s.user);
  const { requests, loadCustomerRequests, isLoading } = useRequestStore();
  const [activeTab, setActiveTab] = useState<Tab>('active');

  useEffect(() => {
    void loadCustomerRequests(user?.id);
  }, [user?.id, loadCustomerRequests]);

  const active = selectActiveRequests(requests);
  const history = selectCompletedRequests(requests);
  const displayed = activeTab === 'active' ? active : history;
  const tabs = [
    { id: 'active' as const, label: 'نشطة', count: active.length },
    { id: 'history' as const, label: 'السجل', count: history.length },
  ];

  return (
    <ScreenContainer scroll={false}>
      <View className="gap-4 px-5 py-5">
        <CommandHeader
          eyebrow="طلباتك"
          subtitle="تابع الطلبات النشطة، وارجع للسجل عند الحاجة."
          title="متابعة الصيانة"
        />
        <FilterTabs<Tab> active={activeTab} onChange={setActiveTab} tabs={tabs} />
      </View>

      <ScrollView contentContainerClassName="gap-3 px-5 pb-5">
        {isLoading ? (
          SKELETON_ITEMS.map((item) => <SkeletonCard key={item} />)
        ) : displayed.length === 0 ? (
          <EmptyState
            message={
              activeTab === 'active'
                ? 'ليس لديك طلبات نشطة حالياً.'
                : 'لا يوجد سجل طلبات بعد.'
            }
            title={activeTab === 'active' ? 'لا طلبات نشطة' : 'السجل فارغ'}
          />
        ) : (
          displayed.map((r) => (
            <RequestCard
              key={r.id}
              onPress={() => router.push(`/(customer)/requests/${r.id}`)}
              request={r}
            />
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
