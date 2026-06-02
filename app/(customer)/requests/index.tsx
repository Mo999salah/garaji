import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { RequestCard } from '@/features/requests/components/RequestCard';
import {
  selectActiveRequests,
  selectCompletedRequests,
} from '@/features/requests/selectors/requestSelectors';
import { useRequestStore } from '@/features/requests/store/useRequestStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

type Tab = 'active' | 'history';

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

  return (
    <ScreenContainer scroll={false}>
      {/* Tabs */}
      <View className="flex-row border-b border-line">
        {(['active', 'history'] as Tab[]).map((tab) => {
          const label = tab === 'active' ? 'الطلبات النشطة' : 'السجل';
          const isSelected = activeTab === tab;
          return (
            <TouchableOpacity
              className={`flex-1 py-3 ${isSelected ? 'border-b-2 border-brand-600' : ''}`}
              key={tab}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                className={`text-center text-sm font-semibold ${
                  isSelected ? 'text-brand-700' : 'text-muted'
                }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ScrollView contentContainerClassName="gap-3 p-4">
          {displayed.length === 0 ? (
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
      )}
    </ScreenContainer>
  );
}
