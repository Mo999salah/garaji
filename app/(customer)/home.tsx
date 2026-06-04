import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { RequestCard } from '@/features/requests/components/RequestCard';
import { selectActiveRequests } from '@/features/requests/selectors/requestSelectors';
import { useRequestStore } from '@/features/requests/store/useRequestStore';
import { useVehicleStore } from '@/features/vehicles/store/useVehicleStore';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

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
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-brand-700">بوابة العميل</Text>
            <Text className="mt-2 text-3xl font-bold text-ink">{user?.fullName}</Text>
            <Text className="mt-1 text-base text-muted">أهلاً بعودتك</Text>
          </View>
          <AppButton onPress={handleSignOut} variant="ghost">
            تسجيل الخروج
          </AppButton>
        </View>

        <AppCard>
          <Text className="text-lg font-semibold text-ink">الإجراءات السريعة</Text>
          <View className="mt-4 gap-3">
            <AppButton onPress={() => router.push('/(customer)/book/branch')}>
              حجز موعد صيانة في الفرع
            </AppButton>
            <AppButton
              onPress={() => router.push('/(customer)/book/mobile')}
              variant="secondary"
            >
              طلب تغيير الزيت بالموقع
            </AppButton>
          </View>
        </AppCard>

        <View className="flex-row gap-3">
          <AppCard className="flex-1">
            <Text className="text-xs font-semibold uppercase text-muted">سياراتي</Text>
            <Text className="mt-2 text-2xl font-bold text-ink">{vehicles.length}</Text>
            <View className="mt-2">
              <AppButton onPress={() => router.push('/(customer)/vehicles')} variant="ghost">
                إدارة السيارات
              </AppButton>
            </View>
          </AppCard>
          <AppCard className="flex-1">
            <Text className="text-xs font-semibold uppercase text-muted">طلبات نشطة</Text>
            <Text className="mt-2 text-2xl font-bold text-ink">{activeRequests.length}</Text>
            <View className="mt-2">
              <AppButton onPress={() => router.push('/(customer)/requests')} variant="ghost">
                عرض الطلبات
              </AppButton>
            </View>
          </AppCard>
        </View>

        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-ink">الطلبات النشطة</Text>
            <AppButton onPress={() => router.push('/(customer)/requests')} variant="ghost">
              عرض الكل
            </AppButton>
          </View>
          {activeRequests.length ? (
            activeRequests.map((req) => (
              <RequestCard
                key={req.id}
                onPress={() => router.push(`/(customer)/requests/${req.id}`)}
                request={req}
              />
            ))
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
