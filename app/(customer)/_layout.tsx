import type { Href } from 'expo-router';
import { Redirect, Stack } from 'expo-router';
import { useEffect } from 'react';

import { AuthBlockedState } from '@/features/auth/components/AuthBlockedState';
import { usePushNotifications } from '@/features/auth/hooks/usePushNotifications';
import { getHomePathForRole, useAuthStore } from '@/features/auth/store/useAuthStore';
import { useBranchStore } from '@/features/branches/store/useBranchStore';
import { useRequestStore } from '@/features/requests/store/useRequestStore';
import { useServiceStore } from '@/features/services/store/useServiceStore';
import { useVehicleStore } from '@/features/vehicles/store/useVehicleStore';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function CustomerLayout() {
  const { errorMessage, hasHydrated, status, user } = useAuthStore();

  usePushNotifications(user?.role === 'customer' ? user : null);

  useEffect(() => {
    if (user?.role === 'customer') {
      void useVehicleStore.getState().loadVehicles(user.id);
      void useRequestStore.getState().loadCustomerRequests(user.id);
      void useServiceStore.getState().loadActiveServices();
      void useBranchStore.getState().loadActiveBranches();
    }
  }, [user?.id, user?.role]);

  if (!hasHydrated || status === 'idle' || status === 'loading') {
    return (
      <ScreenContainer scroll={false}>
        <LoadingSpinner label="جارٍ التحقق..." />
      </ScreenContainer>
    );
  }

  if (!user) {
    if (status === 'blocked') {
      return (
        <AuthBlockedState message={errorMessage ?? 'ملفك الشخصي غير جاهز بعد.'} />
      );
    }

    return <Redirect href="/(auth)/login" />;
  }

  if (user.role !== 'customer') {
    return <Redirect href={getHomePathForRole(user.role) as Href} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: 'Tajawal_700Bold',
          fontSize: 18,
          color: '#111111',
        },
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    />
  );
}
