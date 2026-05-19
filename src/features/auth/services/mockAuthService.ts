import type { AuthUser, UserRole } from '@/shared/types/auth';

const roleProfiles: Record<UserRole, Pick<AuthUser, 'companyName' | 'displayName'>> = {
  customer: {
    displayName: 'Procurement Lead',
    companyName: 'Al Noor Auto Parts',
  },
  merchant: {
    displayName: 'Merchant Admin',
    companyName: 'Qitaa Supply Co.',
  },
};

export async function signInWithMockRole(role: UserRole): Promise<AuthUser> {
  await new Promise((resolve) => setTimeout(resolve, 450));

  return {
    id: `mock-${role}-user`,
    role,
    displayName: roleProfiles[role].displayName,
    companyName: roleProfiles[role].companyName,
    createdAt: new Date().toISOString(),
  };
}
