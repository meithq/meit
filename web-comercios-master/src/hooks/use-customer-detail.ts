'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'
import type { Customer } from '@/types/database'
import type { CustomerDetailStats, Transaction, GiftCard } from '@/types/customer'

interface UseCustomerDetailReturn {
  customer: Customer | null
  stats: CustomerDetailStats | null
  transactions: Transaction[]
  giftCards: GiftCard[]
  loading: boolean
  error: string | null
  refreshCustomer: () => Promise<void>
  updateCustomerInfo: (data: { name?: string; email?: string }) => Promise<boolean>
  adjustPoints: (points: number, reason: string) => Promise<boolean>
}

/**
 * Customer Detail Hook
 *
 * Fetches comprehensive customer data including stats, transactions, and gift cards
 *
 * Usage:
 * ```typescript
 * const { customer, stats, transactions, giftCards, loading } = useCustomerDetail(customerId)
 * ```
 */
export function useCustomerDetail(customerId: string): UseCustomerDetailReturn {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [stats, setStats] = useState<CustomerDetailStats | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [giftCards, setGiftCards] = useState<GiftCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const merchantId = useAuthStore((state) => state.merchantId)

  /**
   * Fetch customer data
   */
  const fetchCustomer = useCallback(async () => {
    if (!merchantId || !customerId) {
      setError('No merchant ID or customer ID found')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Fetch customer
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .eq('merchant_id', merchantId)
        .single()

      if (customerError) {
        console.error('Error fetching customer:', customerError)
        setError(customerError.message)
        setLoading(false)
        return
      }

      if (!customerData) {
        setError('Cliente no encontrado')
        setLoading(false)
        return
      }

      setCustomer(customerData)

      // Fetch transactions (last 10)
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('customer_id', customerId)
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError)
      } else {
        // Map database transactions to our Transaction type
        const mappedTransactions: Transaction[] = (transactionsData || []).map((t) => ({
          id: t.id,
          customerId: t.customer_id,
          type: mapTransactionType(t.type, t.description),
          amount: extractAmount(t.description),
          points: t.points,
          description: t.description || '',
          createdAt: t.created_at,
        }))
        setTransactions(mappedTransactions)
      }

      // Fetch active gift cards
      const { data: giftCardsData, error: giftCardsError } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('customer_id', customerId)
        .eq('merchant_id', merchantId)
        .in('status', ['available', 'redeemed'])
        .order('created_at', { ascending: false })

      if (giftCardsError) {
        console.error('Error fetching gift cards:', giftCardsError)
      } else {
        // Map database gift cards to our GiftCard type
        const mappedGiftCards: GiftCard[] = (giftCardsData || []).map((gc) => ({
          id: gc.id,
          customerId: gc.customer_id || '',
          code: gc.code,
          value: gc.value,
          status: gc.status,
          expiresAt: gc.expires_at,
          redeemedAt: gc.redeemed_at,
          createdAt: gc.created_at,
        }))
        setGiftCards(mappedGiftCards)
      }

      // Calculate stats
      const calculatedStats: CustomerDetailStats = {
        totalPoints: customerData.total_points,
        totalVisits: customerData.visit_count,
        totalSpent: calculateTotalSpent(transactionsData || []),
        giftCardsGenerated: (giftCardsData || []).length,
      }
      setStats(calculatedStats)
    } catch (err) {
      console.error('Error in fetchCustomer:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch customer details')
    } finally {
      setLoading(false)
    }
  }, [merchantId, customerId])

  /**
   * Update customer information
   */
  const updateCustomerInfo = useCallback(
    async (data: { name?: string; email?: string }) => {
      if (!merchantId || !customerId) {
        setError('No merchant ID or customer ID found')
        return false
      }

      setLoading(true)
      setError(null)

      try {
        const { data: updatedCustomer, error: updateError } = await supabase
          .from('customers')
          .update({
            name: data.name,
            email: data.email,
          })
          .eq('id', customerId)
          .eq('merchant_id', merchantId)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating customer:', updateError)
          setError(updateError.message)
          return false
        }

        setCustomer(updatedCustomer)
        return true
      } catch (err) {
        console.error('Error in updateCustomerInfo:', err)
        setError(err instanceof Error ? err.message : 'Failed to update customer')
        return false
      } finally {
        setLoading(false)
      }
    },
    [merchantId, customerId]
  )

  /**
   * Adjust customer points (admin only)
   */
  const adjustPoints = useCallback(
    async (points: number, reason: string) => {
      if (!merchantId || !customerId) {
        setError('No merchant ID or customer ID found')
        return false
      }

      setLoading(true)
      setError(null)

      try {
        // Create point transaction
        const { error: transactionError } = await supabase
          .from('point_transactions')
          .insert({
            customer_id: customerId,
            merchant_id: merchantId,
            points,
            type: 'adjustment',
            description: reason,
          })

        if (transactionError) {
          console.error('Error creating point transaction:', transactionError)
          setError(transactionError.message)
          return false
        }

        // Refresh customer data to get updated points
        await fetchCustomer()
        return true
      } catch (err) {
        console.error('Error in adjustPoints:', err)
        setError(err instanceof Error ? err.message : 'Failed to adjust points')
        return false
      } finally {
        setLoading(false)
      }
    },
    [merchantId, customerId, fetchCustomer]
  )

  // Initial fetch
  useEffect(() => {
    fetchCustomer()
  }, [fetchCustomer])

  return {
    customer,
    stats,
    transactions,
    giftCards,
    loading,
    error,
    refreshCustomer: fetchCustomer,
    updateCustomerInfo,
    adjustPoints,
  }
}

// Helper functions

/**
 * Map database transaction type to our Transaction type
 */
function mapTransactionType(
  dbType: string,
  description: string | null
): Transaction['type'] {
  if (dbType === 'adjustment') return 'points_adjustment'
  if (dbType === 'redeem') return 'gift_card_redeemed'
  if (description?.includes('gift card')) return 'gift_card_generated'
  return 'purchase'
}

/**
 * Extract amount from transaction description
 */
function extractAmount(description: string | null): number | undefined {
  if (!description) return undefined

  // Look for patterns like "Compra Bs. 15.50" or "$15.50"
  const match = description.match(/(?:Bs\.\s*|[$])(\d+(?:[.,]\d{2})?)/)
  if (match) {
    return parseFloat(match[1].replace(',', '.'))
  }

  return undefined
}

/**
 * Calculate total spent from transactions
 */
function calculateTotalSpent(transactions: Array<{ type: string; description: string | null }>): number {
  return transactions.reduce((total, t) => {
    if (t.type === 'earn') {
      const amount = extractAmount(t.description)
      return total + (amount || 0)
    }
    return total
  }, 0)
}
