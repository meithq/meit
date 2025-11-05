import { createClient } from './client'

export interface BusinessType {
  id: number
  created_at?: string
  name: string
}

/**
 * Get all business types
 */
export async function getBusinessTypes(): Promise<BusinessType[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('business_types')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    throw error
  }

  return data || []
}

/**
 * Get business type by ID
 */
export async function getBusinessTypeById(id: number): Promise<BusinessType | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('business_types')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    // If not found, return null
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data
}
