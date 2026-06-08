import type { PropsWithChildren, ReactElement } from "react";
import type { RefreshControlProps } from "react-native";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenContainerProps extends PropsWithChildren {
  scroll?: boolean;
  padded?: boolean;
  refreshControl?: ReactElement<RefreshControlProps>;
}

export function ScreenContainer({
  children,
  padded = true,
  refreshControl,
  scroll = true,
}: ScreenContainerProps) {
  const contentClassName = `${padded ? "px-5 py-5" : ""} w-full max-w-4xl self-center`;

  if (!scroll) {
    return (
      <SafeAreaView className="flex-1 bg-surface dark:bg-dark-surface">
        <View className={`flex-1 ${contentClassName}`}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-dark-surface">
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow"
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
      >
        <View className={contentClassName}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
