import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isConfigured: false,
  signInWithMagicLink: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    let unsubscribe: (() => void) | undefined;

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const initializeAuth = async () => {
      try {
        const supabase = await getSupabaseClient();
        if (!isActive) return;

        // Listen before reading the session so auth transitions are never missed.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
          if (!isActive) return;
          setSession(nextSession);
          setUser(nextSession?.user ?? null);
          setLoading(false);
        });
        unsubscribe = () => subscription.unsubscribe();

        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!isActive) return;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setLoading(false);
      } catch (err) {
        if (!isActive) return;
        console.warn('[DriveHours Auth] Error fetching initial session (offline mode active):', err);
        setLoading(false);
      }
    };

    void initializeAuth();

    return () => {
      isActive = false;
      unsubscribe?.();
    };
  }, []);

  const signInWithMagicLink = async (email: string) => {
    if (!isSupabaseConfigured) {
      console.warn('[DriveHours Auth] Supabase environment keys are missing. Simulating magic link dispatch for local testing.');
      return { error: null };
    }

    try {
      const supabase = await getSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/settings` : undefined,
        },
      });
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return { error: new Error(err instanceof Error ? err.message : 'Failed to send magic link') };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      try {
        const supabase = await getSupabaseClient();
        await supabase.auth.signOut();
      } catch (err) {
        console.error('[DriveHours Auth] Error signing out:', err);
      }
    }
    setSession(null);
    setUser(null);
    // Clear local cached entitlement on sign out
    localStorage.removeItem('drivelog_pro_entitlement');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: isSupabaseConfigured,
        signInWithMagicLink,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
