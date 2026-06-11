import { Pressable, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import type { Vehicle } from '@/features/vehicles/types';

import { AppText as Text } from '@/shared/components/AppText';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  deleteLoading?: boolean;
  selected?: boolean;
}

export function VehicleCard({
  deleteLoading,
  onDelete,
  onEdit,
  onPress,
  selected,
  vehicle,
}: VehicleCardProps) {
  return (
    <Pressable
      accessibilityLabel={`${vehicle.make} ${vehicle.model} ${vehicle.year}`}
      accessibilityRole="button"
      className="relative block"
      onPress={onPress}
    >
      <View className={`bg-surface-container-lowest rounded-[16px] p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border flex-row-reverse items-start gap-4 transition-all duration-200 ${
        selected ? 'border-primary bg-[#F4FFFC]' : 'border-transparent'
      }`}>
        {selected && (
          <View className="absolute right-0 top-1/2 -translate-y-1/2 w-[4px] h-3/4 bg-primary rounded-l-full" />
        )}
        
        <View className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
          selected ? 'bg-primary-container/20' : 'bg-surface-container-highest'
        }`}>
          <MaterialIcons name="directions-car" size={24} color={selected ? "#00685f" : "#3d4947"} />
        </View>

        <View className="flex-1">
          <View className="flex-row-reverse justify-between items-start mb-1">
            <Text className="font-button-text text-[16px] leading-[16px] font-bold text-on-background text-right">{vehicle.make} {vehicle.model}</Text>
            {Boolean(vehicle.plateNumber) && (
              <View className="flex-row-reverse items-center gap-1 bg-surface-container rounded-full px-2 py-0.5">
                <Text className="font-label-sm text-[11px] text-on-surface-variant font-bold uppercase tracking-widest">{vehicle.plateNumber}</Text>
              </View>
            )}
          </View>
          <Text className="font-body-md text-[14px] leading-[24px] text-on-surface-variant mb-2 text-right">
            {vehicle.year}
            {vehicle.color ? `  ·  ${vehicle.color}` : ''}
          </Text>
          {vehicle.mileage !== undefined ? (
            <View className="flex-row-reverse items-center gap-4 text-on-surface-variant mt-1">
              <View className="flex-row-reverse items-center gap-1">
                <MaterialIcons name="speed" size={14} color="#3d4947" />
                <Text className="font-label-sm text-[12px] leading-[18px] text-on-surface-variant">{vehicle.mileage.toLocaleString('ar-SA')} كم</Text>
              </View>
            </View>
          ) : null}

          {(onEdit || onDelete) && (
            <View className="flex-row-reverse items-center gap-2 mt-4">
              {onEdit ? (
                <Pressable
                  accessibilityLabel="تعديل المركبة"
                  accessibilityRole="button"
                  className="rounded-lg border border-outline bg-surface-soft px-3 py-1.5 active:opacity-80"
                  onPress={onEdit}
                >
                  <Text className="font-sans text-xs font-medium text-on-surface">
                    تعديل
                  </Text>
                </Pressable>
              ) : null}
              {onDelete ? (
                <Pressable
                  accessibilityLabel="حذف المركبة"
                  accessibilityRole="button"
                  accessibilityState={{ busy: deleteLoading }}
                  className="rounded-lg border border-error/30 bg-error-container px-3 py-1.5 active:opacity-80"
                  disabled={deleteLoading}
                  onPress={onDelete}
                >
                  <Text className="font-sans text-xs font-medium text-error">
                    {deleteLoading ? 'جارٍ الحذف...' : 'حذف'}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          )}
        </View>

        <View className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-colors ${
          selected ? 'border-primary bg-primary' : 'border-outline'
        }`}>
          {selected && <MaterialIcons name="check" size={12} color="white" />}
        </View>
      </View>
    </Pressable>
  );
}
