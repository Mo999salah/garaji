import { View } from 'react-native';

import type { Branch } from '@/features/branches/types';
import { AnimatedPressable } from '@/shared/components/AnimatedPressable';

import { AppText as Text } from '@/shared/components/AppText';
interface BranchCardProps {
  branch: Branch;
  onPress?: () => void;
  selected?: boolean;
}

export function BranchCard({ branch, onPress, selected }: BranchCardProps) {
  const containerCls = [
    'rounded-lg border p-5 shadow-sm shadow-brand-700/10 bg-card dark:bg-dark-card dark:shadow-none',
    selected
      ? 'border-brand-500 bg-brand-50/60 dark:border-dark-brand-500 dark:bg-dark-brand-50/60'
      : 'border-line dark:border-dark-line',
  ].join(' ');

  return (
    <AnimatedPressable
      accessibilityLabel={branch.name}
      accessibilityRole="button"
      className={containerCls}
      onPress={onPress}
    >
      <View className="flex-row-reverse items-start justify-between gap-4">
        <View className="flex-1 items-end">
          <View className="mb-3 h-9 w-9 items-center justify-center rounded-lg bg-gold-50 dark:bg-dark-gold-50">
            <Text className="font-sans text-sm font-black text-gold-600 dark:text-dark-gold-600">فر</Text>
          </View>
          <Text className="font-sans text-base font-bold text-ink text-right dark:text-dark-ink">{branch.name}</Text>
          <Text className="font-sans mt-0.5 text-sm text-muted text-right dark:text-dark-muted">{branch.city}</Text>
          <Text className="font-sans mt-0.5 text-sm text-muted text-right dark:text-dark-muted">{branch.address}</Text>
          {branch.workingHours ? (
            <Text className="font-sans mt-2 text-xs text-muted text-right dark:text-dark-muted">ساعات العمل: {branch.workingHours}</Text>
          ) : null}
          {branch.phone ? (
            <Text className="font-sans mt-1 text-xs text-muted text-right dark:text-dark-muted">الهاتف: {branch.phone}</Text>
          ) : null}
        </View>
        {selected && (
          <View className="h-6 w-6 items-center justify-center rounded-lg bg-brand-500 shadow-sm shadow-brand-700/10 dark:bg-dark-brand-500">
            <Text className="font-sans text-xs font-bold text-white dark:text-brand-700">✓</Text>
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}
