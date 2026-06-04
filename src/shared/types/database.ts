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
