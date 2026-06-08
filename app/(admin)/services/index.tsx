import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { ServiceCard } from '@/features/services/components/ServiceCard';
import { useAllServicesQuery } from '@/features/services/hooks/useServicesQuery';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { CommandHeader } from '@/shared/components/OperationalUI';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useScreenRefresh } from '@/shared/hooks/useScreenRefresh';

export default function AdminServicesScreen() {
  const servicesQuery = useAllServicesQuery();
  const { data: services = [], isLoading } = servicesQuery;
  const refreshControl = useScreenRefresh(servicesQuery.refetch);

  return (
    <ScreenContainer scroll={false}>
      <View className="gap-4 px-5 py-5">
        <CommandHeader
          eyebrow="الخدمات"
          subtitle="تابع الخدمات المتاحة وأسعارها للعملاء."
          title="إدارة الخدمات"
        >
          <AppButton onPress={() => router.push('/(admin)/services/new')}>
            + إضافة خدمة
          </AppButton>
        </CommandHeader>
      </View>

      {isLoading ? (
        <LoadingSpinner label="جارٍ تحميل الخدمات..." />
      ) : (
        <ScrollView contentContainerClassName="gap-3 px-5 pb-5" refreshControl={refreshControl}>
          {services.length === 0 ? (
            <EmptyState
              message="لا توجد خدمات بعد. أضف أول خدمة لبدء العمل."
              title="لا توجد خدمات"
            />
          ) : (
            services.map((service) => (
              <ServiceCard
                key={service.id}
                onPress={() =>
                  router.push({
                    pathname: '/(admin)/services/[id]/edit',
                    params: { id: service.id },
                  })
                }
                service={service}
              />
            ))
          )}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
