import { View } from 'react-native';

import { AppText as Text } from '@/shared/components/AppText';
interface EmptyStateProps {
  title: string;
  message: string;
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View className="items-center justify-center rounded-lg border border-dashed border-line bg-card/90 p-8 dark:border-dark-line dark:bg-dark-card/80">
      <View className="mb-4 h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-dark-brand-50">
        <Text className="font-sans text-lg font-black text-brand-500 dark:text-dark-brand-500">+</Text>
      </View>
      <Text className="font-sans text-center text-lg font-semibold text-ink dark:text-dark-ink">{title}</Text>
      <Text className="font-sans mt-2 text-center text-sm leading-5 text-muted dark:text-dark-muted">{message}</Text>
    </View>
  );
}
