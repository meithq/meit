/**
 * Tipos para el sistema de auditoría de puntos
 */

export interface PointsAudit {
  id: string
  created_at: string
  operator_id: string
  admin_id: string
  customer_id: string
  business_id: number
  points_assigned: number
  challenge_id: string | null
  notes: string | null
}

export interface CreatePointsAuditInput {
  operator_id: string
  admin_id: string
  customer_id: string
  business_id: number
  points_assigned: number
  challenge_id?: string
  notes?: string
}

/**
 * Información de usuario para validación de PIN
 */
export interface UserWithPin {
  id: string
  email: string
  role: number
  admin_pin: string | null
}
