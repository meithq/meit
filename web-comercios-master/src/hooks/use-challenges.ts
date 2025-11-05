'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'
import type { Challenge, CreateChallengeDto, UpdateChallengeDto } from '@/types/database'

/**
 * Challenges hook
 *
 * Provides CRUD operations for challenges
 *
 * Usage:
 * ```typescript
 * const { challenges, loading, error, fetchChallenges, createChallenge, updateChallenge, toggleChallengeStatus } = useChallenges()
 * ```
 */
export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const merchantId = useAuthStore((state) => state.merchantId)

  /**
   * Fetch challenges (optionally only active ones)
   */
  const fetchChallenges = useCallback(async (activeOnly: boolean = false) => {
    if (!merchantId) {
      setError('No merchant ID found')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('challenges')
        .select('*, type:challenge_type')
        .eq('merchant_id', merchantId)

      // Filter by active status if requested
      if (activeOnly) {
        query = query.eq('is_active', true)
      }

      // Order by created date (newest first)
      query = query.order('created_at', { ascending: false })

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error('Error fetching challenges:', fetchError)
        setError(fetchError.message)
        return
      }

      setChallenges(data || [])
    } catch (err) {
      console.error('Error in fetchChallenges:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch challenges')
    } finally {
      setLoading(false)
    }
  }, [merchantId])

  /**
   * Create a new challenge
   */
  const createChallenge = useCallback(async (data: CreateChallengeDto) => {
    if (!merchantId) {
      setError('No merchant ID found')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const { data: newChallenge, error: createError } = await supabase
        .from('challenges')
        .insert({
          merchant_id: merchantId,
          name: data.name,
          description: data.description || null,
          challenge_type: data.type,
          points: data.points,
          target_value: data.target_value || null,
          is_active: data.is_active ?? true,
        })
        .select('*, type:challenge_type')
        .single()

      if (createError) {
        console.error('Error creating challenge:', createError)
        setError(createError.message)
        return null
      }

      // Add to local state
      setChallenges((prev) => [newChallenge, ...prev])

      return newChallenge
    } catch (err) {
      console.error('Error in createChallenge:', err)
      setError(err instanceof Error ? err.message : 'Failed to create challenge')
      return null
    } finally {
      setLoading(false)
    }
  }, [merchantId])

  /**
   * Update an existing challenge
   */
  const updateChallenge = useCallback(async (id: string, data: UpdateChallengeDto) => {
    if (!merchantId) {
      setError('No merchant ID found')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const updateData: Record<string, unknown> = {}

      if (data.name !== undefined) updateData.name = data.name
      if (data.description !== undefined) updateData.description = data.description
      if (data.points !== undefined) updateData.points = data.points
      if (data.target_value !== undefined) updateData.target_value = data.target_value
      if (data.is_active !== undefined) updateData.is_active = data.is_active

      const { data: updatedChallenge, error: updateError } = await supabase
        .from('challenges')
        .update(updateData)
        .eq('id', id)
        .eq('merchant_id', merchantId)
        .select('*, type:challenge_type')
        .single()

      if (updateError) {
        console.error('Error updating challenge:', updateError)
        setError(updateError.message)
        return null
      }

      // Update local state
      setChallenges((prev) =>
        prev.map((challenge) => (challenge.id === id ? updatedChallenge : challenge))
      )

      return updatedChallenge
    } catch (err) {
      console.error('Error in updateChallenge:', err)
      setError(err instanceof Error ? err.message : 'Failed to update challenge')
      return null
    } finally {
      setLoading(false)
    }
  }, [merchantId])

  /**
   * Toggle challenge active status
   */
  const toggleChallengeStatus = useCallback(async (id: string) => {
    if (!merchantId) {
      setError('No merchant ID found')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      // Find current challenge to get its status
      const currentChallenge = challenges.find((c) => c.id === id)
      if (!currentChallenge) {
        setError('Challenge not found')
        return null
      }

      const { data: updatedChallenge, error: updateError } = await supabase
        .from('challenges')
        .update({ is_active: !currentChallenge.is_active })
        .eq('id', id)
        .eq('merchant_id', merchantId)
        .select('*, type:challenge_type')
        .single()

      if (updateError) {
        console.error('Error toggling challenge status:', updateError)
        setError(updateError.message)
        return null
      }

      // Update local state
      setChallenges((prev) =>
        prev.map((challenge) => (challenge.id === id ? updatedChallenge : challenge))
      )

      return updatedChallenge
    } catch (err) {
      console.error('Error in toggleChallengeStatus:', err)
      setError(err instanceof Error ? err.message : 'Failed to toggle challenge status')
      return null
    } finally {
      setLoading(false)
    }
  }, [merchantId, challenges])

  /**
   * Get challenge by ID
   */
  const getChallengeById = useCallback(async (id: string) => {
    if (!merchantId) {
      setError('No merchant ID found')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const { data: challenge, error: fetchError } = await supabase
        .from('challenges')
        .select('*, type:challenge_type')
        .eq('id', id)
        .eq('merchant_id', merchantId)
        .single()

      if (fetchError) {
        console.error('Error fetching challenge:', fetchError)
        setError(fetchError.message)
        return null
      }

      return challenge
    } catch (err) {
      console.error('Error in getChallengeById:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch challenge')
      return null
    } finally {
      setLoading(false)
    }
  }, [merchantId])

  return {
    challenges,
    loading,
    error,
    fetchChallenges,
    createChallenge,
    updateChallenge,
    toggleChallengeStatus,
    getChallengeById,
  }
}
