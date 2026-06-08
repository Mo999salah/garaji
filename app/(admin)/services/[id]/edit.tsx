import { router, useLocalSearchParams } from 'expo-router';
import { Alert, View } from 'react-native';

import { ServiceForm } from '@/features/services/components/ServiceForm';
import { useAllServicesQuery } from '@/features/services/hooks/useServicesQuery';
import { useServiceStore } from '@/features/services/store/useServiceStore';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function AdminServiceEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: services = [], isLoading: isServicesLoading } = useAllServicesQuery();
  const { editService, isLoading: isSaving } = useServiceStore();
  const service = services.find((item) => item.id === id);

  if (isServicesLoading && !service) {
    return (
      <ScreenContainer>
        <LoadingSpinner label="جارٍ تحميل بيانات الخدمة..." />
      </ScreenContainer>
    );
  }

  if (!service) {
    return (
      <ScreenContainer>
        <EmptyState message="لم يتم العثور على هذه الخدمة." title="الخدمة غير موجودة" />
        <View className="mt-4">
          <AppButton onPress={() => router.back()}>رجوع</AppButton>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <ServiceForm
        initialValues={{
          name: service.name,
          description: service.description,
          serviceType: service.serviceType,
          estimatedPrice: service.estimatedPrice,
          durationMinutes: service.durationMinutes,
          isActive: service.isActive,
          sortOrder: service.sortOrder,
        }}
        isLoading={isSaving}
        onSubmit={async (values) => {
          try {
            await editService(service.id, values);
            router.back();
          } catch {
            Alert.alert('خطأ', 'تعذّر تحديث الخدمة. يرجى المحاولة مجدداً.');
          }
        }}
        submitLabel="حفظ التغييرات"
      />
    </ScreenContainer>
  );
}
