import { router } from 'expo-router';
import { View } from 'react-native';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { RequestCard } from '@/features/requests/components/RequestCard';
import { useCustomerRequestsQuery } from '@/features/requests/hooks/useRequestsQuery';
import { selectActiveRequests } from '@/features/requests/selectors/requestSelectors';
import { useCustomerVehiclesQuery } from '@/features/vehicles/hooks/useVehiclesQuery';
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

export default function CustomerHomeScreen() {
  const { signOut, user } = useAuthStore();
  const vehiclesQuery = useCustomerVehiclesQuery(user?.id);
  const requestsQuery = useCustomerRequestsQuery(user?.id);
  const vehicles = vehiclesQuery.data ?? [];
  const requests = requestsQuery.data ?? [];
  const refreshControl = useScreenRefresh(vehiclesQuery.refetch, requestsQuery.refetch);
  const activeRequests = selectActiveRequests(requests).slice(0, 3);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <ScreenContainer refreshControl={refreshControl}>
      <View className="gap-5">
        <CommandHeader
          eyebrow="مركز العميل"
          subtitle="احجز الخدمة، تابع الطلب، وأدر سياراتك بدون خطوات زائدة."
          title={user?.fullName ?? 'مرحباً'}
        >
          <View className="flex-row-reverse gap-2">
            <View className="flex-1">
              <AppButton onPress={() => router.push('/book-branch')}>حجز صيانة</AppButton>
            </View>
            <ThemeToggle />
            <AppButton className="min-h-12 px-3" onPress={handleSignOut} variant="secondary">
              خروج
            </AppButton>
          </View>
        </CommandHeader>

        <View className="flex-row-reverse flex-wrap gap-3">
          <MetricTile label="السيارات" value={String(vehicles.length)} />
          <MetricTile label="طلبات نشطة" tone="gold" value={String(activeRequests.length)} />
        </View>

        <AppCard tone="quiet">
          <SectionHeader subtitle="اختصر الطريق حسب نوع الخدمة التي تحتاجها." title="الإجراءات السريعة" />
          <View className="mt-4 flex-row-reverse flex-wrap gap-3">
            <QuickActionTile
              className="min-w-[47%] flex-1"
              icon="map-pin"
              onPress={() => router.push('/book-service')}
              subtitle="الفني يصل إليك"
              title="خدمة بالموقع"
              tone="action"
            />
            <QuickActionTile
              className="min-w-[47%] flex-1"
              icon="truck"
              onPress={() => router.push('/(tabs)/my-cars')}
              subtitle="عرض وإدارة المركبات"
              title="سياراتي"
              tone="brand"
            />
            <QuickActionTile
              className="min-w-[47%] flex-1"
              icon="calendar"
              onPress={() => router.push('/maintenance-plans')}
              subtitle="المواعيد القادمة"
              title="خطط الصيانة"
              tone="amber"
            />
            <QuickActionTile
              className="min-w-[47%] flex-1"
              icon="map"
              onPress={() => router.push('/service-centers')}
              subtitle="اعثر على أقرب فرع"
              title="مراكز الخدمة"
              tone="brand"
            />
          </View>
        </AppCard>

        <View className="gap-4">
          <SectionHeader
            action={
              <AppButton
                className="min-h-9 px-3"
                onPress={() => router.push('/(tabs)/orders')}
                variant="ghost"
              >
                عرض الكل
              </AppButton>
            }
            subtitle="آخر الطلبات التي تحتاج متابعة."
            title="المتابعة الآن"
          />

          {activeRequests.length ? (
            <View className="gap-3">
              {activeRequests.map((request) => (
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
              message="لا توجد طلبات نشطة حالياً. ابدأ بحجز موعد صيانة."
              title="لا يوجد طلبات نشطة"
            />
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
