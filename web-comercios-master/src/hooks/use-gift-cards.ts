'use client'

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'
import type { GiftCard, Customer } from '@/types/database'

export type GiftCardStatus = 'active' | 'redeemed' | 'expired'

export interface GiftCardWithCustomer extends GiftCard {
  customer?: Pick<Customer, 'id' | 'name' | 'phone'> | null
}

export interface GiftCardStats {
  activeCount: number
  redeemedThisMonth: number
  totalValue: number
  redemptionRate: number
}

export interface GiftCardFilters {
  search?: string
  dateFrom?: string
  dateTo?: string
}

/**
 * Gift Cards hook
 *
 * Provides operations for gift card management including validation, redemption, and filtering
 *
 * Usage:
 * ```typescript
 * const { giftCards, loading, stats, fetchGiftCards, redeemGiftCard } = useGiftCards('active')
 * ```
 */
export function useGiftCards(status: GiftCardStatus = 'active') {
  const [giftCards, setGiftCards] = useState<GiftCardWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<GiftCardStats>({
    activeCount: 0,
    redeemedThisMonth: 0,
    totalValue: 0,
    redemptionRate: 0,
  })
  const merchantId = useAuthStore((state) => state.merchantId)

  /**
   * Map our status type to database status
   */
  const mapStatusToDb = (status: GiftCardStatus): 'available' | 'redeemed' | 'expired' => {
    if (status === 'active') return 'available'
    return status
  }

  /**
   * Fetch gift cards by status with optional filters
   */
  const fetchGiftCards = useCallback(async (filters?: GiftCardFilters) => {
    if (!merchantId) {
      setError('No merchant ID found')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('gift_cards')
        .select(`
          *,
          customer:customers(id, name, phone)
        `)
        .eq('merchant_id', merchantId)
        .eq('status', mapStatusToDb(status))

      // Apply search filter (code or customer name/phone)
      if (filters?.search && filters.search.trim() !== '') {
        const searchTerm = filters.search.trim().toUpperCase()
        query = query.or(`code.ilike.%${searchTerm}%`)
      }

      // Apply date range filter
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error('Error fetching gift cards:', fetchError)
        setError(fetchError.message)
        return
      }

      setGiftCards(data || [])
    } catch (err) {
      console.error('Error in fetchGiftCards:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch gift cards')
    } finally {
      setLoading(false)
    }
  }, [merchantId, status])

  /**
   * Fetch gift card statistics
   */
  const fetchStats = useCallback(async () => {
    if (!merchantId) return

    try {
      // Get active gift cards count and total value
      const { data: activeCards, error: activeError } = await supabase
        .from('gift_cards')
        .select('value')
        .eq('merchant_id', merchantId)
        .eq('status', 'available')

      if (activeError) throw activeError

      const activeCount = activeCards?.length || 0
      const totalValue = activeCards?.reduce((sum, card) => sum + card.value, 0) || 0

      // Get redeemed this month
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const { data: redeemedCards, error: redeemedError } = await supabase
        .from('gift_cards')
        .select('id')
        .eq('merchant_id', merchantId)
        .eq('status', 'redeemed')
        .gte('redeemed_at', firstDayOfMonth)

      if (redeemedError) throw redeemedError

      const redeemedThisMonth = redeemedCards?.length || 0

      // Calculate redemption rate (redeemed / (redeemed + active + expired))
      const { data: allCards, error: allError } = await supabase
        .from('gift_cards')
        .select('id, status')
        .eq('merchant_id', merchantId)

      if (allError) throw allError

      const totalCards = allCards?.length || 0
      const totalRedeemed = allCards?.filter(card => card.status === 'redeemed').length || 0
      const redemptionRate = totalCards > 0 ? Math.round((totalRedeemed / totalCards) * 100) : 0

      setStats({
        activeCount,
        redeemedThisMonth,
        totalValue,
        redemptionRate,
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }, [merchantId])

  /**
   * Redeem a gift card
   */
  const redeemGiftCard = useCallback(async (giftCardId: string) => {
    if (!merchantId) {
      setError('No merchant ID found')
      return false
    }

    try {
      const { error: redeemError } = await supabase
        .from('gift_cards')
        .update({
          status: 'redeemed',
          redeemed_at: new Date().toISOString(),
        })
        .eq('id', giftCardId)
        .eq('merchant_id', merchantId)

      if (redeemError) {
        console.error('Error redeeming gift card:', redeemError)
        setError(redeemError.message)
        return false
      }

      // Remove from local state if we're viewing active cards
      if (status === 'active') {
        setGiftCards((prev) => prev.filter((card) => card.id !== giftCardId))
      }

      // Refresh stats
      await fetchStats()

      return true
    } catch (err) {
      console.error('Error in redeemGiftCard:', err)
      setError(err instanceof Error ? err.message : 'Failed to redeem gift card')
      return false
    }
  }, [merchantId, status, fetchStats])

  /**
   * Check if a gift card is expiring soon (< 7 days)
   */
  const isExpiringSoon = useCallback((expiresAt: string | null): boolean => {
    if (!expiresAt) return false
    const expiryDate = new Date(expiresAt)
    const now = new Date()
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  }, [])

  // Fetch gift cards on mount and when status changes
  useEffect(() => {
    fetchGiftCards()
  }, [fetchGiftCards])

  // Fetch stats on mount
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    giftCards,
    loading,
    error,
    stats,
    fetchGiftCards,
    redeemGiftCard,
    isExpiringSoon,
    refetch: fetchGiftCards,
  }
}
