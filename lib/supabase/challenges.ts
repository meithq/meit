import { createClient } from '@/lib/supabase/client'
import type {
  Challenge,
  CreateChallengeInput,
  UpdateChallengeInput,
  ChallengeType
} from '@/lib/types/challenges'

/**
 * Obtener todos los retos de un negocio
 */
export async function getChallenges(businessId: number): Promise<Challenge[]> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching challenges:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getChallenges:', error)
    return []
  }
}

/**
 * Obtener un reto por ID
 */
export async function getChallengeById(id: string): Promise<Challenge | null> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching challenge:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in getChallengeById:', error)
    return null
  }
}

/**
 * Obtener retos activos de un negocio
 */
export async function getActiveChallenges(businessId: number): Promise<Challenge[]> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching active challenges:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getActiveChallenges:', error)
    return []
  }
}

/**
 * Crear un nuevo reto
 */
export async function createChallenge(input: CreateChallengeInput): Promise<Challenge | null> {
  try {
    const supabase = createClient()

    console.log('📝 Creating challenge with input:', input)

    const insertData = {
      name: input.name,
      description: input.description || null,
      points: input.points,
      challenge_type: input.challenge_type,
      target_value: input.target_value,
      is_repeatable: input.is_repeatable ?? true,
      max_completions_per_day: input.max_completions_per_day || null,
      max_completions_total: input.max_completions_total || null,
      start_date: input.start_date || null,
      end_date: input.end_date || null,
      is_active: input.is_active ?? false,
      business_id: input.business_id,
    }

    console.log('📝 Insert data:', insertData)

    const { data, error } = await supabase
      .from('challenges')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating challenge:', error)
      console.error('❌ Error details:', JSON.stringify(error, null, 2))
      throw error
    }

    console.log('✅ Challenge created:', data)
    return data
  } catch (error) {
    console.error('❌ Error in createChallenge:', error)
    return null
  }
}

/**
 * Actualizar un reto existente
 */
export async function updateChallenge(
  id: string,
  input: UpdateChallengeInput
): Promise<Challenge | null> {
  try {
    const supabase = createClient()

    // Construir objeto de actualización solo con campos definidos
    const updateData: any = {}

    if (input.name !== undefined) updateData.name = input.name
    if (input.description !== undefined) updateData.description = input.description
    if (input.points !== undefined) updateData.points = input.points
    if (input.challenge_type !== undefined) updateData.challenge_type = input.challenge_type
    if (input.target_value !== undefined) updateData.target_value = input.target_value
    if (input.is_repeatable !== undefined) updateData.is_repeatable = input.is_repeatable
    if (input.max_completions_per_day !== undefined) updateData.max_completions_per_day = input.max_completions_per_day
    if (input.max_completions_total !== undefined) updateData.max_completions_total = input.max_completions_total
    if (input.start_date !== undefined) updateData.start_date = input.start_date
    if (input.end_date !== undefined) updateData.end_date = input.end_date
    if (input.is_active !== undefined) updateData.is_active = input.is_active

    const { data, error } = await supabase
      .from('challenges')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating challenge:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in updateChallenge:', error)
    return null
  }
}

/**
 * Eliminar un reto
 */
export async function deleteChallenge(id: string): Promise<boolean> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting challenge:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('Error in deleteChallenge:', error)
    return false
  }
}

/**
 * Activar o desactivar un reto
 */
export async function toggleChallengeActive(
  id: string,
  isActive: boolean
): Promise<Challenge | null> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('challenges')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error toggling challenge active:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in toggleChallengeActive:', error)
    return null
  }
}

/**
 * Obtener estadísticas de retos
 */
export async function getChallengeStats(businessId: number) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('challenges')
      .select('is_active')
      .eq('business_id', businessId)

    if (error) {
      console.error('Error fetching challenge stats:', error)
      throw error
    }

    const total = data?.length || 0
    const active = data?.filter(c => c.is_active).length || 0
    const inactive = total - active

    return {
      total,
      active,
      inactive
    }
  } catch (error) {
    console.error('Error in getChallengeStats:', error)
    return {
      total: 0,
      active: 0,
      inactive: 0
    }
  }
}
