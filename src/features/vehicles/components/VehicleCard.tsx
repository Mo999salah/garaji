import { Pressable, Text, View } from 'react-native';

import type { Vehicle } from '@/features/vehicles/types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress?: () => void;
  onEdit?: () => void;
  selected?: boolean;
}

export function VehicleCard({ onEdit, onPress, selected, vehicle }: VehicleCardProps) {
  const containerCls = [
    'rounded-lg border p-4 shadow-sm bg-white',
    selected ? 'border-brand-600 ring-2 ring-brand-200' : 'border-line',
  ].join(' ');

  return (
    <Pressable
      accessibilityLabel={`${vehicle.make} ${vehicle.model} ${vehicle.year}`}
      accessibilityRole="button"
      className={containerCls}
      onPress={onPress}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-lg font-bold text-ink">
            {vehicle.make} {vehicle.model}
          </Text>
          <Text className="mt-0.5 text-sm text-muted">
            {vehicle.year}
            {vehicle.color ? `  ·  ${vehicle.color}` : ''}
          </Text>
          {Boolean(vehicle.plateNumber) && (
            <Text className="mt-1 text-sm font-semibold text-ink">{vehicle.plateNumber}</Text>
          )}
          {vehicle.mileage !== undefined && (
            <Text className="mt-1 text-xs text-muted">
              العداد: {vehicle.mileage.toLocaleString('ar-SA')} كم
            </Text>
          )}
        </View>
        {onEdit && (
          <Pressable
            accessibilityLabel="تعديل المركبة"
            accessibilityRole="button"
            className="rounded-md border border-line px-3 py-1.5 active:opacity-70"
            onPress={onEdit}
          >
            <Text className="text-xs font-medium text-ink">تعديل</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}
