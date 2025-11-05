import { createClient } from '@/lib/supabase/client'
import type { PointsAudit, CreatePointsAuditInput, UserWithPin } from '@/lib/types/points-audit'

/**
 * Validar PIN de administrador
 * Verifica que el PIN pertenezca a un usuario con role = 1 (Admin)
 */
export async function validateAdminPin(pin: string): Promise<UserWithPin | null> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, admin_pin')
      .eq('admin_pin', pin)
      .eq('role', 1)
      .single()

    if (error) {
      console.error('Error validating admin PIN:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in validateAdminPin:', error)
    return null
  }
}

/**
 * Crear registro de auditoría
 */
export async function createPointsAudit(input: CreatePointsAuditInput): Promise<PointsAudit | null> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('points_audit')
      .insert({
        operator_id: input.operator_id,
        admin_id: input.admin_id,
        customer_id: input.customer_id,
        business_id: input.business_id,
        points_assigned: input.points_assigned,
        challenge_id: input.challenge_id || null,
        notes: input.notes || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating points audit:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in createPointsAudit:', error)
    return null
  }
}

/**
 * Obtener registros de auditoría por negocio
 */
export async function getPointsAuditByBusiness(businessId: number): Promise<PointsAudit[]> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('points_audit')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching points audit:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getPointsAuditByBusiness:', error)
    return []
  }
}

/**
 * Obtener registros de auditoría por cliente
 */
export async function getPointsAuditByCustomer(customerId: string): Promise<PointsAudit[]> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('points_audit')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching points audit:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getPointsAuditByCustomer:', error)
    return []
  }
}

/**
 * Obtener usuario actual
 */
export async function getCurrentUser() {
  try {
    const supabase = createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Error getting current user:', error)
      return null
    }

    if (!user) {
      console.error('No authenticated user found')
      return null
    }

    console.log('Auth user ID:', user.id)

    // Primero intentar buscar por el campo 'auth' (que parece ser la FK a auth.users)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role, admin_pin, auth')
      .eq('auth', user.id)
      .single()

    if (userError) {
      console.error('Error fetching user data from users table (by auth field):', userError)

      // Intentar buscar por id directamente
      const { data: userDataById, error: userErrorById } = await supabase
        .from('users')
        .select('id, email, role, admin_pin, auth')
        .eq('id', user.id)
        .single()

      if (userErrorById) {
        console.error('Error fetching user data from users table (by id field):', userErrorById)

        // Si no existe en la tabla users, retornar el user de auth con datos por defecto
        console.log('User not found in users table, returning auth user with defaults')
        return {
          id: user.id,
          email: user.email || '',
          role: 1, // Asumir role admin por defecto
          admin_pin: null
        }
      }

      console.log('User data from users table (by id):', userDataById)
      return userDataById
    }

    console.log('User data from users table (by auth):', userData)
    return userData
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}
