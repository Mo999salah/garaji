import type { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps extends PropsWithChildren {
  scroll?: boolean;
  padded?: boolean;
}

export function ScreenContainer({ children, padded = true, scroll = true }: ScreenContainerProps) {
  const contentClassName = `${padded ? 'px-5 py-5' : ''} w-full`;

  if (!scroll) {
    return (
      <SafeAreaView className="flex-1 bg-surface dark:bg-dark-surface">
        <View className="absolute inset-x-0 top-0 h-48 bg-surface-soft dark:bg-dark-card/40" />
        <View className="absolute inset-x-0 bottom-0 h-32 bg-gold-50/40 dark:bg-dark-gold-50/20" />
        <View className={`flex-1 ${contentClassName}`}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-dark-surface">
      <View className="absolute inset-x-0 top-0 h-48 bg-surface-soft dark:bg-dark-card/40" />
      <View className="absolute inset-x-0 bottom-0 h-32 bg-gold-50/40 dark:bg-dark-gold-50/20" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className={contentClassName}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
