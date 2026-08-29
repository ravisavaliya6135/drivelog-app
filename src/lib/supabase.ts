import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder')
);

let clientPromise: Promise<SupabaseClient> | undefined;

/**
 * Load Supabase only when an authenticated action is needed. Keeping this SDK
 * out of the startup bundle protects the first paint for offline-first routes.
 */
export function getSupabaseClient(): Promise<SupabaseClient> {
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) => {
      if (isSupabaseConfigured) {
        return createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: window.localStorage,
          },
        });
      }

      // Preserve the graceful, non-networking fallback used in local builds.
      return createClient('https://drivelog-placeholder.supabase.co', 'placeholder-anon-key', {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    });
  }

  return clientPromise;
}
