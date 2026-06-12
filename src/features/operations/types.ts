export interface Technician {
 id: string;
 profileId?: string;
 fullName: string;
 phone?: string;
 specialties: string[];
 isActive: boolean;
 createdAt: string;
 updatedAt: string;
}

export interface AvailabilitySlot {
 slotTime: string;
 remainingCapacity: number;
}

export interface RequestMessage {
 id: string;
 requestId: string;
 senderId: string;
 body: string;
 attachmentUrl?: string;
 createdAt: string;
}

export interface InspectionChecklistItem {
 label: string;
 status: 'ok' | 'attention' | 'fixed';
}

export interface RequestInspection {
 id: string;
 requestId: string;
 checklist: InspectionChecklistItem[];
 diagnosis?: string;
 beforeImageUrl?: string;
 afterImageUrl?: string;
 customerVisible: boolean;
 createdAt: string;
 updatedAt: string;
}

export interface InvoiceItem {
 id: string;
 requestId: string;
 description: string;
 quantity: number;
 unitPrice: number;
 createdAt: string;
}

export interface RequestReview {
 id: string;
 requestId: string;
 customerId: string;
 rating: number;
 comment?: string;
 createdAt: string;
}

export interface ServiceReminder {
 id: string;
 requestId?: string;
 profileId: string;
 kind: 'appointment' | 'technician_arrival' | 'follow_up' | 'offer' | 'custom';
 title: string;
 body: string;
 remindAt: string;
 status: 'pending' | 'sent' | 'cancelled';
 createdAt: string;
 updatedAt: string;
}

export interface RequestOperations {
 messages: RequestMessage[];
 inspection: RequestInspection | null;
 invoiceItems: InvoiceItem[];
 review: RequestReview | null;
 reminders: ServiceReminder[];
}

export interface MaintenancePlan {
 id: string;
 vehicleId: string;
 customerId: string;
 title: string;
 intervalKm?: number;
 intervalMonths?: number;
 lastServiceMileage?: number;
 lastServiceAt?: string;
 nextDueMileage?: number;
 nextDueAt?: string;
 notes?: string;
 isActive: boolean;
 createdAt: string;
 updatedAt: string;
}

export interface MaintenancePlanValues {
 vehicleId: string;
 customerId: string;
 title: string;
 intervalKm?: number;
 intervalMonths?: number;
 lastServiceMileage?: number;
 lastServiceAt?: string;
 nextDueMileage?: number;
 nextDueAt?: string;
 notes?: string;
}

export interface TechnicianFormInput {
 fullName: string;
 phone?: string;
 specialties?: string[];
 isActive?: boolean;
}

export interface MaintenancePlanUpdateValues {
 title: string;
 intervalKm?: number;
 intervalMonths?: number;
 lastServiceMileage?: number;
 lastServiceAt?: string;
 nextDueMileage?: number;
 nextDueAt?: string;
 notes?: string;
}
