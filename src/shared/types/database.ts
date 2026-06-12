// Car services platform — Supabase row types.
// Kept: profiles, merchants (staff).
// Removed: products, categories, orders, order_items.
// Added: vehicles, branches, services, service_requests, service_request_events.

export interface DbProfileRow {
 id: string;
 full_name: string | null;
 phone: string | null;
 role: 'customer' | 'merchant';
 push_token?: string | null;
 created_at: string;
}

export interface DbMerchantRow {
 id: string;
 owner_id: string;
 name: string;
 region: string | null;
}

// ── Car services ────────────────────────────────────────────────────────────

export interface DbVehicleRow {
 id: string;
 owner_id: string;
 make: string;
 model: string;
 year: number;
 plate_number: string;
 color: string | null;
 mileage: number | null;
 document_url: string | null;
 created_at: string;
 updated_at: string;
}

export interface DbBranchRow {
 id: string;
 name: string;
 city: string;
 address: string;
 lat: number | null;
 lng: number | null;
 phone: string | null;
 working_hours: string | null;
 is_active: boolean;
 created_at: string;
 updated_at: string;
}

export type DbServiceType = 'branch' | 'mobile' | 'both';

export interface DbServiceRow {
 id: string;
 name: string;
 description: string;
 service_type: DbServiceType;
 estimated_price: number | null;
 duration_minutes: number | null;
 is_active: boolean;
 sort_order: number;
 created_at: string;
 updated_at: string;
}

export type DbServiceRequestStatus =
 | 'pending'
 | 'confirmed'
 | 'in_progress'
 | 'completed'
 | 'cancelled';

export type DbServiceRequestType = 'branch_appointment' | 'mobile_service';

export interface DbServiceRequestRow {
 id: string;
 customer_id: string;
 vehicle_id: string;
 service_id: string;
 request_type: DbServiceRequestType;
 branch_id: string | null;
 location_city: string | null;
 location_address: string | null;
 location_lat: number | null;
 location_lng: number | null;
 scheduled_at: string;
 status: DbServiceRequestStatus;
 assigned_staff_id: string | null;
 assigned_technician_id?: string | null;
 notes: string | null;
 estimated_price: number | null;
 final_price: number | null;
 created_at: string;
 updated_at: string;
}

export interface DbServiceRequestEventRow {
 id: string;
 request_id: string;
 status: DbServiceRequestStatus;
 note: string | null;
 created_at: string;
}

export interface DbTechnicianRow {
 id: string;
 profile_id: string | null;
 full_name: string;
 phone: string | null;
 specialties: string[];
 is_active: boolean;
 created_at: string;
 updated_at: string;
}

export interface DbRequestMessageRow {
 id: string;
 request_id: string;
 sender_id: string;
 body: string;
 attachment_url: string | null;
 created_at: string;
}

export interface DbRequestInspectionRow {
 id: string;
 request_id: string;
 checklist: unknown;
 diagnosis: string | null;
 before_image_url: string | null;
 after_image_url: string | null;
 customer_visible: boolean;
 created_at: string;
 updated_at: string;
}

export interface DbRequestInvoiceItemRow {
 id: string;
 request_id: string;
 description: string;
 quantity: number;
 unit_price: number;
 created_at: string;
}

export interface DbRequestReviewRow {
 id: string;
 request_id: string;
 customer_id: string;
 rating: number;
 comment: string | null;
 created_at: string;
}

export interface DbMaintenancePlanRow {
 id: string;
 vehicle_id: string;
 customer_id: string;
 title: string;
 interval_km: number | null;
 interval_months: number | null;
 last_service_mileage: number | null;
 last_service_at: string | null;
 next_due_mileage: number | null;
 next_due_at: string | null;
 notes: string | null;
 is_active: boolean;
 created_at: string;
 updated_at: string;
}

export interface DbServiceReminderRow {
 id: string;
 request_id: string | null;
 profile_id: string;
 kind: 'appointment' | 'technician_arrival' | 'follow_up' | 'offer' | 'custom';
 title: string;
 body: string;
 remind_at: string;
 status: 'pending' | 'sent' | 'cancelled';
 created_at: string;
 updated_at: string;
}
