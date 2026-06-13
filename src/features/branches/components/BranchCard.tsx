import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import type { Branch } from '@/features/branches/types';
import { AppColors } from '@/shared/lib/colors';
import { AppText as Text } from '@/shared/components/AppText';
import { AnimatedPressable } from '@/shared/components/AnimatedPressable';
import { isBranchOpen } from '@/shared/lib/workingHours';

interface BranchCardProps {
  branch: Branch;
  onPress?: () => void;
  selected?: boolean;
  /** Pre-computed distance string from a hook, e.g. "2.5 كم" */
  distanceLabel?: string;
}

export function BranchCard({ branch, onPress, selected, distanceLabel }: BranchCardProps) {
  const { isOpen, label: openLabel } = isBranchOpen(branch.workingHours);

  return (
    <AnimatedPressable
      accessibilityLabel={branch.name}
      accessibilityHint="اضغط لاختيار هذا الفرع"
      accessibilityRole="button"
      className="relative block"
      onPress={onPress}
      scaleValue={0.98}
    >
      <View className={`bg-surface-container-lowest rounded-2xl p-4 shadow-soft border flex-row-reverse items-start gap-4 ${
        selected ? 'border-primary bg-on-primary-container' : 'border-transparent'
      }`}>
        {selected && (
          <View className="absolute right-0 top-1/2 -translate-y-1/2 w-[4px] h-3/4 bg-primary rounded-l-full" />
        )}

        <View className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
          selected ? 'bg-primary-container/20' : 'bg-surface-container-highest'
        }`}>
          <MaterialIcons name="storefront" size={24} color={selected ? AppColors.primary : AppColors.onSurfaceVariant} />
        </View>

        <View className="flex-1">
          <View className="flex-row-reverse justify-between items-start mb-1">
            <Text className="font-button-text text-button-text font-bold text-on-background text-right">{branch.name}</Text>
          </View>
          <Text className="font-body-md text-[14px] leading-[24px] text-on-surface-variant mb-2 text-right">{branch.address}</Text>
          <View className="flex-row-reverse items-center gap-4 text-on-surface-variant">
            {distanceLabel ? (
              <View className="flex-row-reverse items-center gap-1">
                <MaterialIcons name="location-on" size={14} color={AppColors.onSurfaceVariant} />
                <Text className="font-label-sm text-[12px] leading-[18px] text-on-surface-variant">{distanceLabel}</Text>
              </View>
            ) : null}
            <View className="flex-row-reverse items-center gap-1">
              <MaterialIcons name="schedule" size={14} color={AppColors.onSurfaceVariant} />
              <Text className={`font-label-sm text-[12px] leading-[18px] ${isOpen ? 'text-success' : 'text-error'}`}>{openLabel}</Text>
            </View>
          </View>
        </View>

        <View className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
          selected ? 'border-primary bg-primary' : 'border-outline'
        }`}>
          {selected && <MaterialIcons name="check" size={12} color="white" />}
        </View>
      </View>
    </AnimatedPressable>
  );
}
