export type UserRole = 'customer' | 'merchant';

export interface AuthUser {
  id: string;
  role: UserRole;
  displayName: string;
  companyName: string;
  createdAt: string;
}

export interface Session {
  user: AuthUser;
}
