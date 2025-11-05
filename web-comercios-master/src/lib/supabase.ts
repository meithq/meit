import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase client for client-side components
 * This client automatically handles session management and cookies
 *
 * Usage:
 * ```typescript
 * import { supabase } from '@/lib/supabase'
 *
 * const { data, error } = await supabase
 *   .from('customers')
 *   .select('*')
 *   .eq('merchant_id', merchantId)
 * ```
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Get the current authenticated session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Error fetching session:', error)
    return null
  }

  return session
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  return user
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error signing out:', error)
    throw new Error('Failed to sign out')
  }
}
