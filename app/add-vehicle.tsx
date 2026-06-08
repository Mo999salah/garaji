import { router } from 'expo-router';

import { RoleGate } from '@/features/auth/components/RoleGate';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { VehicleForm } from '@/features/vehicles/components/VehicleForm';
import { useVehicleStore } from '@/features/vehicles/store/useVehicleStore';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import type { VehicleFormValues } from '@/features/vehicles/schemas/vehicleSchema';

import { AppText as Text } from '@/shared/components/AppText';

function NewVehicleScreen() {
  const { addVehicle, isLoading } = useVehicleStore();
  const user = useAuthStore((s) => s.user);

  const handleSubmit = async (values: VehicleFormValues) => {
    if (!user) return;
    await addVehicle(user.id, values);
    router.back();
  };

  return (
    <ScreenContainer scroll={false}>
      <Text className="font-sans mb-4 px-4 text-2xl font-bold text-ink">إضافة سيارة جديدة</Text>
      <VehicleForm isLoading={isLoading} onSubmit={handleSubmit} submitLabel="إضافة السيارة" />
    </ScreenContainer>
  );
}

export default function NewVehicleRoute() {
  return (
    <RoleGate role="customer">
      <NewVehicleScreen />
    </RoleGate>
  );
}
