import type { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenContainerProps extends PropsWithChildren {
  scroll?: boolean;
}

export function ScreenContainer({ children, scroll = true }: ScreenContainerProps) {
  if (!scroll) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <View className="flex-1 px-5 py-4">{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow px-5 py-4"
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
