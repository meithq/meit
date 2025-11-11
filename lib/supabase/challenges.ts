import type { SupabaseClient } from '@supabase/supabase-js'
import type { ActiveChallenge } from './challenges-types'

/**
 * Gets all active challenges for a specific business/branch
 * @param businessId - The business ID (from businesses table)
 * @param supabase - Supabase client instance
 * @returns Array of active challenges
 */
export async function getActiveChallengesByBusiness(
  businessId: number,
  supabase: SupabaseClient
): Promise<ActiveChallenge[]> {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('challenges')
    .select('id, name, description, points, challenge_type, target_value')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order('points', { ascending: true })

  if (error) {
    console.error('Error fetching challenges:', error)
    return []
  }

  return data || []
}

/**
 * Gets all active challenges for multiple businesses
 * @param businessIds - Array of business IDs
 * @param supabase - Supabase client instance
 * @returns Map of business ID to challenges array
 */
export async function getActiveChallengesForBusinesses(
  businessIds: number[],
  supabase: SupabaseClient
): Promise<Map<number, ActiveChallenge[]>> {
  if (businessIds.length === 0) {
    return new Map()
  }

  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('challenges')
    .select('id, name, description, points, challenge_type, target_value, business_id')
    .in('business_id', businessIds)
    .eq('is_active', true)
    .or(`start_date.is.null,start_date.lte.${now}`)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order('business_id', { ascending: true })
    .order('points', { ascending: true })

  if (error) {
    console.error('Error fetching challenges for businesses:', error)
    return new Map()
  }

  // Group challenges by business_id
  const challengesMap = new Map<number, ActiveChallenge[]>()

  for (const challenge of data || []) {
    const businessId = (challenge as any).business_id
    const activeChallenges = challengesMap.get(businessId) || []

    // Remove business_id from the challenge object before adding
    const { business_id, ...challengeWithoutBusinessId } = challenge as any
    activeChallenges.push(challengeWithoutBusinessId as ActiveChallenge)

    challengesMap.set(businessId, activeChallenges)
  }

  return challengesMap
}
