import { createClient } from './client'
import type { Customer, CreateCustomerInput, UpdateCustomerInput } from './customers-types'

/**
 * Obtiene un cliente por su número de teléfono
 */
export async function getCustomerByPhone(phone: string): Promise<Customer | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', phone)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No se encontró el cliente
      return null
    }
    console.error('Error fetching customer:', error)
    throw error
  }

  return data
}

/**
 * Crea un nuevo cliente
 */
export async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
  const supabase = createClient()

  const customerData: any = {
    phone: input.phone,
    name: input.name || null,
    email: input.email || null,
    total_points: input.total_points || 0,
    lifetime_points: input.lifetime_points || 0,
    visits_count: input.visits_count || 0,
    first_visit_at: new Date().toISOString(),
    last_visit_at: new Date().toISOString(),
    is_active: input.is_active !== undefined ? input.is_active : true,
    opt_in_marketing: input.opt_in_marketing !== undefined ? input.opt_in_marketing : true,
  }

  // Agregar campos opcionales si están definidos
  if (input.birth_date) customerData.birth_date = input.birth_date
  if (input.gender) customerData.gender = input.gender

  const { data, error } = await supabase
    .from('customers')
    .insert(customerData)
    .select()
    .single()

  if (error) {
    console.error('Error creating customer:', error)
    throw error
  }

  return data
}

/**
 * Actualiza un cliente existente
 */
export async function updateCustomer(
  phone: string,
  input: UpdateCustomerInput
): Promise<Customer> {
  const supabase = createClient()

  const updateData = {
    ...input,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('customers')
    .update(updateData)
    .eq('phone', phone)
    .select()
    .single()

  if (error) {
    console.error('Error updating customer:', error)
    throw error
  }

  return data
}

/**
 * Obtiene o crea un cliente (upsert)
 * Útil para el webhook: si existe actualiza last_visit_at, si no existe lo crea
 */
export async function getOrCreateCustomer(
  phone: string,
  name: string
): Promise<{ customer: Customer; isNew: boolean }> {
  // Primero intentamos obtener el cliente
  const existingCustomer = await getCustomerByPhone(phone)

  if (existingCustomer) {
    // Cliente existe, actualizamos last_visit_at y nombre
    const updated = await updateCustomer(phone, {
      last_visit_at: new Date().toISOString(),
      name: name, // Actualizamos el nombre por si cambió en WhatsApp
    })

    return {
      customer: updated,
      isNew: false,
    }
  }

  // Cliente no existe, lo creamos
  const newCustomer = await createCustomer({
    phone,
    name,
    total_points: 0,
    lifetime_points: 0,
    visits_count: 0,
    is_active: true,
    opt_in_marketing: true,
  })

  return {
    customer: newCustomer,
    isNew: true,
  }
}

/**
 * Obtiene todos los clientes
 */
export async function getCustomers(): Promise<Customer[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching customers:', error)
    throw error
  }

  return data || []
}

/**
 * Obtiene clientes activos
 */
export async function getActiveCustomers(): Promise<Customer[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching active customers:', error)
    throw error
  }

  return data || []
}

/**
 * Obtiene un cliente por ID
 */
export async function getCustomerById(customerId: string): Promise<Customer | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No se encontró el cliente
      return null
    }
    console.error('Error fetching customer:', error)
    throw error
  }

  return data
}

/**
 * Agregar puntos a un cliente
 * Actualiza tanto total_points como lifetime_points
 */
export async function addPointsToCustomer(
  customerId: string,
  pointsToAdd: number
): Promise<Customer> {
  const supabase = createClient()

  console.log('addPointsToCustomer called with:', { customerId, pointsToAdd })

  // Primero obtener el cliente actual para conocer sus puntos
  const customer = await getCustomerById(customerId)

  console.log('Customer found:', customer)

  if (!customer) {
    console.error('Customer not found for ID:', customerId)
    throw new Error('Cliente no encontrado')
  }

  const currentTotalPoints = customer.total_points || 0
  const currentLifetimePoints = customer.lifetime_points || 0

  // Calcular nuevos valores
  const newTotalPoints = currentTotalPoints + pointsToAdd
  const newLifetimePoints = currentLifetimePoints + pointsToAdd

  // Actualizar el cliente
  const { data, error } = await supabase
    .from('customers')
    .update({
      total_points: newTotalPoints,
      lifetime_points: newLifetimePoints,
      last_visit_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', customerId)
    .select()
    .single()

  if (error) {
    console.error('Error adding points to customer:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    throw new Error(`Error al actualizar puntos del cliente: ${error.message || 'Error desconocido'}`)
  }

  if (!data) {
    throw new Error('No se recibieron datos después de actualizar los puntos')
  }

  console.log('Points successfully added to customer:', data)
  return data
}
