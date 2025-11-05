import { createClient } from './client'
import type {
  CustomerBusiness,
  CustomerBusinessWithDetails,
  CreateCustomerBusinessInput,
  UpdateCustomerBusinessInput,
} from './customer-businesses-types'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Obtiene la relación entre un cliente y un negocio específico
 */
export async function getCustomerBusiness(
  customerId: string,
  businessSettingsId: number,
  supabaseClient?: SupabaseClient
): Promise<CustomerBusiness | null> {
  const supabase = supabaseClient || createClient()

  const { data, error } = await supabase
    .from('customer_businesses')
    .select('*')
    .eq('customer_id', customerId)
    .eq('business_settings_id', businessSettingsId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No se encontró la relación
      return null
    }
    console.error('Error fetching customer-business:', error)
    throw error
  }

  return data
}

/**
 * Crea una nueva relación cliente-negocio
 */
export async function createCustomerBusiness(
  input: CreateCustomerBusinessInput,
  supabaseClient?: SupabaseClient
): Promise<CustomerBusiness> {
  const supabase = supabaseClient || createClient()

  const data: any = {
    customer_id: input.customer_id,
    business_settings_id: input.business_settings_id,
    business_id: input.business_id || null,
    total_points: input.total_points || 0,
    lifetime_points: input.lifetime_points || 0,
    visits_count: input.visits_count || 0,
    is_active: input.is_active !== undefined ? input.is_active : true,
    first_visit_at: new Date().toISOString(),
    last_visit_at: new Date().toISOString(),
  }

  const { data: result, error } = await supabase
    .from('customer_businesses')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('Error creating customer-business:', error)
    throw error
  }

  return result
}

/**
 * Actualiza la relación cliente-negocio
 */
export async function updateCustomerBusiness(
  customerId: string,
  businessSettingsId: number,
  input: UpdateCustomerBusinessInput,
  supabaseClient?: SupabaseClient
): Promise<CustomerBusiness> {
  const supabase = supabaseClient || createClient()

  const { data, error } = await supabase
    .from('customer_businesses')
    .update(input)
    .eq('customer_id', customerId)
    .eq('business_settings_id', businessSettingsId)
    .select()
    .single()

  if (error) {
    console.error('Error updating customer-business:', error)
    throw error
  }

  return data
}

/**
 * Obtiene o crea la relación cliente-negocio (upsert)
 * Retorna también si es una relación nueva
 */
export async function getOrCreateCustomerBusiness(
  customerId: string,
  businessSettingsId: number,
  pointsToAdd: number = 0,
  branchId?: number,
  supabaseClient?: SupabaseClient
): Promise<{ relationship: CustomerBusiness; isNew: boolean }> {
  // Intentar obtener la relación existente
  const existing = await getCustomerBusiness(customerId, businessSettingsId, supabaseClient)

  if (existing) {
    // Ya existe - actualizar puntos y visitas
    const updated = await updateCustomerBusiness(customerId, businessSettingsId, {
      total_points: (existing.total_points || 0) + pointsToAdd,
      lifetime_points: (existing.lifetime_points || 0) + pointsToAdd,
      visits_count: (existing.visits_count || 0) + 1,
      last_visit_at: new Date().toISOString(),
    }, supabaseClient)

    return {
      relationship: updated,
      isNew: false,
    }
  }

  // No existe - crear nueva relación
  const newRelationship = await createCustomerBusiness({
    customer_id: customerId,
    business_settings_id: businessSettingsId,
    business_id: branchId,
    total_points: pointsToAdd,
    lifetime_points: pointsToAdd,
    visits_count: 1,
    is_active: true,
  }, supabaseClient)

  return {
    relationship: newRelationship,
    isNew: true,
  }
}

/**
 * Obtiene todos los clientes de un negocio específico
 * (Para mostrar en el módulo de clientes)
 */
export async function getCustomersByBusiness(
  businessSettingsId: number
): Promise<CustomerBusinessWithDetails[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('customer_businesses')
    .select(`
      *,
      customers:customer_id (
        phone,
        name,
        email,
        is_active
      ),
      business_settings:business_settings_id (
        name,
        address
      )
    `)
    .eq('business_settings_id', businessSettingsId)
    .eq('is_active', true)
    .order('last_visit_at', { ascending: false })

  if (error) {
    console.error('Error fetching customers by business:', error)
    throw error
  }

  // Transformar la respuesta para aplanar la estructura
  return (data || []).map((item: any) => ({
    ...item,
    phone: item.customers?.phone,
    customer_name: item.customers?.name,
    email: item.customers?.email,
    customer_is_active: item.customers?.is_active,
    business_name: item.business_settings?.name,
    business_address: item.business_settings?.address,
  }))
}

/**
 * Obtiene todos los negocios donde está registrado un cliente
 * (Para ver en qué negocios está un cliente y sus puntos en cada uno)
 */
export async function getBusinessesByCustomer(
  customerId: string,
  supabaseClient?: SupabaseClient
): Promise<CustomerBusinessWithDetails[]> {
  const supabase = supabaseClient || createClient()

  const { data, error } = await supabase
    .from('customer_businesses')
    .select(`
      *,
      business_settings:business_settings_id (
        name,
        address
      )
    `)
    .eq('customer_id', customerId)
    .eq('is_active', true)
    .order('last_visit_at', { ascending: false })

  if (error) {
    console.error('Error fetching businesses by customer:', error)
    throw error
  }

  // Transformar la respuesta
  return (data || []).map((item: any) => ({
    ...item,
    business_name: item.business_settings?.name,
    business_address: item.business_settings?.address,
  }))
}

/**
 * Obtiene estadísticas de un cliente en un negocio específico
 */
export async function getCustomerBusinessStats(
  customerId: string,
  businessSettingsId: number
): Promise<{
  totalPoints: number
  lifetimePoints: number
  visitsCount: number
  firstVisit: string | null
  lastVisit: string | null
} | null> {
  const relationship = await getCustomerBusiness(customerId, businessSettingsId)

  if (!relationship) {
    return null
  }

  return {
    totalPoints: relationship.total_points || 0,
    lifetimePoints: relationship.lifetime_points || 0,
    visitsCount: relationship.visits_count || 0,
    firstVisit: relationship.first_visit_at || null,
    lastVisit: relationship.last_visit_at || null,
  }
}
