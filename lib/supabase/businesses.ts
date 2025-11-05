import { createClient } from './client'
import { getCurrentUser } from './auth'
import { getBusinessSettings } from './business-settings'

export interface Business {
  id?: number
  created_at?: string
  modified_at?: string
  owner?: string
  name?: string
  address?: string
  qr_code?: string
  business_settings_id?: number
}

/**
 * Get all businesses for the current user
 */
export async function getBusinesses(): Promise<Business[]> {
  try {
    const supabase = createClient()
    const user = await getCurrentUser()

    console.log('🔍 getBusinesses - user:', user?.id)

    if (!user) {
      console.error('❌ User not authenticated')
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching businesses:', error)
      throw error
    }

    console.log('✅ Businesses loaded:', data?.length)
    return data || []
  } catch (error) {
    console.error('❌ Error in getBusinesses:', error)
    throw error
  }
}

/**
 * Get a single business by ID
 */
export async function getBusiness(id: number): Promise<Business | null> {
  try {
    const supabase = createClient()
    const user = await getCurrentUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .eq('owner', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return data
  } catch (error) {
    console.error('❌ Error in getBusiness:', error)
    throw error
  }
}

/**
 * Create a new business
 */
export async function createBusiness(
  business: Omit<Business, 'id' | 'created_at' | 'modified_at' | 'owner' | 'business_settings_id'>
): Promise<Business> {
  try {
    const supabase = createClient()
    const user = await getCurrentUser()

    console.log('➕ createBusiness - user:', user?.id)
    console.log('➕ createBusiness - business:', business)

    if (!user) {
      console.error('❌ User not authenticated')
      throw new Error('User not authenticated')
    }

    // Obtener el business_settings del usuario
    const businessSettings = await getBusinessSettings()

    if (!businessSettings) {
      console.error('❌ No business settings found for user')
      throw new Error('Debes configurar tu negocio primero en Settings')
    }

    const insertData = {
      owner: user.id,
      business_settings_id: businessSettings.id,
      ...business,
      modified_at: new Date().toISOString(),
    }
    console.log('➕ Inserting data:', insertData)

    const { data, error } = await supabase
      .from('businesses')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('❌ Insert error:', error)
      throw error
    }

    console.log('✅ Business created:', data)
    return data
  } catch (error) {
    console.error('❌ Error in createBusiness:', error)
    throw error
  }
}

/**
 * Update a business
 */
export async function updateBusiness(
  id: number,
  business: Partial<Omit<Business, 'id' | 'created_at' | 'modified_at' | 'owner'>>
): Promise<Business> {
  try {
    const supabase = createClient()
    const user = await getCurrentUser()

    console.log('✏️ updateBusiness - user:', user?.id)
    console.log('✏️ updateBusiness - id:', id)
    console.log('✏️ updateBusiness - business:', business)

    if (!user) {
      console.error('❌ User not authenticated')
      throw new Error('User not authenticated')
    }

    const updateData = {
      ...business,
      modified_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('businesses')
      .update(updateData)
      .eq('id', id)
      .eq('owner', user.id)
      .select()
      .single()

    if (error) {
      console.error('❌ Update error:', error)
      throw error
    }

    console.log('✅ Business updated:', data)
    return data
  } catch (error) {
    console.error('❌ Error in updateBusiness:', error)
    throw error
  }
}

/**
 * Delete a business
 */
export async function deleteBusiness(id: number): Promise<void> {
  try {
    const supabase = createClient()
    const user = await getCurrentUser()

    console.log('🗑️ deleteBusiness - user:', user?.id)
    console.log('🗑️ deleteBusiness - id:', id)

    if (!user) {
      console.error('❌ User not authenticated')
      throw new Error('User not authenticated')
    }

    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id)
      .eq('owner', user.id)

    if (error) {
      console.error('❌ Delete error:', error)
      throw error
    }

    console.log('✅ Business deleted')
  } catch (error) {
    console.error('❌ Error in deleteBusiness:', error)
    throw error
  }
}
