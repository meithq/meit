'use client'

import { useAuthStore } from '@/store/auth-store'
import { supabase, signOut as supabaseSignOut } from '@/lib/supabase'
import type { User } from '@/types/database'

/**
 * Authentication hook
 *
 * Provides access to auth state and auth operations
 *
 * Usage:
 * ```typescript
 * const { user, merchantId, role, loading, getCurrentUser, logout } = useAuth()
 * ```
 */
export function useAuth() {
  const { user, merchantId, role, loading, setUser, setMerchantData, setLoading, logout: clearAuth } = useAuthStore()

  /**
   * Get current authenticated user from Supabase and local DB
   */
  const getCurrentUser = async () => {
    setLoading(true)

    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        clearAuth()
        return null
      }

      // Fetch user data from users table with merchant info
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          merchant:merchants(*)
        `)
        .eq('auth_user_id', authUser.id)
        .single()

      if (userError || !userData) {
        console.error('Error fetching user data:', userError)
        clearAuth()
        return null
      }

      // Update store with user data
      setUser(userData as User)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setMerchantData(userData.merchant_id, userData.role, userData.merchant as any || null)

      return userData as User
    } catch (error) {
      console.error('Error in getCurrentUser:', error)
      clearAuth()
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Refresh current session
   */
  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()

      if (error || !session) {
        console.error('Error refreshing session:', error)
        clearAuth()
        return null
      }

      return session
    } catch (error) {
      console.error('Error in refreshSession:', error)
      clearAuth()
      return null
    }
  }

  /**
   * Logout user
   */
  const logout = async () => {
    setLoading(true)

    try {
      await supabaseSignOut()
      clearAuth()
    } catch (error) {
      console.error('Error logging out:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  /**
   * Check if user has specific role
   */
  const hasRole = (requiredRole: 'admin' | 'operator') => {
    return role === requiredRole
  }

  /**
   * Check if user is admin
   */
  const isAdmin = () => {
    return role === 'admin'
  }

  return {
    user,
    merchantId,
    role,
    loading,
    getCurrentUser,
    refreshSession,
    logout,
    hasRole,
    isAdmin,
  }
}
