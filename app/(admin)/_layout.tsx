import type { Href } from 'expo-router';
import { Redirect, Stack } from 'expo-router';
import { useEffect } from 'react';

import { AuthBlockedState } from '@/features/auth/components/AuthBlockedState';
import { usePushNotifications } from '@/features/auth/hooks/usePushNotifications';
import { getHomePathForRole, useAuthStore } from '@/features/auth/store/useAuthStore';
import { useBranchStore } from '@/features/branches/store/useBranchStore';
import { useServiceStore } from '@/features/services/store/useServiceStore';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function AdminLayout() {
 const { errorMessage, hasHydrated, status, user } = useAuthStore();

 usePushNotifications(user?.role === 'merchant' ? user : null);

 useEffect(() => {
 if (user?.role === 'merchant') {
 void useServiceStore.getState().loadAllServices();
 void useBranchStore.getState().loadAllBranches();
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
 return <AuthBlockedState message={errorMessage ?? 'حسابك غير جاهز بعد.'} />;
 }

 return <Redirect href="/login" />;
 }

 if (user.role !== 'merchant') {
 return <Redirect href={getHomePathForRole(user.role) as Href} />;
 }

 return <Stack screenOptions={{ headerShown: false }} />;
}
