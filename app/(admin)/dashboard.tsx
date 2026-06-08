import { router } from 'expo-router';
import { View } from 'react-native';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { RequestCard } from '@/features/requests/components/RequestCard';
import { useAllRequestsQuery } from '@/features/requests/hooks/useRequestsQuery';
import {
  selectActiveRequests,
  selectByStatus,
  selectCompletedToday,
} from '@/features/requests/selectors/requestSelectors';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import {
  CommandHeader,
  MetricTile,
  QuickActionTile,
  SectionHeader,
} from '@/shared/components/OperationalUI';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { useScreenRefresh } from '@/shared/hooks/useScreenRefresh';

export default function AdminDashboardScreen() {
  const { signOut, user } = useAuthStore();
  const requestsQuery = useAllRequestsQuery();
  const { data: requests = [] } = requestsQuery;
  const refreshControl = useScreenRefresh(requestsQuery.refetch);

  const active = selectActiveRequests(requests);
  const pending = selectByStatus(requests, 'pending');
  const confirmed = selectByStatus(requests, 'confirmed');
  const inProgress = selectByStatus(requests, 'in_progress');
  const completedToday = selectCompletedToday(requests);
  const recentActive = active.slice(0, 3);
  const needsAction = pending.length + confirmed.length;

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <ScreenContainer refreshControl={refreshControl}>
      <View className="gap-5">
        <CommandHeader
          eyebrow="مركز الإدارة"
          subtitle="ابدأ بالطلبات التي تحتاج قراراً، ثم تابع التنفيذ والخدمات."
          title={user?.fullName ?? 'لوحة التشغيل'}
        >
          <View className="flex-row-reverse gap-2">
            <View className="flex-1">
              <AppButton onPress={() => router.push('/(admin)/manage-orders')}>
                مراجعة الطلبات
              </AppButton>
            </View>
            <ThemeToggle />
            <AppButton className="min-h-12 px-3" onPress={handleSignOut} variant="secondary">
              خروج
            </AppButton>
          </View>
        </CommandHeader>

        <View className="flex-row-reverse flex-wrap gap-3">
          <MetricTile label="تحتاج إجراء" tone="gold" value={String(needsAction)} />
          <MetricTile label="قيد التنفيذ" value={String(inProgress.length)} />
          <MetricTile label="مكتملة اليوم" tone="muted" value={String(completedToday.length)} />
          <MetricTile label="نشطة" value={String(active.length)} />
        </View>

        <AppCard tone="quiet">
          <SectionHeader subtitle="إدارة عناصر التشغيل اليومية بدون ازدحام." title="اختصارات التشغيل" />
          <View className="mt-4 flex-row-reverse flex-wrap gap-3">
            <QuickActionTile
              className="min-w-[47%] flex-1"
              icon="inbox"
              onPress={() => router.push('/(admin)/manage-orders')}
              subtitle="قبول ومتابعة الطلبات"
              title="الطلبات"
              tone="brand"
            />
            <QuickActionTile
              className="min-w-[47%] flex-1"
              icon="settings"
              onPress={() => router.push('/(admin)/services')}
              subtitle="الأسعار والعروض"
              title="الخدمات"
              tone="brand"
            />
            <QuickActionTile
              className="min-w-[47%] flex-1"
              icon="map"
              onPress={() => router.push('/(admin)/branches')}
              subtitle="المواقع والسعة"
              title="الفروع"
              tone="action"
            />
            <QuickActionTile
              className="min-w-[47%] flex-1"
              icon="users"
              onPress={() => router.push('/(admin)/technicians')}
              subtitle="الفريق الميداني"
              title="الفنيون"
              tone="amber"
            />
            <QuickActionTile
              className="min-w-[47%] flex-1"
              icon="calendar"
              onPress={() => router.push('/(admin)/maintenance-plans')}
              subtitle="مواعيد الصيانة الدورية"
              title="خطط الصيانة"
              tone="action"
            />
          </View>
        </AppCard>

        <View className="gap-4">
          <SectionHeader
            action={
              <AppButton
                className="min-h-9 px-3"
                onPress={() => router.push('/(admin)/manage-orders')}
                variant="ghost"
              >
                عرض الكل
              </AppButton>
            }
            subtitle="أحدث الطلبات التي ما زالت ضمن العمل."
            title="قائمة العمل"
          />

          {recentActive.length ? (
            <View className="gap-3">
              {recentActive.map((request) => (
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
