/**
 * Tipos para Gift Cards
 */

export type GiftCardStatus = 'active' | 'redeemed' | 'expired' | 'cancelled'

export interface GiftCard {
  id: string
  created_at: string
  updated_at: string
  customer_id: string
  business_settings_id: number
  code: string
  value: number
  points_used: number
  status: GiftCardStatus
  expires_at: string
  redeemed_at: string | null
  notification_sent: boolean
}

export interface CreateGiftCardInput {
  customer_id: string
  business_settings_id: number
  value: number
  points_used: number
  expiration_days: number
}

export interface GiftCardWithCustomer extends GiftCard {
  customer_name?: string
  customer_phone?: string
  customer_email?: string
}

export interface GiftCardRedemption {
  id: string
  created_at: string
  gift_card_id: string
  customer_id: string
  business_settings_id: number
  operator_id: string
  admin_id: string
  gift_card_value: number
  notes?: string
}

export interface CreateGiftCardRedemptionInput {
  gift_card_id: string
  customer_id: string
  business_settings_id: number
  operator_id: string
  admin_id: string
  gift_card_value: number
  notes?: string
}
