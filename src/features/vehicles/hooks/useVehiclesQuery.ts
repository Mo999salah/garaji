import { useQuery } from '@tanstack/react-query';

import { fetchCustomerVehicles } from '@/features/vehicles/services/supabaseVehicleService';
import { isSupabaseConfigured } from '@/shared/lib/supabase';

export function useCustomerVehiclesQuery(ownerId?: string) {
 return useQuery({
 queryKey: ['vehicles', 'customer', ownerId],
 enabled: Boolean(ownerId) && isSupabaseConfigured,
 queryFn: () => fetchCustomerVehicles(ownerId as string),
 });
}
