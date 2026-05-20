import { useEffect } from 'react';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { isSupabaseConfigured, supabase } from '@/shared/lib/supabase';

export function useAuthSessionListener() {
  const hydrateSession = useAuthStore((state) => state.hydrateSession);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, _session) => {
      void hydrateSession();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [hydrateSession]);
}
