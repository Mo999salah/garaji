import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';

import { ServiceCard } from '@/features/services/components/ServiceCard';
import { useServiceStore } from '@/features/services/store/useServiceStore';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function MerchantServicesIndexScreen() {
  const { services, loadAllServices, isLoading } = useServiceStore();

  useEffect(() => {
    void loadAllServices();
  }, [loadAllServices]);

  return (
    <ScreenContainer scroll={false}>
      <View className="p-4 pb-0">
        <AppButton onPress={() => router.push('/(merchant)/services/new')}>
          إضافة خدمة جديدة
        </AppButton>
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ScrollView contentContainerClassName="gap-3 p-4">
          {services.length === 0 ? (
            <EmptyState
              message="لا توجد خدمات بعد. أضف أول خدمة لبدء العمل."
              title="لا توجد خدمات"
            />
          ) : (
            services.map((sv) => (
              <ServiceCard
                key={sv.id}
                onPress={() => router.push(`/(merchant)/services/${sv.id}/edit`)}
                service={sv}
              />
            ))
          )}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
