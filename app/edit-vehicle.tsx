import { router, useLocalSearchParams } from 'expo-router';

import { RoleGate } from '@/features/auth/components/RoleGate';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { VehicleForm } from '@/features/vehicles/components/VehicleForm';
import { useCustomerVehiclesQuery } from '@/features/vehicles/hooks/useVehiclesQuery';
import { useVehicleStore } from '@/features/vehicles/store/useVehicleStore';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import type { VehicleFormValues } from '@/features/vehicles/schemas/vehicleSchema';

import { AppText as Text } from '@/shared/components/AppText';

function EditVehicleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const { data: vehicles = [], isLoading: isVehiclesLoading } = useCustomerVehiclesQuery(user?.id);
  const { isLoading: isSaving, updateVehicle } = useVehicleStore();
  const vehicle = vehicles.find((v) => v.id === id);

  if (isVehiclesLoading && !vehicle) {
    return (
      <ScreenContainer>
        <LoadingSpinner label="جارٍ تحميل بيانات المركبة..." />
      </ScreenContainer>
    );
  }

  if (!vehicle) {
    return (
      <ScreenContainer>
        <EmptyState message="لم يتم العثور على المركبة." title="غير موجودة" />
      </ScreenContainer>
    );
  }

  const handleSubmit = async (values: VehicleFormValues) => {
    await updateVehicle(vehicle.id, vehicle.ownerId, values);
    router.back();
  };

  return (
    <ScreenContainer scroll={false}>
      <Text className="font-sans mb-4 px-4 text-2xl font-bold text-ink">تعديل بيانات السيارة</Text>
      <VehicleForm
        initialValues={{
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          plateNumber: vehicle.plateNumber,
          color: vehicle.color,
          mileage: vehicle.mileage,
          documentUrl: vehicle.documentUrl,
        }}
        isLoading={isSaving}
        onSubmit={handleSubmit}
        submitLabel="حفظ التغييرات"
      />
    </ScreenContainer>
  );
}

export default function EditVehicleRoute() {
  return (
    <RoleGate role="customer">
      <EditVehicleScreen />
    </RoleGate>
  );
}
