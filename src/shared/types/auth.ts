export type UserRole = 'customer' | 'merchant';

export interface AuthUser {
 id: string;
 role: UserRole;
 fullName: string;
 phone?: string;
 merchantId?: string;
 merchantName?: string;
 createdAt: string;
}

export interface Session {
 user: AuthUser;
}
