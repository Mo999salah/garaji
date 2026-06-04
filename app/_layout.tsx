import '@/styles/global.css';

import { useFonts } from 'expo-font';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuthSessionListener } from '@/features/auth/hooks/useAuthSessionListener';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { ThemeProvider } from '@/shared/components/ThemeProvider';
import { configureAppDirection } from '@/shared/i18n/rtl';
import { appFontMap, configureDefaultFonts } from '@/shared/lib/fonts';
import { queryClient } from '@/shared/lib/queryClient';
import { useThemeStore } from '@/shared/store/useThemeStore';

export default function RootLayout() {
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const resolved = useThemeStore((s: { resolved: 'light' | 'dark' }) => s.resolved);
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
            <ErrorBoundary>
              <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
              {canRenderApp ? <Stack screenOptions={{ headerShown: false }} /> : null}
            </ErrorBoundary>
          </SafeAreaProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
