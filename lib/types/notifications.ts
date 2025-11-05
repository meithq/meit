/**
 * Sistema de Notificaciones
 * Tipos TypeScript para notificaciones del negocio
 */

export type NotificationType =
  | 'checkin'
  | 'gift_card_generated'
  | 'gift_card_redeemed'
  | 'points_assigned'
  | 'customer_milestone'
  | 'challenge_completed'
  | 'new_customer'

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface NotificationMetadata {
  customer_id?: string
  customer_name?: string
  customer_phone?: string
  branch_id?: number
  branch_name?: string
  points?: number
  gift_card_code?: string
  amount?: number
  milestone?: string
  challenge_name?: string
  [key: string]: any // Permitir propiedades adicionales
}

export interface Notification {
  id: string
  business_settings_id: number
  type: NotificationType
  title: string
  message: string
  metadata: NotificationMetadata
  is_read: boolean
  read_at: string | null
  priority: NotificationPriority
  created_at: string
}

export interface CreateNotificationInput {
  business_settings_id: number
  customer_id?: string
  type: NotificationType
  title: string
  message: string
  metadata?: NotificationMetadata
  priority?: NotificationPriority
}

export interface NotificationStats {
  total: number
  unread: number
  by_type: Record<NotificationType, number>
}

// Mapeo de tipos a iconos y colores
export const NOTIFICATION_CONFIG: Record<NotificationType, {
  icon: string
  color: string
  bgColor: string
}> = {
  checkin: {
    icon: '📍',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  gift_card_generated: {
    icon: '🎁',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  gift_card_redeemed: {
    icon: '✨',
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  points_assigned: {
    icon: '⭐',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  },
  customer_milestone: {
    icon: '🏆',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  challenge_completed: {
    icon: '🎯',
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  },
  new_customer: {
    icon: '👤',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100'
  }
}

// Mapeo de prioridades a estilos
export const PRIORITY_CONFIG: Record<NotificationPriority, {
  badgeColor: string
  label: string
}> = {
  low: {
    badgeColor: 'bg-gray-100 text-gray-600',
    label: 'Baja'
  },
  normal: {
    badgeColor: 'bg-blue-100 text-blue-600',
    label: 'Normal'
  },
  high: {
    badgeColor: 'bg-orange-100 text-orange-600',
    label: 'Alta'
  },
  urgent: {
    badgeColor: 'bg-red-100 text-red-600',
    label: 'Urgente'
  }
}
