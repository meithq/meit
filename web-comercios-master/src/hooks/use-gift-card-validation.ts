'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'
import type { GiftCardWithCustomer } from './use-gift-cards'

export interface ValidationResult {
  valid: boolean
  giftCard?: GiftCardWithCustomer | null
  error?: string
}

/**
 * Gift Card Validation hook
 *
 * Provides validation functionality for gift card codes
 *
 * Usage:
 * ```typescript
 * const { validatedGiftCard, validating, validateCode, clearValidation } = useGiftCardValidation()
 * ```
 */
export function useGiftCardValidation() {
  const [validatedGiftCard, setValidatedGiftCard] = useState<GiftCardWithCustomer | null>(null)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const merchantId = useAuthStore((state) => state.merchantId)

  /**
   * Validate a gift card code
   */
  const validateCode = useCallback(async (code: string): Promise<ValidationResult> => {
    if (!merchantId) {
      const errorMsg = 'No merchant ID found'
      setError(errorMsg)
      return { valid: false, error: errorMsg }
    }

    if (!code || code.trim() === '') {
      const errorMsg = 'El código es requerido'
      setError(errorMsg)
      return { valid: false, error: errorMsg }
    }

    setValidating(true)
    setError(null)

    try {
      const normalizedCode = code.toUpperCase().trim()

      const { data: giftCard, error: fetchError } = await supabase
        .from('gift_cards')
        .select(`
          *,
          customer:customers(id, name, phone)
        `)
        .eq('code', normalizedCode)
        .eq('merchant_id', merchantId)
        .maybeSingle()

      if (fetchError) {
        console.error('Error validating gift card:', fetchError)
        const errorMsg = 'Error al validar el código'
        setError(errorMsg)
        return { valid: false, error: errorMsg }
      }

      if (!giftCard) {
        const errorMsg = 'Código de gift card no válido'
        setError(errorMsg)
        return { valid: false, error: errorMsg }
      }

      // Check if gift card is already redeemed
      if (giftCard.status === 'redeemed') {
        const errorMsg = 'Esta gift card ya fue redimida'
        setError(errorMsg)
        return { valid: false, giftCard, error: errorMsg }
      }

      // Check if gift card is expired
      if (giftCard.status === 'expired') {
        const errorMsg = 'Esta gift card ha vencido'
        setError(errorMsg)
        return { valid: false, giftCard, error: errorMsg }
      }

      // Check expiration date if available
      if (giftCard.expires_at) {
        const expiryDate = new Date(giftCard.expires_at)
        const now = new Date()
        if (expiryDate < now) {
          const errorMsg = 'Esta gift card ha vencido'
          setError(errorMsg)

          // Update status to expired
          await supabase
            .from('gift_cards')
            .update({ status: 'expired' })
            .eq('id', giftCard.id)
            .eq('merchant_id', merchantId)

          return { valid: false, giftCard, error: errorMsg }
        }
      }

      // Gift card is valid
      setValidatedGiftCard(giftCard)
      setError(null)
      return { valid: true, giftCard }
    } catch (err) {
      console.error('Error in validateCode:', err)
      const errorMsg = err instanceof Error ? err.message : 'Error al validar gift card'
      setError(errorMsg)
      return { valid: false, error: errorMsg }
    } finally {
      setValidating(false)
    }
  }, [merchantId])

  /**
   * Clear validated gift card
   */
  const clearValidation = useCallback(() => {
    setValidatedGiftCard(null)
    setError(null)
  }, [])

  /**
   * Get days until expiration
   */
  const getDaysUntilExpiry = useCallback((expiresAt: string | null): number | null => {
    if (!expiresAt) return null
    const expiryDate = new Date(expiresAt)
    const now = new Date()
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry
  }, [])

  /**
   * Check if gift card is expiring soon (< 7 days)
   */
  const isExpiringSoon = useCallback((expiresAt: string | null): boolean => {
    const days = getDaysUntilExpiry(expiresAt)
    return days !== null && days <= 7 && days > 0
  }, [getDaysUntilExpiry])

  return {
    validatedGiftCard,
    validating,
    error,
    validateCode,
    clearValidation,
    getDaysUntilExpiry,
    isExpiringSoon,
  }
}
