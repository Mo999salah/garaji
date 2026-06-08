import { Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { Vehicle } from '@/features/vehicles/types';
import { AnimatedPressable } from '@/shared/components/AnimatedPressable';

import { AppText as Text } from '@/shared/components/AppText';
interface VehicleCardProps {
  vehicle: Vehicle;
  onPress?: () => void;
  onEdit?: () => void;
  selected?: boolean;
}

export function VehicleCard({ onEdit, onPress, selected, vehicle }: VehicleCardProps) {
  const containerCls = [
    'rounded-lg border p-5 shadow-sm shadow-brand-700/10 bg-card dark:bg-dark-card dark:shadow-none',
    selected
      ? 'border-brand-500 bg-brand-50/60 dark:border-dark-brand-500 dark:bg-dark-brand-50/60'
      : 'border-line dark:border-dark-line',
  ].join(' ');

  return (
    <AnimatedPressable
      accessibilityLabel={`${vehicle.make} ${vehicle.model} ${vehicle.year}`}
      accessibilityRole="button"
      className={containerCls}
      onPress={onPress}
    >
      <View className="flex-row-reverse items-start justify-between gap-4">
        <View className="flex-1 items-end">
          <View className="mb-3 h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-dark-brand-50">
            <Feather name="truck" size={18} color="#0284C7" />
          </View>
          <Text className="font-sans text-lg font-bold text-ink text-right dark:text-dark-ink">
            {vehicle.make} {vehicle.model}
          </Text>
          <Text className="font-sans mt-0.5 text-sm text-muted text-right dark:text-dark-muted">
            {vehicle.year}
            {vehicle.color ? `  ·  ${vehicle.color}` : ''}
          </Text>
          
          {Boolean(vehicle.plateNumber) && (
            <View className="mt-3 rounded-lg border border-line bg-surface-soft px-3 py-1 shadow-inner dark:border-dark-line dark:bg-dark-surface">
              <Text className="text-xs font-mono font-bold tracking-widest text-ink uppercase dark:text-dark-ink">
                {vehicle.plateNumber}
              </Text>
            </View>
          )}
          
          {vehicle.mileage !== undefined && (
            <Text className="font-sans mt-2 text-xs text-muted dark:text-dark-muted">
              العداد: {vehicle.mileage.toLocaleString('ar-SA')} كم
            </Text>
          )}
        </View>
        {onEdit && (
          <Pressable
            accessibilityLabel="تعديل المركبة"
            accessibilityRole="button"
            className="rounded-lg border border-line bg-surface-soft px-3 py-1.5 active:opacity-80 dark:border-dark-line dark:bg-dark-surface/50"
            onPress={onEdit}
          >
            <Text className="font-sans text-xs font-medium text-ink dark:text-dark-ink">تعديل</Text>
          </Pressable>
        )}
      </View>
    </AnimatedPressable>
  );
}
