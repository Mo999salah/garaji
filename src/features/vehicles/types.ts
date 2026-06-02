export interface Vehicle {
  id: string;
  ownerId: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  color?: string;
  mileage?: number;
  createdAt: string;
  updatedAt: string;
}
