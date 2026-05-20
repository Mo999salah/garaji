import type { Href } from 'expo-router';
import { Redirect, Stack } from 'expo-router';
import { useEffect } from 'react';

import { AuthBlockedState } from '@/features/auth/components/AuthBlockedState';
import { getHomePathForRole, useAuthStore } from '@/features/auth/store/useAuthStore';
import { useProductStore } from '@/features/products/store/useProductStore';
import { useOrderStore } from '@/features/orders/store/useOrderStore';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function CustomerLayout() {
  const { errorMessage, hasHydrated, status, user } = useAuthStore();

  useEffect(() => {
    if (user?.role === 'customer') {
      void useProductStore.getState().loadCatalog();
      void useOrderStore.getState().loadCustomerOrders(user.id);
    }
  }, [user?.id, user?.role]);

  if (!hasHydrated || status === 'idle' || status === 'loading') {
    return (
      <ScreenContainer scroll={false}>
        <LoadingSpinner label="Checking access" />
      </ScreenContainer>
    );
  }

  if (!user) {
    if (status === 'blocked') {
      return (
        <AuthBlockedState message={errorMessage ?? 'Your customer profile is not ready yet.'} />
      );
    }

    return <Redirect href="/(auth)/login" />;
  }

  if (user.role !== 'customer') {
    return <Redirect href={getHomePathForRole(user.role) as Href} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
