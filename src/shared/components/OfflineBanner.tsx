import * as Network from 'expo-network';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText as Text } from '@/shared/components/AppText';

function isOffline(networkState: Network.NetworkState) {
  if (networkState.isInternetReachable === false) {
    return true;
  }

  return networkState.isConnected === false;
}

export function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const networkState = Network.useNetworkState();

  if (!isOffline(networkState)) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(260)}
      exiting={FadeOutUp.duration(180)}
      pointerEvents="none"
      style={{
        left: 16,
        position: 'absolute',
        right: 16,
        top: Math.max(insets.top, 10) + 8,
        zIndex: 50,
      }}
    >
      <View className="rounded-lg border border-amber-200 bg-amber-50/95 px-4 py-3 shadow-tactile-md dark:border-amber-500/30 dark:bg-slate-900/95">
        <Text className="font-sans text-center text-sm font-bold text-amber-900 dark:text-amber-200">
          لا يوجد اتصال بالإنترنت
        </Text>
      </View>
    </Animated.View>
  );
}
