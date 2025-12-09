import { createClient } from './client'
import { getCurrentUser } from './auth'

export interface BusinessSettings {
  id?: number
  created_at?: string
  owner?: string
  name?: string
  phone_number?: string
  phone_code?: string
  address?: string
  type?: number
  logo_url?: string
}

/**
 * Get business settings for the current user
 */
export async function getBusinessSettings(): Promise<BusinessSettings | null> {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('business_settings')
    .select('*')
    .eq('owner', user.id)
    .single()

  if (error) {
    // If no settings found, return null (not an error)
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data
}

/**
 * Create business settings for the current user
 */
export async function createBusinessSettings(
  settings: Omit<BusinessSettings, 'id' | 'created_at' | 'owner'>
): Promise<BusinessSettings> {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('business_settings')
    .insert({
      owner: user.id,
      ...settings,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

/**
 * Update business settings for the current user
 */
export async function updateBusinessSettings(
  id: number,
  settings: Partial<Omit<BusinessSettings, 'id' | 'created_at' | 'owner'>>
): Promise<BusinessSettings> {
  const supabase = createClient()
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('business_settings')
    .update(settings)
    .eq('id', id)
    .eq('owner', user.id) // Ensure user owns this record
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

/**
 * Upsert business settings (create if not exists, update if exists)
 */
export async function upsertBusinessSettings(
  settings: Omit<BusinessSettings, 'id' | 'created_at' | 'owner'>
): Promise<BusinessSettings> {
  const existingSettings = await getBusinessSettings()

  if (existingSettings) {
    return updateBusinessSettings(existingSettings.id!, settings)
  } else {
    return createBusinessSettings(settings)
  }
}
