export type ServiceRequestStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type ServiceRequestType = 'branch_appointment' | 'mobile_service';

export interface ServiceRequestEvent {
  id: string;
  requestId: string;
  status: ServiceRequestStatus;
  note?: string;
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  vehicleId: string;
  serviceId: string;
  requestType: ServiceRequestType;
  branchId?: string;
  locationCity?: string;
  locationAddress?: string;
  locationLat?: number;
  locationLng?: number;
  scheduledAt: string;
  status: ServiceRequestStatus;
  assignedStaffId?: string;
  assignedTechnicianId?: string;
  notes?: string;
  estimatedPrice?: number;
  finalPrice?: number;
  createdAt: string;
  updatedAt: string;
  events?: ServiceRequestEvent[];
}
