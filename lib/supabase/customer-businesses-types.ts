// Tipos para la tabla de relación customer_businesses
// Un cliente puede estar registrado en múltiples negocios con puntos independientes

export interface CustomerBusiness {
  id?: string
  customer_id: string
  business_settings_id: number // ID del negocio padre (business_settings)
  business_id?: number // ID de la sucursal específica donde hizo check-in (opcional)

  // Puntos independientes por negocio PADRE
  total_points?: number // Puntos actuales en ESTE negocio (todas las sucursales)
  lifetime_points?: number // Puntos históricos en ESTE negocio (todas las sucursales)
  visits_count?: number // Visitas a cualquier sucursal de ESTE negocio

  // Fechas específicas del negocio
  first_visit_at?: string
  last_visit_at?: string

  // Estado
  is_active?: boolean

  // Metadata
  notes?: string | null
  tags?: string[] | null

  // Timestamps
  created_at?: string
  updated_at?: string
}

export interface CustomerBusinessWithDetails extends CustomerBusiness {
  // Información del cliente
  phone?: string
  customer_name?: string
  email?: string | null
  customer_is_active?: boolean

  // Información del negocio
  business_name?: string
  business_address?: string | null
  business_owner?: string
}

export interface CreateCustomerBusinessInput {
  customer_id: string
  business_settings_id: number
  business_id?: number // Sucursal específica (opcional)
  total_points?: number
  lifetime_points?: number
  visits_count?: number
  is_active?: boolean
}

export interface UpdateCustomerBusinessInput {
  total_points?: number
  lifetime_points?: number
  visits_count?: number
  last_visit_at?: string
  is_active?: boolean
  notes?: string | null
  tags?: string[] | null
}

// Ejemplo de uso:
// Cliente "Juan" registrado en 2 negocios diferentes:
//
// Panadería Central (business_settings_id: 1):
// {
//   customer_id: "uuid-juan",
//   business_settings_id: 1,
//   total_points: 100,     <- 100 puntos en Panadería (sumados de todas sus sucursales)
//   visits_count: 10       <- 10 visitas totales (a cualquier sucursal de Panadería)
// }
//
// Charcutería Don José (business_settings_id: 2):
// {
//   customer_id: "uuid-juan",
//   business_settings_id: 2,
//   total_points: 25,      <- 25 puntos en Charcutería (independiente)
//   visits_count: 3
// }
//
// Los puntos se acumulan por negocio PADRE, no por sucursal individual
