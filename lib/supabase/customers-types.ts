// Tipos para la tabla de clientes (customers)
// Basado en la estructura real de Supabase

export interface Customer {
  id?: string
  phone: string // Número de WhatsApp sin formato
  name?: string | null // Nombre del cliente
  email?: string | null
  birth_date?: string | null
  gender?: string | null
  total_points?: number | null // Puntos totales
  lifetime_points?: number | null // Puntos acumulados de por vida
  visits_count?: number | null // Total de visitas
  first_visit_at?: string | null // Primera visita
  last_visit_at?: string | null // Última visita
  engagement_score?: number | null
  opt_in_marketing?: boolean | null
  is_active?: boolean | null
  blocked_reason?: string | null
  created_at?: string
  updated_at?: string
}

export interface CreateCustomerInput {
  phone: string
  name?: string | null
  email?: string | null
  birth_date?: string | null
  gender?: string | null
  total_points?: number
  lifetime_points?: number
  visits_count?: number
  opt_in_marketing?: boolean
  is_active?: boolean
}

export interface UpdateCustomerInput {
  name?: string | null
  email?: string | null
  birth_date?: string | null
  gender?: string | null
  total_points?: number
  lifetime_points?: number
  visits_count?: number
  last_visit_at?: string
  engagement_score?: number
  opt_in_marketing?: boolean
  is_active?: boolean
  blocked_reason?: string | null
}
