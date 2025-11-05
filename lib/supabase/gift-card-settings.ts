import { createClient } from './client'
import { getBusinessSettings } from './business-settings'

export interface GiftCardSettings {
  id?: number
  created_at?: string
  updated_at?: string
  business_settings_id?: number
  points_required?: number
  card_value?: number
  expiration_days?: number
  max_active_cards?: number
}

/**
 * Get gift card settings for the current business
 */
export async function getGiftCardSettings(): Promise<GiftCardSettings | null> {
  try {
    const supabase = createClient()

    // Obtener el negocio actual del usuario
    const businessSettings = await getBusinessSettings()

    if (!businessSettings?.id) {
      console.log('⚠️ No business settings found')
      return null
    }

    console.log('🔍 getGiftCardSettings - business_settings_id:', businessSettings.id)

    const { data, error } = await supabase
      .from('gift_card_settings')
      .select('*')
      .eq('business_settings_id', businessSettings.id)
      .single()

    if (error) {
      console.log('⚠️ Supabase error:', error.code, error.message)
      // If no settings found, return null (not an error)
      if (error.code === 'PGRST116') {
        console.log('ℹ️ No settings found, returning null')
        return null
      }
      throw error
    }

    console.log('✅ Settings found:', data)
    return data
  } catch (error) {
    console.error('❌ Error in getGiftCardSettings:', error)
    throw error
  }
}

/**
 * Create gift card settings for the current business
 */
export async function createGiftCardSettings(
  settings: Omit<GiftCardSettings, 'id' | 'created_at' | 'updated_at' | 'business_settings_id'>
): Promise<GiftCardSettings> {
  try {
    const supabase = createClient()

    // Obtener el negocio actual del usuario
    const businessSettings = await getBusinessSettings()

    if (!businessSettings?.id) {
      console.error('❌ No business settings found')
      throw new Error('Business settings not found')
    }

    console.log('➕ createGiftCardSettings - business_settings_id:', businessSettings.id)
    console.log('➕ createGiftCardSettings - settings:', settings)

    const insertData = {
      business_settings_id: businessSettings.id,
      ...settings,
    }
    console.log('➕ Inserting data:', insertData)

    const { data, error } = await supabase
      .from('gift_card_settings')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('❌ Insert error:', error)
      throw error
    }

    console.log('✅ Settings created:', data)
    return data
  } catch (error) {
    console.error('❌ Error in createGiftCardSettings:', error)
    throw error
  }
}

/**
 * Update gift card settings for the current business
 */
export async function updateGiftCardSettings(
  id: number,
  settings: Partial<Omit<GiftCardSettings, 'id' | 'created_at' | 'updated_at' | 'business_settings_id'>>
): Promise<GiftCardSettings> {
  try {
    const supabase = createClient()

    // Obtener el negocio actual del usuario
    const businessSettings = await getBusinessSettings()

    if (!businessSettings?.id) {
      console.error('❌ No business settings found')
      throw new Error('Business settings not found')
    }

    console.log('✏️ updateGiftCardSettings - business_settings_id:', businessSettings.id)
    console.log('✏️ updateGiftCardSettings - id:', id)
    console.log('✏️ updateGiftCardSettings - settings:', settings)

    const { data, error } = await supabase
      .from('gift_card_settings')
      .update(settings)
      .eq('id', id)
      .eq('business_settings_id', businessSettings.id) // Ensure user owns this business
      .select()
      .single()

    if (error) {
      console.error('❌ Update error:', error)
      throw error
    }

    console.log('✅ Settings updated:', data)
    return data
  } catch (error) {
    console.error('❌ Error in updateGiftCardSettings:', error)
    throw error
  }
}

/**
 * Upsert gift card settings (create if not exists, update if exists)
 */
export async function upsertGiftCardSettings(
  settings: Omit<GiftCardSettings, 'id' | 'created_at' | 'updated_at' | 'business_settings_id'>
): Promise<GiftCardSettings> {
  try {
    console.log('🔍 upsertGiftCardSettings called with:', settings)

    console.log('📋 Getting existing settings...')
    const existingSettings = await getGiftCardSettings()
    console.log('📋 Existing settings:', existingSettings)

    if (existingSettings) {
      console.log('✏️ Updating existing settings...')
      return await updateGiftCardSettings(existingSettings.id!, settings)
    } else {
      console.log('➕ Creating new settings...')
      return await createGiftCardSettings(settings)
    }
  } catch (error) {
    console.error('❌ Error in upsertGiftCardSettings:', error)
    console.error('Error details:', {
      type: typeof error,
      constructor: error?.constructor?.name,
      message: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw error
  }
}
