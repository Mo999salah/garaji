import { View } from 'react-native';

import { ServiceCard } from '@/features/services/components/ServiceCard';
import { useServiceStore } from '@/features/services/store/useServiceStore';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

import { AppText as Text } from '@/shared/components/AppText';
export default function ServicesIndexScreen() {
  const { error, isLoading, services } = useServiceStore();

  return (
    <ScreenContainer>
      <View className="gap-5">
        <Text className="font-sans text-2xl font-bold text-ink">خدماتنا</Text>

        {isLoading ? (
          <LoadingSpinner label="جارٍ تحميل الخدمات..." />
        ) : error ? (
          <EmptyState message={error} title="خطأ في التحميل" />
        ) : services.length ? (
          <View className="gap-3">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </View>
        ) : (
          <EmptyState message="لا توجد خدمات متاحة حالياً." title="لا توجد خدمات" />
        )}
      </View>
    </ScreenContainer>
  );
}
