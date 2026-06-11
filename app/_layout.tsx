import '@/styles/global.css';

import { useFonts } from 'expo-font';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuthSessionListener } from '@/features/auth/hooks/useAuthSessionListener';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { ErrorBoundary as ReactErrorBoundary } from '@/shared/components/ErrorBoundary';
import { AppText as Text } from '@/shared/components/AppText';
import { OfflineBanner } from '@/shared/components/OfflineBanner';
import { ThemeProvider, useTheme } from '@/shared/components/ThemeProvider';
import { configureAppDirection } from '@/shared/i18n/rtl';
import { appFontMap, configureDefaultFonts } from '@/shared/lib/fonts';
import { queryClient } from '@/shared/lib/queryClient';

/** StatusBar that adapts to the current theme. */
function DynamicStatusBar() {
  const { colorScheme } = useTheme();
  return <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />;
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    if (__DEV__) {
      console.error('Expo Router boundary caught root error', error);
    }
  }, [error]);

  return (
    <View className="flex-1 items-center justify-center bg-surface px-6 dark:bg-dark-surface">
      <View className="w-full max-w-md items-end rounded-lg border border-line bg-white p-6 shadow-tactile-md dark:border-dark-line dark:bg-dark-card">
        <View className="h-12 w-12 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30">
          <Text className="font-sans text-2xl font-black text-amber-600">
            !
          </Text>
        </View>
        <Text className="font-sans mt-5 text-right text-2xl font-black text-ink dark:text-dark-ink">
          عذراً، حدث خطأ غير متوقع
        </Text>
        <Text className="font-sans mt-2 text-right text-sm leading-6 text-muted dark:text-dark-muted">
          أعد تحميل التطبيق للمتابعة بأمان.
        </Text>
        <Pressable
          accessibilityLabel="إعادة تحميل التطبيق"
          accessibilityRole="button"
          className="mt-6 min-h-12 w-full items-center justify-center rounded-lg bg-[#F59E0B] px-5 active:opacity-85"
          onPress={() => void retry()}
        >
          <Text className="font-sans text-base font-black text-slate-950">
            إعادة تحميل التطبيق
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function RootLayout() {
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const [fontsLoaded, fontError] = useFonts(appFontMap);

  useAuthSessionListener();

  if (fontsLoaded) {
    configureDefaultFonts();
  }

  useEffect(() => {
    configureAppDirection();
  }, []);

  useEffect(() => {
    if (!fontsLoaded && !fontError) {
      return;
    }

    void hydrateSession();
  }, [fontError, fontsLoaded, hydrateSession]);

  const canRenderApp = fontsLoaded || Boolean(fontError);

  return (
    <GestureHandlerRootView className="flex-1">
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <ReactErrorBoundary>
              <DynamicStatusBar />
              {canRenderApp ? <Stack screenOptions={{ headerShown: false }} /> : null}
              <OfflineBanner />
            </ReactErrorBoundary>
          </SafeAreaProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
