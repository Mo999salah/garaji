import { router, useLocalSearchParams } from 'expo-router';


import { VehicleForm } from '@/features/vehicles/components/VehicleForm';
import { useVehicleStore } from '@/features/vehicles/store/useVehicleStore';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import type { VehicleFormValues } from '@/features/vehicles/schemas/vehicleSchema';

import { AppText as Text } from '@/shared/components/AppText';
export default function EditVehicleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updateVehicle, isLoading, vehicles } = useVehicleStore();
  const vehicle = vehicles.find((v) => v.id === id);

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
        isLoading={isLoading}
        onSubmit={handleSubmit}
        submitLabel="حفظ التغييرات"
      />
    </ScreenContainer>
  );
}
