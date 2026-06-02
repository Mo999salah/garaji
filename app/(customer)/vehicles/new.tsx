import { router } from 'expo-router';
import { Text } from 'react-native';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { VehicleForm } from '@/features/vehicles/components/VehicleForm';
import { useVehicleStore } from '@/features/vehicles/store/useVehicleStore';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import type { VehicleFormValues } from '@/features/vehicles/schemas/vehicleSchema';

export default function NewVehicleScreen() {
  const { addVehicle, isLoading } = useVehicleStore();
  const user = useAuthStore((s) => s.user);

  const handleSubmit = async (values: VehicleFormValues) => {
    if (!user) return;
    await addVehicle(user.id, values);
    router.back();
  };

  return (
    <ScreenContainer scroll={false}>
      <Text className="mb-4 px-4 text-2xl font-bold text-ink">إضافة سيارة جديدة</Text>
      <VehicleForm isLoading={isLoading} onSubmit={handleSubmit} submitLabel="إضافة السيارة" />
    </ScreenContainer>
  );
}
