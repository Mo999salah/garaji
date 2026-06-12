import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { RoleGate } from '@/features/auth/components/RoleGate';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { VehicleForm } from '@/features/vehicles/components/VehicleForm';
import { useVehicleStore } from '@/features/vehicles/store/useVehicleStore';
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
 <View className="flex-1 bg-background">
 {/* Top Navigation */}
 <View className="flex-row-reverse items-center justify-between px-margin-mobile h-16 bg-surface-container-lowest z-50 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
 <View className="flex-1" />
 <Text className="font-title-md text-title-md font-bold text-on-surface text-center flex-1">إضافة مركبة</Text>
 <View className="flex-1 flex-row-reverse justify-end">
 <Pressable 
 onPress={() => router.back()}
 className="px-2 py-1 rounded-md active:bg-surface-container-low"
 >
 <Text className="text-primary font-label-sm text-label-sm font-bold">إلغاء</Text>
 </Pressable>
 </View>
 </View>

 {/* Main Content */}
 <VehicleForm isLoading={isLoading} onSubmit={handleSubmit} submitLabel="حفظ المركبة" />
 </View>
 );
}

export default function NewVehicleRoute() {
 return (
 <RoleGate role="customer">
 <NewVehicleScreen />
 </RoleGate>
 );
}
