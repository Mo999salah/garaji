import type { Href } from 'expo-router';
import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';

import { AuthBlockedState } from '@/features/auth/components/AuthBlockedState';
import { getHomePathForRole, useAuthStore } from '@/features/auth/store/useAuthStore';
import type { UserRole } from '@/shared/types/auth';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export type RoleGateRole = UserRole | 'authenticated';

interface RoleGateProps {
 role: RoleGateRole;
 children: ReactNode;
}

export function RoleGate({ children, role }: RoleGateProps) {
 const { errorMessage, hasHydrated, status, user } = useAuthStore();

 if (!hasHydrated || status === 'idle' || status === 'loading') {
 return (
 <ScreenContainer scroll={false}>
 <LoadingSpinner label="جارٍ التحقق..." />
 </ScreenContainer>
 );
 }

 if (!user) {
 if (status === 'blocked') {
 return <AuthBlockedState message={errorMessage ?? 'ملفك الشخصي غير جاهز بعد.'} />;
 }

 return <Redirect href="/login" />;
 }

 if (role !== 'authenticated' && user.role !== role) {
 return <Redirect href={getHomePathForRole(user.role) as Href} />;
 }

 return <>{children}</>;
}
