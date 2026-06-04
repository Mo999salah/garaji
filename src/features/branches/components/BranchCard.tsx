import { Pressable, Text, View } from 'react-native';

import type { Branch } from '@/features/branches/types';

interface BranchCardProps {
  branch: Branch;
  onPress?: () => void;
  selected?: boolean;
}

export function BranchCard({ branch, onPress, selected }: BranchCardProps) {
  const containerCls = [
    'rounded-lg border p-4 shadow-sm bg-white',
    selected ? 'border-brand-600' : 'border-line',
  ].join(' ');

  return (
    <Pressable
      accessibilityLabel={branch.name}
      accessibilityRole="button"
      className={containerCls}
      onPress={onPress}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base font-bold text-ink">{branch.name}</Text>
          <Text className="mt-0.5 text-sm text-muted">{branch.city}</Text>
          <Text className="mt-0.5 text-sm text-muted">{branch.address}</Text>
          {branch.workingHours ? (
            <Text className="mt-1 text-xs text-muted">⏰ {branch.workingHours}</Text>
          ) : null}
          {branch.phone ? (
            <Text className="mt-1 text-xs text-muted">📞 {branch.phone}</Text>
          ) : null}
        </View>
        {selected && (
          <View className="h-5 w-5 items-center justify-center rounded-full bg-brand-600">
            <Text className="text-xs text-white">✓</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
