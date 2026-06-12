import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';

import { RoleGate } from '@/features/auth/components/RoleGate';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { VehicleForm } from '@/features/vehicles/components/VehicleForm';
import { useCustomerVehiclesQuery } from '@/features/vehicles/hooks/useVehiclesQuery';
import { useVehicleStore } from '@/features/vehicles/store/useVehicleStore';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
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
 <View className="flex-1 bg-background justify-center">
 <LoadingSpinner label="جارٍ تحميل بيانات المركبة..." />
 </View>
 );
 }

 if (!vehicle) {
 return (
 <View className="flex-1 bg-background">
 {/* Top Navigation */}
 <View className="flex-row-reverse items-center justify-between px-margin-mobile h-16 bg-surface-container-lowest z-50 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
 <View className="flex-1" />
 <Text className="font-title-md text-title-md font-bold text-on-surface text-center flex-1">تعديل مركبة</Text>
 <View className="flex-1 flex-row-reverse justify-end">
 <Pressable 
 onPress={() => router.back()}
 className="px-2 py-1 rounded-md active:bg-surface-container-low"
 >
 <Text className="text-primary font-label-sm text-label-sm font-bold">إلغاء</Text>
 </Pressable>
 </View>
 </View>
 <EmptyState message="لم يتم العثور على المركبة." title="غير موجودة" />
 </View>
 );
 }

 const handleSubmit = async (values: VehicleFormValues) => {
 await updateVehicle(vehicle.id, vehicle.ownerId, values);
 router.back();
 };

 return (
 <View className="flex-1 bg-background">
 {/* Top Navigation */}
 <View className="flex-row-reverse items-center justify-between px-margin-mobile h-16 bg-surface-container-lowest z-50 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
 <View className="flex-1" />
 <Text className="font-title-md text-title-md font-bold text-on-surface text-center flex-1">تعديل مركبة</Text>
 <View className="flex-1 flex-row-reverse justify-end">
 <Pressable 
 onPress={() => router.back()}
 className="px-2 py-1 rounded-md active:bg-surface-container-low"
 >
 <Text className="text-primary font-label-sm text-label-sm font-bold">إلغاء</Text>
 </Pressable>
 </View>
 </View>

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
 </View>
 );
}

export default function EditVehicleRoute() {
 return (
 <RoleGate role="customer">
 <EditVehicleScreen />
 </RoleGate>
 );
}
