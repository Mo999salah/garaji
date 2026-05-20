import { useQuery } from '@tanstack/react-query';

import { fetchCatalogProducts, fetchCategories } from '@/features/products/services/supabaseProductService';
import { isSupabaseConfigured } from '@/shared/lib/supabase';

export function useCatalogQuery(enabled = true) {
  return useQuery({
    queryKey: ['catalog'],
    enabled: enabled && isSupabaseConfigured,
    queryFn: async () => {
      const [categories, products] = await Promise.all([fetchCategories(), fetchCatalogProducts()]);
      return { categories, products };
    },
  });
}
