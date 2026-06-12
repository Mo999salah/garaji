export type ServiceType = 'branch' | 'mobile' | 'both';

export interface Service {
 id: string;
 name: string;
 description?: string;
 serviceType: ServiceType;
 estimatedPrice?: number;
 durationMinutes?: number;
 isActive: boolean;
 sortOrder: number;
 createdAt: string;
 updatedAt: string;
}
