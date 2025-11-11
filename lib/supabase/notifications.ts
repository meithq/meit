/**
 * Funciones para gestionar notificaciones en Supabase
 */

import { createClient } from './client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Notification,
  CreateNotificationInput,
  NotificationStats,
  NotificationType
} from '@/lib/types/notifications'

/**
 * Obtiene todas las notificaciones de un negocio
 * Por defecto ordenadas por fecha (más recientes primero)
 */
export async function getNotifications(
  businessSettingsId: number,
  options?: {
    limit?: number
    offset?: number
    onlyUnread?: boolean
    onlyRead?: boolean
    type?: NotificationType
  }
): Promise<Notification[]> {
  const supabase = createClient()

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('business_settings_id', businessSettingsId)
    .order('created_at', { ascending: false })

  // Filtros opcionales
  if (options?.onlyUnread) {
    query = query.eq('is_read', false)
  }

  if (options?.onlyRead) {
    query = query.eq('is_read', true)
  }

  if (options?.type) {
    query = query.eq('type', options.type)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching notifications:', error)
    throw error
  }

  return data || []
}

/**
 * Obtiene una notificación por ID
 */
export async function getNotificationById(
  notificationId: string
): Promise<Notification | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('id', notificationId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching notification:', error)
    throw error
  }

  return data
}

/**
 * Crea una nueva notificación
 * Nota: Normalmente se usará desde el webhook con service_role
 */
export async function createNotification(
  input: CreateNotificationInput,
  supabaseClient?: SupabaseClient
): Promise<Notification> {
  const supabase = supabaseClient || createClient()

  const notificationData: any = {
    business_settings_id: input.business_settings_id,
    type: input.type,
    title: input.title,
    message: input.message,
    metadata: input.metadata || {},
    priority: input.priority || 'normal'
  }

  // Agregar customer_id si está presente
  if (input.customer_id) {
    notificationData.customer_id = input.customer_id
  }

  console.log('Creating notification with data:', notificationData)

  const { data, error } = await supabase
    .from('notifications')
    .insert(notificationData)
    .select()
    .single()

  if (error) {
    console.error('Error creating notification:', error)
    console.error('Failed notification data:', notificationData)
    throw error
  }

  return data
}

/**
 * Marca una notificación como leída
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<Notification> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('id', notificationId)
    .select()
    .single()

  if (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }

  return data
}

/**
 * Marca todas las notificaciones de un negocio como leídas
 */
export async function markAllNotificationsAsRead(
  businessSettingsId: number
): Promise<number> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('business_settings_id', businessSettingsId)
    .eq('is_read', false)
    .select()

  if (error) {
    console.error('Error marking all notifications as read:', error)
    throw error
  }

  return data?.length || 0
}

/**
 * Elimina una notificación
 */
export async function deleteNotification(
  notificationId: string
): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)

  if (error) {
    console.error('Error deleting notification:', error)
    throw error
  }
}

/**
 * Elimina todas las notificaciones leídas de un negocio
 */
export async function deleteReadNotifications(
  businessSettingsId: number
): Promise<number> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('notifications')
    .delete()
    .eq('business_settings_id', businessSettingsId)
    .eq('is_read', true)
    .select()

  if (error) {
    console.error('Error deleting read notifications:', error)
    throw error
  }

  return data?.length || 0
}

/**
 * Obtiene estadísticas de notificaciones de un negocio
 */
export async function getNotificationStats(
  businessSettingsId: number
): Promise<NotificationStats> {
  const supabase = createClient()

  // Obtener todas las notificaciones
  const { data, error } = await supabase
    .from('notifications')
    .select('type, is_read')
    .eq('business_settings_id', businessSettingsId)

  if (error) {
    console.error('Error fetching notification stats:', error)
    throw error
  }

  const notifications = data || []

  // Calcular estadísticas
  const stats: NotificationStats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.is_read).length,
    by_type: {
      checkin: 0,
      gift_card_generated: 0,
      gift_card_redeemed: 0,
      points_assigned: 0,
      customer_milestone: 0,
      challenge_completed: 0,
      new_customer: 0
    }
  }

  // Contar por tipo
  notifications.forEach(n => {
    if (n.type in stats.by_type) {
      stats.by_type[n.type as NotificationType]++
    }
  })

  return stats
}

/**
 * Obtiene el contador de notificaciones no leídas
 */
export async function getUnreadCount(
  businessSettingsId: number
): Promise<number> {
  const supabase = createClient()

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('business_settings_id', businessSettingsId)
    .eq('is_read', false)

  if (error) {
    console.error('Error fetching unread count:', error)
    throw error
  }

  return count || 0
}

/**
 * Suscribirse a cambios en tiempo real de notificaciones
 * Útil para actualizar el contador en tiempo real
 */
export function subscribeToNotifications(
  businessSettingsId: number,
  callback: (payload: any) => void
) {
  const supabase = createClient()

  // Crear un canal con nombre único para evitar conflictos
  const channelName = `notifications_${businessSettingsId}_${Date.now()}`

  console.log(`📡 Setting up realtime subscription: ${channelName}`)

  const subscription = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `business_settings_id=eq.${businessSettingsId}`
      },
      (payload) => {
        console.log('🔔 Realtime notification received:', payload)
        callback(payload)
      }
    )
    .subscribe((status) => {
      console.log(`📡 Subscription status for ${channelName}:`, status)
    })

  // Retornar función para desuscribirse
  return () => {
    console.log(`📡 Unsubscribing from ${channelName}`)
    subscription.unsubscribe()
  }
}
