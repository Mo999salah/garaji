import { router, useLocalSearchParams } from 'expo-router';
import { Alert, View } from 'react-native';

import { ServiceForm } from '@/features/services/components/ServiceForm';
import { useServiceStore } from '@/features/services/store/useServiceStore';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function MerchantServicesEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { services, editService, isLoading } = useServiceStore();

  const service = services.find((sv) => sv.id === id);

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
        isLoading={isLoading}
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
