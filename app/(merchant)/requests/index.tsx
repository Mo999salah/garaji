import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { RequestCard } from '@/features/requests/components/RequestCard';
import {
  selectByStatus,
  selectActiveRequests,
} from '@/features/requests/selectors/requestSelectors';
import { useRequestStore } from '@/features/requests/store/useRequestStore';
import type { ServiceRequestStatus } from '@/features/requests/types';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
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

  return (
    <ScreenContainer scroll={false}>
      {/* Tabs */}
      <ScrollView
        contentContainerClassName="gap-2 px-4 py-2"
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <TouchableOpacity
              className={[
                'rounded-full border px-4 py-2',
                isSelected ? 'border-brand-600 bg-brand-50' : 'border-line bg-white',
              ].join(' ')}
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text
                className={`text-sm font-semibold ${
                  isSelected ? 'text-brand-700' : 'text-muted'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ScrollView contentContainerClassName="gap-3 p-4">
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
