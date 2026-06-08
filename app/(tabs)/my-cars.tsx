import { router } from 'expo-router';
import { View } from 'react-native';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { VehicleCard } from '@/features/vehicles/components/VehicleCard';
import { useCustomerVehiclesQuery } from '@/features/vehicles/hooks/useVehiclesQuery';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { CommandHeader } from '@/shared/components/OperationalUI';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useScreenRefresh } from '@/shared/hooks/useScreenRefresh';

export default function CustomerVehiclesScreen() {
  const user = useAuthStore((s) => s.user);
  const vehiclesQuery = useCustomerVehiclesQuery(user?.id);
  const { data: vehicles = [], error, isLoading } = vehiclesQuery;
  const refreshControl = useScreenRefresh(vehiclesQuery.refetch);

  return (
    <ScreenContainer refreshControl={refreshControl}>
      <View className="gap-5">
        <CommandHeader
          eyebrow="المرآب"
          subtitle="أضف مركباتك لتسهيل الحجز ومتابعة الصيانة."
          title="سياراتي"
        >
          <AppButton onPress={() => router.push('/add-vehicle')}>+ إضافة مركبة</AppButton>
        </CommandHeader>

        {isLoading ? (
          <LoadingSpinner label="جارٍ تحميل سياراتك..." />
        ) : error ? (
          <EmptyState
            message={error instanceof Error ? error.message : 'تعذّر تحميل المركبات.'}
            title="خطأ في التحميل"
          />
        ) : vehicles.length ? (
          <View className="gap-3">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                onEdit={() => router.push(`/edit-vehicle?id=${vehicle.id}`)}
                vehicle={vehicle}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            message="أضف سياراتك لتتمكن من حجز خدمات الصيانة بسهولة."
            title="لا توجد سيارات"
          />
        )}
      </View>
    </ScreenContainer>
  );
}
