import '@/styles/global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuthSessionListener } from '@/features/auth/hooks/useAuthSessionListener';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { configureAppDirection } from '@/shared/i18n/rtl';
import { queryClient } from '@/shared/lib/queryClient';

export default function RootLayout() {
  const hydrateSession = useAuthStore((state) => state.hydrateSession);

  useAuthSessionListener();

  useEffect(() => {
    configureAppDirection();
    void hydrateSession();
  }, [hydrateSession]);

  return (
    <GestureHandlerRootView className="flex-1">
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ErrorBoundary>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
          </ErrorBoundary>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
