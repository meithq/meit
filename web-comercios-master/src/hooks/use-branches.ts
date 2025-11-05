'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'
import type { Branch } from '@/types/database'

/**
 * Branches management hook
 *
 * Provides CRUD operations for merchant branches with QR code generation
 */
export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const merchantId = useAuthStore((state) => state.merchantId)
  const userRole = useAuthStore((state) => state.user?.role)

  /**
   * Fetch branches for the merchant
   */
  const fetchBranches = useCallback(async () => {
    if (!merchantId) {
      setError('No merchant ID found')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('branches')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching branches:', fetchError)
        setError(fetchError.message)
        return
      }

      setBranches(data || [])
    } catch (err) {
      console.error('Error in fetchBranches:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch branches')
    } finally {
      setLoading(false)
    }
  }, [merchantId])

  /**
   * Create a new branch
   */
  const createBranch = useCallback(
    async (data: {
      name: string
      address?: string
      latitude?: number
      longitude?: number
    }) => {
      if (!merchantId) {
        setError('No merchant ID found')
        return null
      }

      if (userRole !== 'admin') {
        setError('Only admins can create branches')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        // Generate unique QR code
        const qrCode = `BRANCH_${Math.random().toString(36).substring(2, 10).toUpperCase()}`

        const { data: newBranch, error: createError } = await supabase
          .from('branches')
          .insert({
            merchant_id: merchantId,
            name: data.name,
            address: data.address || null,
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            qr_code: qrCode,
            is_active: true,
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating branch:', createError)
          setError(createError.message)
          return null
        }

        // Add to local state
        setBranches((prev) => [newBranch, ...prev])

        return newBranch
      } catch (err) {
        console.error('Error in createBranch:', err)
        setError(err instanceof Error ? err.message : 'Failed to create branch')
        return null
      } finally {
        setLoading(false)
      }
    },
    [merchantId, userRole]
  )

  /**
   * Update an existing branch
   */
  const updateBranch = useCallback(
    async (
      id: string,
      data: {
        name?: string
        address?: string
        latitude?: number
        longitude?: number
        is_active?: boolean
      }
    ) => {
      if (!merchantId) {
        setError('No merchant ID found')
        return null
      }

      if (userRole !== 'admin') {
        setError('Only admins can update branches')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const { data: updatedBranch, error: updateError } = await supabase
          .from('branches')
          .update({
            name: data.name,
            address: data.address,
            latitude: data.latitude,
            longitude: data.longitude,
            is_active: data.is_active,
          })
          .eq('id', id)
          .eq('merchant_id', merchantId)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating branch:', updateError)
          setError(updateError.message)
          return null
        }

        // Update local state
        setBranches((prev) =>
          prev.map((branch) => (branch.id === id ? updatedBranch : branch))
        )

        return updatedBranch
      } catch (err) {
        console.error('Error in updateBranch:', err)
        setError(err instanceof Error ? err.message : 'Failed to update branch')
        return null
      } finally {
        setLoading(false)
      }
    },
    [merchantId, userRole]
  )

  /**
   * Delete a branch
   */
  const deleteBranch = useCallback(
    async (id: string) => {
      if (!merchantId) {
        setError('No merchant ID found')
        return false
      }

      if (userRole !== 'admin') {
        setError('Only admins can delete branches')
        return false
      }

      setLoading(true)
      setError(null)

      try {
        const { error: deleteError } = await supabase
          .from('branches')
          .delete()
          .eq('id', id)
          .eq('merchant_id', merchantId)

        if (deleteError) {
          console.error('Error deleting branch:', deleteError)
          setError(deleteError.message)
          return false
        }

        // Remove from local state
        setBranches((prev) => prev.filter((branch) => branch.id !== id))

        return true
      } catch (err) {
        console.error('Error in deleteBranch:', err)
        setError(err instanceof Error ? err.message : 'Failed to delete branch')
        return false
      } finally {
        setLoading(false)
      }
    },
    [merchantId, userRole]
  )

  /**
   * Toggle branch active status
   */
  const toggleBranchStatus = useCallback(
    async (id: string, isActive: boolean) => {
      return updateBranch(id, { is_active: isActive })
    },
    [updateBranch]
  )

  return {
    branches,
    loading,
    error,
    fetchBranches,
    createBranch,
    updateBranch,
    deleteBranch,
    toggleBranchStatus,
  }
}
