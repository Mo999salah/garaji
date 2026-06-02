import type { Vehicle } from '@/features/vehicles/types';

export const mockVehicles: Vehicle[] = [
  {
    id: 'vehicle-demo-001',
    ownerId: 'customer-demo',
    make: 'تويوتا',
    model: 'كامري',
    year: 2022,
    plateNumber: 'أ-ب-ج 1234',
    color: 'أبيض',
    mileage: 35000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vehicle-demo-002',
    ownerId: 'customer-demo',
    make: 'هيونداي',
    model: 'سوناتا',
    year: 2020,
    plateNumber: 'د-ه-و 5678',
    color: 'رمادي',
    mileage: 72000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
