import { createClient } from './client'
import type {
  GiftCard,
  CreateGiftCardInput,
  GiftCardWithCustomer,
  GiftCardRedemption,
  CreateGiftCardRedemptionInput
} from '@/lib/types/gift-cards'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Genera un código único para la gift card en formato GC-XXXX-XXXX-XXXX
 */
async function generateUniqueCode(supabaseClient?: SupabaseClient): Promise<string> {
  const supabase = supabaseClient || createClient()

  // Caracteres permitidos (sin I, O, 0, 1 para evitar confusión)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

  // Generar código aleatorio
  let code = 'GC-'
  for (let i = 0; i < 12; i++) {
    if (i === 4 || i === 8) {
      code += '-'
    }
    const randomIndex = Math.floor(Math.random() * chars.length)
    code += chars[randomIndex]
  }

  // Verificar que el código no exista
  const { data: existing } = await supabase
    .from('gift_cards')
    .select('id')
    .eq('code', code)
    .maybeSingle()

  if (existing) {
    // Si ya existe, generar uno nuevo
    return generateUniqueCode(supabaseClient)
  }

  return code
}

/**
 * Crea una nueva gift card
 */
export async function createGiftCard(
  input: CreateGiftCardInput,
  supabaseClient?: SupabaseClient
): Promise<GiftCard> {
  const supabase = supabaseClient || createClient()

  console.log('Creating gift card with input:', input)

  // Generar código único
  const code = await generateUniqueCode(supabase)

  // Calcular fecha de expiración
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + input.expiration_days)

  const giftCardData = {
    customer_id: input.customer_id,
    business_settings_id: input.business_settings_id,
    code: code,
    value: input.value,
    points_used: input.points_used,
    status: 'active' as const,
    expires_at: expiresAt.toISOString(),
    notification_sent: false,
  }

  const { data, error } = await supabase
    .from('gift_cards')
    .insert(giftCardData)
    .select()
    .single()

  if (error) {
    console.error('Error creating gift card:', error)
    throw error
  }

  console.log('Gift card created successfully:', data)
  return data
}

/**
 * Obtiene las gift cards de un cliente específico
 */
export async function getGiftCardsByCustomer(
  customerId: string,
  businessSettingsId?: number,
  supabaseClient?: SupabaseClient
): Promise<GiftCard[]> {
  const supabase = supabaseClient || createClient()

  let query = supabase
    .from('gift_cards')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  if (businessSettingsId) {
    query = query.eq('business_settings_id', businessSettingsId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching gift cards:', error)
    throw error
  }

  return data || []
}

/**
 * Obtiene todas las gift cards de un negocio
 */
export async function getGiftCardsByBusiness(
  businessSettingsId: number,
  supabaseClient?: SupabaseClient
): Promise<GiftCardWithCustomer[]> {
  const supabase = supabaseClient || createClient()

  const { data, error } = await supabase
    .from('gift_cards')
    .select(`
      *,
      customers:customer_id (
        name,
        phone,
        email
      )
    `)
    .eq('business_settings_id', businessSettingsId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching gift cards by business:', error)
    throw error
  }

  // Transformar la respuesta
  return (data || []).map((item: any) => ({
    ...item,
    customer_name: item.customers?.name,
    customer_phone: item.customers?.phone,
    customer_email: item.customers?.email,
  }))
}

/**
 * Obtiene las gift cards activas de un cliente
 */
export async function getActiveGiftCards(
  customerId: string,
  businessSettingsId: number,
  supabaseClient?: SupabaseClient
): Promise<GiftCard[]> {
  const supabase = supabaseClient || createClient()

  const { data, error } = await supabase
    .from('gift_cards')
    .select('*')
    .eq('customer_id', customerId)
    .eq('business_settings_id', businessSettingsId)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching active gift cards:', error)
    throw error
  }

  return data || []
}

/**
 * Cuenta las gift cards activas de un cliente
 */
export async function countActiveGiftCards(
  customerId: string,
  businessSettingsId: number,
  supabaseClient?: SupabaseClient
): Promise<number> {
  const supabase = supabaseClient || createClient()

  const { count, error } = await supabase
    .from('gift_cards')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', customerId)
    .eq('business_settings_id', businessSettingsId)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())

  if (error) {
    console.error('Error counting active gift cards:', error)
    throw error
  }

  return count || 0
}

/**
 * Marca una gift card como canjeada
 */
export async function redeemGiftCard(
  giftCardId: string,
  supabaseClient?: SupabaseClient
): Promise<GiftCard> {
  const supabase = supabaseClient || createClient()

  const { data, error } = await supabase
    .from('gift_cards')
    .update({
      status: 'redeemed',
      redeemed_at: new Date().toISOString(),
    })
    .eq('id', giftCardId)
    .select()
    .single()

  if (error) {
    console.error('Error redeeming gift card:', error)
    throw error
  }

  return data
}

/**
 * Marca una gift card como expirada
 */
export async function expireGiftCard(
  giftCardId: string,
  supabaseClient?: SupabaseClient
): Promise<GiftCard> {
  const supabase = supabaseClient || createClient()

  const { data, error } = await supabase
    .from('gift_cards')
    .update({
      status: 'expired',
    })
    .eq('id', giftCardId)
    .select()
    .single()

  if (error) {
    console.error('Error expiring gift card:', error)
    throw error
  }

  return data
}

/**
 * Cancela una gift card
 */
export async function cancelGiftCard(
  giftCardId: string,
  supabaseClient?: SupabaseClient
): Promise<GiftCard> {
  const supabase = supabaseClient || createClient()

  const { data, error } = await supabase
    .from('gift_cards')
    .update({
      status: 'cancelled',
    })
    .eq('id', giftCardId)
    .select()
    .single()

  if (error) {
    console.error('Error cancelling gift card:', error)
    throw error
  }

  return data
}

/**
 * Marca la notificación como enviada
 */
export async function markNotificationSent(
  giftCardId: string,
  supabaseClient?: SupabaseClient
): Promise<void> {
  const supabase = supabaseClient || createClient()

  const { error } = await supabase
    .from('gift_cards')
    .update({
      notification_sent: true,
    })
    .eq('id', giftCardId)

  if (error) {
    console.error('Error marking notification as sent:', error)
    throw error
  }
}

/**
 * Obtiene una gift card por su código
 */
export async function getGiftCardByCode(
  code: string,
  supabaseClient?: SupabaseClient
): Promise<GiftCard | null> {
  const supabase = supabaseClient || createClient()

  const { data, error } = await supabase
    .from('gift_cards')
    .select('*')
    .eq('code', code)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching gift card by code:', error)
    throw error
  }

  return data
}

/**
 * Registra una redención de gift card
 */
export async function createGiftCardRedemption(
  input: CreateGiftCardRedemptionInput,
  supabaseClient?: SupabaseClient
): Promise<GiftCardRedemption> {
  const supabase = supabaseClient || createClient()

  const { data, error } = await supabase
    .from('gift_card_redemptions')
    .insert({
      gift_card_id: input.gift_card_id,
      customer_id: input.customer_id,
      business_settings_id: input.business_settings_id,
      operator_id: input.operator_id,
      admin_id: input.admin_id,
      gift_card_value: input.gift_card_value,
      notes: input.notes || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating gift card redemption:', error)
    throw error
  }

  return data
}

/**
 * Redime una gift card completa (actualiza estado y crea registro de redención)
 */
export async function redeemGiftCardComplete(
  giftCardId: string,
  operatorId: string,
  adminId: string,
  notes?: string,
  supabaseClient?: SupabaseClient
): Promise<{ giftCard: GiftCard; redemption: GiftCardRedemption }> {
  const supabase = supabaseClient || createClient()

  // 1. Obtener la gift card actual
  const { data: giftCard, error: fetchError } = await supabase
    .from('gift_cards')
    .select('*')
    .eq('id', giftCardId)
    .single()

  if (fetchError || !giftCard) {
    throw new Error('Gift card no encontrada')
  }

  // Verificar que la gift card esté activa
  if (giftCard.status !== 'active') {
    throw new Error('La gift card no está activa')
  }

  // Verificar que no haya expirado
  if (new Date(giftCard.expires_at) < new Date()) {
    throw new Error('La gift card ha expirado')
  }

  // 2. Actualizar el estado de la gift card a 'redeemed'
  const redeemedGiftCard = await redeemGiftCard(giftCardId, supabase)

  // 3. Crear el registro de redención
  const redemption = await createGiftCardRedemption(
    {
      gift_card_id: giftCardId,
      customer_id: giftCard.customer_id,
      business_settings_id: giftCard.business_settings_id,
      operator_id: operatorId,
      admin_id: adminId,
      gift_card_value: giftCard.value,
      notes: notes,
    },
    supabase
  )

  return {
    giftCard: redeemedGiftCard,
    redemption: redemption,
  }
}
