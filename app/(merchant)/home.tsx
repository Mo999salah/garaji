import { router } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { RequestCard } from '@/features/requests/components/RequestCard';
import {
  selectActiveRequests,
  selectByStatus,
} from '@/features/requests/selectors/requestSelectors';
import { useRequestStore } from '@/features/requests/store/useRequestStore';
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
  const { requests, loadAllRequests } = useRequestStore();

  useEffect(() => {
    void loadAllRequests();
  }, [loadAllRequests]);

  const active = selectActiveRequests(requests);
  const pending = selectByStatus(requests, 'pending');
  const confirmed = selectByStatus(requests, 'confirmed');
  const inProgress = selectByStatus(requests, 'in_progress');
  const recentActive = active.slice(0, 3);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <ScreenContainer>
      <View className="gap-5">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-brand-700">بوابة الإدارة</Text>
            <Text className="mt-2 text-3xl font-bold text-ink">{user?.fullName}</Text>
            <Text className="mt-1 text-base text-muted">لوحة إدارة الخدمات</Text>
          </View>
          <AppButton onPress={handleSignOut} variant="ghost">
            تسجيل الخروج
          </AppButton>
        </View>

        {/* مؤشرات الطلبات */}
        <View className="flex-row flex-wrap gap-3">
          <MetricCard label="قيد الانتظار" value={String(pending.length)} />
          <MetricCard label="مؤكدة" value={String(confirmed.length)} />
          <MetricCard label="جارية" value={String(inProgress.length)} />
          <MetricCard label="نشطة (إجمالي)" value={String(active.length)} />
        </View>

        {/* الاختصارات */}
        <AppCard>
          <Text className="text-lg font-semibold text-ink">الإجراءات السريعة</Text>
          <View className="mt-4 gap-3">
            <AppButton onPress={() => router.push('/(merchant)/requests')}>
              إدارة الطلبات
            </AppButton>
            <AppButton
              onPress={() => router.push('/(merchant)/services')}
              variant="secondary"
            >
              إدارة الخدمات
            </AppButton>
            <AppButton
              onPress={() => router.push('/(merchant)/branches')}
              variant="secondary"
            >
              إدارة الفروع
            </AppButton>
          </View>
        </AppCard>

        {/* أحدث الطلبات النشطة */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-ink">الطلبات النشطة</Text>
            <AppButton onPress={() => router.push('/(merchant)/requests')} variant="ghost">
              عرض الكل
            </AppButton>
          </View>
          {recentActive.length ? (
            recentActive.map((r) => (
              <RequestCard
                key={r.id}
                onPress={() => router.push(`/(merchant)/requests/${r.id}`)}
                request={r}
              />
            ))
          ) : (
            <EmptyState
              message="لا توجد طلبات نشطة حالياً. ستظهر هنا طلبات العملاء."
              title="لا طلبات نشطة"
            />
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
