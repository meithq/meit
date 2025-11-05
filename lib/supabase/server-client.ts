import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Crea un cliente de Supabase para uso en server-side (API routes, webhooks)
 * Usa la service_role key para bypasear RLS cuando sea necesario
 */
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!supabaseServiceKey) {
    // Si no hay service role key, usar anon key (menos privilegios)
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not found, using anon key')
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseAnonKey) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }
    return createSupabaseClient(supabaseUrl, supabaseAnonKey)
  }

  // Usar service_role key para bypasear RLS
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
