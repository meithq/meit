/**
 * Funciones para obtener datos del Dashboard
 */

import { createClient } from './client'
import { getBusinessSettings } from './business-settings'

export interface DashboardMetrics {
  checkinsToday: number
  pointsToday: number
  activeCustomers: number
  giftCardsGenerated: number
}

export interface ChartDataPoint {
  day: string
  value: number
}

/**
 * Obtiene las métricas principales del dashboard
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = createClient()
  const businessSettings = await getBusinessSettings()

  if (!businessSettings?.id) {
    return {
      checkinsToday: 0,
      pointsToday: 0,
      activeCustomers: 0,
      giftCardsGenerated: 0,
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  // Check-ins hoy (contamos registros en points_audit del día de hoy)
  const { count: checkinsToday } = await supabase
    .from('points_audit')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayISO)
    .gt('points_assigned', 0)

  // Puntos asignados hoy
  const { data: pointsData } = await supabase
    .from('points_audit')
    .select('points_assigned')
    .gte('created_at', todayISO)
    .gt('points_assigned', 0)

  const pointsToday = pointsData?.reduce((sum, item) => sum + item.points_assigned, 0) || 0

  // Clientes activos (clientes con al menos 1 punto)
  const { count: activeCustomers } = await supabase
    .from('customer_businesses')
    .select('*', { count: 'exact', head: true })
    .eq('business_settings_id', businessSettings.id)
    .gt('total_points', 0)

  // Gift Cards generadas (total histórico)
  const { count: giftCardsGenerated } = await supabase
    .from('gift_cards')
    .select('*', { count: 'exact', head: true })
    .eq('business_settings_id', businessSettings.id)

  return {
    checkinsToday: checkinsToday || 0,
    pointsToday,
    activeCustomers: activeCustomers || 0,
    giftCardsGenerated: giftCardsGenerated || 0,
  }
}

/**
 * Obtiene datos de check-ins para el gráfico
 */
export async function getCheckinsChartData(days: number): Promise<ChartDataPoint[]> {
  const supabase = createClient()
  const businessSettings = await getBusinessSettings()

  if (!businessSettings?.id) {
    return []
  }

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)

  const { data } = await supabase
    .from('points_audit')
    .select('created_at, points_assigned')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .gt('points_assigned', 0)
    .order('created_at', { ascending: true })

  if (!data || data.length === 0) {
    return []
  }

  // Agrupar por día
  const dayMap = new Map<string, number>()

  data.forEach((item) => {
    const date = new Date(item.created_at)
    const dayKey = date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
    dayMap.set(dayKey, (dayMap.get(dayKey) || 0) + 1)
  })

  // Convertir a array
  return Array.from(dayMap.entries()).map(([day, count]) => ({
    day,
    value: count,
  }))
}

/**
 * Obtiene datos de puntos asignados para el gráfico
 */
export async function getPointsChartData(days: number): Promise<ChartDataPoint[]> {
  const supabase = createClient()
  const businessSettings = await getBusinessSettings()

  if (!businessSettings?.id) {
    return []
  }

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)

  const { data } = await supabase
    .from('points_audit')
    .select('created_at, points_assigned')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .gt('points_assigned', 0)
    .order('created_at', { ascending: true })

  if (!data || data.length === 0) {
    return []
  }

  // Agrupar por día
  const dayMap = new Map<string, number>()

  data.forEach((item) => {
    const date = new Date(item.created_at)
    const dayKey = date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
    dayMap.set(dayKey, (dayMap.get(dayKey) || 0) + item.points_assigned)
  })

  // Convertir a array
  return Array.from(dayMap.entries()).map(([day, points]) => ({
    day,
    value: points,
  }))
}
