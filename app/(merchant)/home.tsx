import { router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

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
import { CommandHeader, MetricTile, SectionHeader } from '@/shared/components/OperationalUI';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ThemeToggle } from '@/shared/components/ThemeToggle';

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
  const needsAction = pending.length + confirmed.length;

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <ScreenContainer>
      <View className="gap-5">
        <CommandHeader
          eyebrow="مركز الإدارة"
          subtitle="ابدأ بالطلبات التي تحتاج قراراً، ثم تابع التنفيذ والخدمات."
          title={user?.fullName ?? 'لوحة التاجر'}
        >
          <View className="flex-row-reverse gap-2">
            <View className="flex-1">
              <AppButton onPress={() => router.push('/(merchant)/requests')}>
                مراجعة الطلبات
              </AppButton>
            </View>
            <ThemeToggle />
            <AppButton onPress={handleSignOut} variant="secondary" className="min-h-12 px-3">
              خروج
            </AppButton>
          </View>
        </CommandHeader>

        <View className="flex-row-reverse flex-wrap gap-3">
          <MetricTile label="تحتاج إجراء" value={String(needsAction)} tone="gold" />
          <MetricTile label="قيد التنفيذ" value={String(inProgress.length)} />
          <MetricTile label="قيد الانتظار" value={String(pending.length)} tone="muted" />
          <MetricTile label="نشطة" value={String(active.length)} />
        </View>

        <AppCard tone="quiet">
          <SectionHeader
            subtitle="إدارة عناصر التشغيل اليومية بدون ازدحام."
            title="اختصارات التشغيل"
          />
          <View className="mt-4 gap-3">
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

        <View className="gap-4">
          <SectionHeader
            action={(
              <AppButton onPress={() => router.push('/(merchant)/requests')} variant="ghost" className="min-h-9 px-3">
                عرض الكل
              </AppButton>
            )}
            subtitle="أحدث الطلبات التي ما زالت ضمن العمل."
            title="قائمة العمل"
          />
          {recentActive.length ? (
            <View className="gap-3">
              {recentActive.map((r) => (
                <RequestCard
                  key={r.id}
                  onPress={() => router.push(`/(merchant)/requests/${r.id}`)}
                  request={r}
                />
              ))}
            </View>
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
