import { router } from 'expo-router';
import { View } from 'react-native';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { RequestCard } from '@/features/requests/components/RequestCard';
import { selectActiveRequests } from '@/features/requests/selectors/requestSelectors';
import { useRequestStore } from '@/features/requests/store/useRequestStore';
import { useVehicleStore } from '@/features/vehicles/store/useVehicleStore';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { CommandHeader, MetricTile, SectionHeader } from '@/shared/components/OperationalUI';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ThemeToggle } from '@/shared/components/ThemeToggle';

export default function CustomerHomeScreen() {
  const { signOut, user } = useAuthStore();
  const vehicles = useVehicleStore((s) => s.vehicles);
  const requests = useRequestStore((s) => s.requests);
  const activeRequests = selectActiveRequests(requests).slice(0, 3);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <ScreenContainer>
      <View className="gap-5">
        <CommandHeader
          eyebrow="مركز العميل"
          subtitle="احجز الخدمة، تابع الطلب، وأدر سياراتك بدون خطوات زائدة."
          title={user?.fullName ?? 'مرحباً'}
        >
          <View className="flex-row-reverse gap-2">
            <View className="flex-1">
              <AppButton onPress={() => router.push('/(customer)/book/branch')}>
                حجز صيانة
              </AppButton>
            </View>
            <ThemeToggle />
            <AppButton onPress={handleSignOut} variant="secondary" className="min-h-12 px-3">
              خروج
            </AppButton>
          </View>
        </CommandHeader>

        <View className="flex-row-reverse gap-3">
          <MetricTile label="السيارات" value={String(vehicles.length)} />
          <MetricTile label="طلبات نشطة" value={String(activeRequests.length)} tone="gold" />
        </View>

        <AppCard tone="quiet">
          <SectionHeader
            subtitle="اختصر الطريق حسب نوع الخدمة التي تحتاجها."
            title="الإجراءات السريعة"
          />
          <View className="mt-4 gap-3">
            <AppButton onPress={() => router.push('/(customer)/book/mobile')} variant="secondary">
              خدمة بالموقع
            </AppButton>
            <AppButton onPress={() => router.push('/(customer)/vehicles')} variant="secondary">
              إدارة السيارات
            </AppButton>
          </View>
        </AppCard>

        <View className="gap-4">
          <SectionHeader
            action={(
              <AppButton onPress={() => router.push('/(customer)/requests')} variant="ghost" className="min-h-9 px-3">
              عرض الكل
              </AppButton>
            )}
            subtitle="آخر الطلبات التي تحتاج متابعة."
            title="المتابعة الآن"
          />
          
          {activeRequests.length ? (
            <View className="gap-3">
              {activeRequests.map((req) => (
                <RequestCard
                  key={req.id}
                  onPress={() => router.push(`/(customer)/requests/${req.id}`)}
                  request={req}
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
