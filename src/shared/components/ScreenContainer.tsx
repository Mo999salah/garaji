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
      <SafeAreaView className="flex-1 bg-[#FFFFFF] dark:bg-[#0A0A0A]">
        <View className={`flex-1 ${contentClassName}`}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FFFFFF] dark:bg-[#0A0A0A]">
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
