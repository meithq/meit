'use client';

import { createContext, useContext, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import type { UserWithMerchant } from '@meit/shared/types/auth';
import { getCurrentUser } from '@meit/supabase/queries/auth';
import { login as loginMutation, logout as logoutMutation } from '@meit/supabase/mutations/auth';
import { supabase } from '@meit/supabase/client';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth-store';
import { queryKeys } from '@/lib/react-query';

interface AuthContextType {
  user: UserWithMerchant | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Routes that don't require authentication
 */
const PUBLIC_ROUTES = ['/', '/login', '/register'];

/**
 * Check if a route is protected (requires auth)
 */
function isProtectedRoute(pathname: string): boolean {
  // Public routes don't require auth
  if (PUBLIC_ROUTES.includes(pathname)) {
    return false;
  }
  // Everything under /dashboard requires auth
  if (pathname.startsWith('/dashboard')) {
    return true;
  }
  // Default to public
  return false;
}

/**
 * AuthProvider with React Query caching - like Finaena
 *
 * Key improvements over old implementation:
 * - Uses React Query for session caching (5min stale time)
 * - Client-side route protection (no middleware needed)
 * - Automatic refetch on window focus
 * - Syncs with auth-store
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Use React Query to cache session - Finaena-style
  const {
    data: user,
    isLoading: loading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: queryKeys.settings.all, // Use a stable key for auth session
    queryFn: async () => {
      console.log('[AuthContext] Fetching current user via React Query');
      const currentUser = await getCurrentUser();

      if (currentUser) {
        console.log('[AuthContext] User loaded:', {
          id: currentUser.id,
          email: currentUser.email,
          merchantId: currentUser.merchant_id,
        });

        // Sync with auth-store
        const { setUser: setStoreUser, setMerchantData } = useAuthStore.getState();
        const userForStore = {
          id: currentUser.id,
          merchant_id: currentUser.merchant_id || '',
          auth_user_id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
          last_login: currentUser.last_login,
          created_at: currentUser.created_at,
          updated_at: currentUser.updated_at,
        };
        setStoreUser(userForStore);
        setMerchantData(
          currentUser.merchant_id || '',
          currentUser.role,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          currentUser.merchant as any || null
        );
      } else {
        console.log('[AuthContext] No user found');
        // Clear auth-store if no user
        const { logout: logoutStore } = useAuthStore.getState();
        logoutStore();
      }

      return currentUser;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - Finaena-style caching
    gcTime: 10 * 60 * 1000, // 10 minutes in cache
    refetchOnWindowFocus: true, // Refresh when returning to tab
    refetchOnReconnect: true,
    retry: 1, // Only retry once on failure
  });

  // Client-side route protection - runs AFTER render, doesn't block navigation
  useEffect(() => {
    if (loading) {
      // Still loading, don't redirect yet
      return;
    }

    const needsAuth = isProtectedRoute(pathname);

    if (needsAuth && !user) {
      // Protected route but no user - redirect to login
      console.log('[AuthContext] Protected route without auth, redirecting to login');
      router.push('/login');
    } else if (!needsAuth && user && pathname === '/login') {
      // User is logged in but on login page - redirect to dashboard
      console.log('[AuthContext] User on login page, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [user, loading, pathname, router]);

  // Listen to Supabase auth state changes
  useEffect(() => {
    console.log('[AuthContext] Setting up auth state listener');

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Auth state changed:', { event, hasSession: !!session });

      if (event === 'SIGNED_IN') {
        // Refetch user data
        await refetchUser();
      } else if (event === 'SIGNED_OUT') {
        // Clear auth-store
        const { logout: logoutStore } = useAuthStore.getState();
        logoutStore();
        // Invalidate query cache
        await refetchUser();
      } else if (event === 'INITIAL_SESSION') {
        // Initial session loaded
        if (session) {
          await refetchUser();
        }
      }
      // Skip TOKEN_REFRESHED - happens too frequently
    });

    return () => {
      console.log('[AuthContext] Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, [refetchUser]);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    console.log('[AuthContext] signIn started');

    try {
      const result = await loginMutation({ email, password });

      if (result.error) {
        console.log('[AuthContext] signIn failed:', result.error.message);
        toast.error(result.error.message || 'Error al iniciar sesión');
        return false;
      }

      console.log('[AuthContext] signIn successful');
      toast.success('Sesión iniciada correctamente');

      // Refetch user - the onAuthStateChange listener will handle the rest
      await refetchUser();

      return true;
    } catch (error) {
      console.error('[AuthContext] signIn error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Error al iniciar sesión';
      toast.error(errorMessage);
      return false;
    }
  };

  const signOut = async () => {
    try {
      const result = await logoutMutation();

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Clear auth-store
      const { logout: logoutStore } = useAuthStore.getState();
      logoutStore();

      // Refetch to clear React Query cache
      await refetchUser();

      toast.success('Sesión cerrada correctamente');

      // Navigate to login
      router.push('/login');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al cerrar sesión';
      toast.error(errorMessage);
      throw error;
    }
  };

  const value: AuthContextType = {
    user: user || null,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
