import type { UserRole } from '@/shared/types/auth';

export function getHomePathForRole(role: UserRole) {
  return role === 'customer' ? '/(tabs)' : '/(admin)/dashboard';
}
