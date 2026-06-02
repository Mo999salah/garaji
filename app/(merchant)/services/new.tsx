import { router } from 'expo-router';
import { Alert } from 'react-native';

import { ServiceForm } from '@/features/services/components/ServiceForm';
import { useServiceStore } from '@/features/services/store/useServiceStore';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function MerchantServicesNewScreen() {
  const { addService, isLoading } = useServiceStore();

  return (
    <ScreenContainer scroll={false}>
      <ServiceForm
        isLoading={isLoading}
        onSubmit={async (values) => {
          try {
            await addService(values);
            router.back();
          } catch {
            Alert.alert('خطأ', 'تعذّر إضافة الخدمة. يرجى المحاولة مجدداً.');
          }
        }}
        submitLabel="إضافة الخدمة"
      />
    </ScreenContainer>
  );
}
