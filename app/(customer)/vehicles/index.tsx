import { router } from 'expo-router';
import { View } from 'react-native';

import { VehicleCard } from '@/features/vehicles/components/VehicleCard';
import { useVehicleStore } from '@/features/vehicles/store/useVehicleStore';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

import { AppText as Text } from '@/shared/components/AppText';
export default function VehiclesIndexScreen() {
  const { errorMessage, isLoading, vehicles } = useVehicleStore();

  return (
    <ScreenContainer>
      <View className="gap-5">
        <View className="flex-row items-center justify-between gap-3">
          <Text className="font-sans text-2xl font-bold text-ink">جراج سياراتي</Text>
          <AppButton onPress={() => router.push('/(customer)/vehicles/new')}>+ إضافة</AppButton>
        </View>

        {isLoading ? (
          <LoadingSpinner label="جارٍ تحميل سياراتك..." />
        ) : errorMessage ? (
          <EmptyState message={errorMessage} title="خطأ في التحميل" />
        ) : vehicles.length ? (
          <View className="gap-3">
            {vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                onEdit={() => router.push(`/(customer)/vehicles/${v.id}/edit`)}
                vehicle={v}
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
