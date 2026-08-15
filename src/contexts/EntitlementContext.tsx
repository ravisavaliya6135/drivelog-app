import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useDriveLog } from '../hooks/useDriveLog';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const FREE_HOURS_LIMIT = 20;
export const PRO_LIFETIME_PRICE = '$4.99';

export interface EntitlementContextType {
  isPro: boolean;
  isLifetime: boolean;
  totalHoursLogged: number;
  freeHoursLimit: number;
  freeHoursRemaining: number;
  isLimitReached: boolean;
  isApproachingLimit: boolean;
  loading: boolean;
  refreshEntitlement: () => Promise<boolean>;
  startCheckout: () => Promise<{ url?: string; error?: Error }>;
}

const EntitlementContext = createContext<EntitlementContextType>({
  isPro: false,
  isLifetime: false,
  totalHoursLogged: 0,
  freeHoursLimit: FREE_HOURS_LIMIT,
  freeHoursRemaining: FREE_HOURS_LIMIT,
  isLimitReached: false,
  isApproachingLimit: false,
  loading: false,
  refreshEntitlement: async () => false,
  startCheckout: async () => ({ error: new Error('Not initialized') }),
});

const CACHE_KEY = 'drivelog_pro_entitlement';

export function EntitlementProvider({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth();
  const { totalHours } = useDriveLog();
  const [isPro, setIsPro] = useState<boolean>(() => {
    // Read from local cache on initial load for instant offline speed
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.status === 'active' && parsed.plan === 'lifetime') {
            return true;
          }
        }
      } catch (err) {
        console.warn('Error reading cached entitlement:', err);
      }
    }
    return false;
  });

  const [loading, setLoading] = useState(false);

  // Fetch server-verified entitlement from Supabase database
  const refreshEntitlement = useCallback(async (): Promise<boolean> => {
    if (!user || !isSupabaseConfigured) {
      return isPro;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('entitlements')
        .select('plan, status, purchased_at')
        .eq('user_id', user.id)
        .eq('plan', 'lifetime')
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.warn('[DriveLog Entitlement] Error fetching entitlement from server:', error);
        setLoading(false);
        return isPro;
      }

      const hasActiveLifetime = Boolean(data && data.status === 'active');
      setIsPro(hasActiveLifetime);

      if (hasActiveLifetime) {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            userId: user.id,
            plan: 'lifetime',
            status: 'active',
            cachedAt: new Date().toISOString(),
          })
        );
      } else {
        localStorage.removeItem(CACHE_KEY);
      }

      setLoading(false);
      return hasActiveLifetime;
    } catch (err) {
      console.warn('[DriveLog Entitlement] Offline or network error during entitlement check:', err);
      setLoading(false);
      return isPro;
    }
  }, [user, isPro]);

  // Revalidate entitlement when user signs in or auth state changes
  useEffect(() => {
    if (user) {
      refreshEntitlement();
    } else {
      // If logged out, verify if cached user matches; if no user, keep local Pro if purchased on this device or reset
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) {
          setIsPro(false);
        }
      } catch {
        setIsPro(false);
      }
    }
  }, [user, refreshEntitlement]);

  // Start Stripe Checkout through Supabase Edge Function
  const startCheckout = useCallback(async () => {
    if (!user || !session) {
      return { error: new Error('AUTH_REQUIRED') };
    }

    if (!isSupabaseConfigured) {
      return {
        error: new Error('Supabase backend is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'),
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error || !data?.url) {
        return { error: new Error(error?.message || 'Failed to create checkout session') };
      }

      return { url: data.url };
    } catch (err: any) {
      return { error: new Error(err.message || 'Error connecting to payment service') };
    }
  }, [user, session]);

  const totalHoursLogged = Number(totalHours.toFixed(1));
  const freeHoursRemaining = Math.max(0, Number((FREE_HOURS_LIMIT - totalHoursLogged).toFixed(1)));
  const isLimitReached = !isPro && totalHoursLogged >= FREE_HOURS_LIMIT;
  const isApproachingLimit = !isPro && totalHoursLogged >= 15 && totalHoursLogged < FREE_HOURS_LIMIT;

  return (
    <EntitlementContext.Provider
      value={{
        isPro,
        isLifetime: isPro,
        totalHoursLogged,
        freeHoursLimit: FREE_HOURS_LIMIT,
        freeHoursRemaining,
        isLimitReached,
        isApproachingLimit,
        loading,
        refreshEntitlement,
        startCheckout,
      }}
    >
      {children}
    </EntitlementContext.Provider>
  );
}

export function useEntitlement() {
  const context = useContext(EntitlementContext);
  if (!context) {
    throw new Error('useEntitlement must be used within an EntitlementProvider');
  }
  return context;
}
