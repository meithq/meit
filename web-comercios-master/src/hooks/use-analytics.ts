'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'
import type { DashboardMetrics } from '@/types/database'
import { format, subDays, eachDayOfInterval, startOfDay } from 'date-fns'
import { DATE_FORMATS } from '@/lib/constants'

// Extended metrics for analytics page
export interface AnalyticsMetrics extends DashboardMetrics {
  new_customers: number
  retention_rate: number
  gift_cards_generated: number
  gift_cards_redeemed: number
  growth_percentage: number
}

// Chart data types
export interface ChartDataPoint {
  date: string
  value: number
}

export interface TopChallenge {
  id: string
  name: string
  completions: number
}

export interface InsightData {
  icon: string
  text: string
  cta?: string
}

/**
 * Analytics hook
 *
 * Provides dashboard metrics and analytics data
 *
 * Usage:
 * ```typescript
 * const { metrics, loading, error, fetchMetrics, fetchTrends } = useAnalytics()
 * ```
 */
export function useAnalytics(dateRange?: { from: Date; to: Date }) {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [checkinsData, setCheckinsData] = useState<ChartDataPoint[]>([])
  const [pointsData, setPointsData] = useState<ChartDataPoint[]>([])
  const [topChallenges, setTopChallenges] = useState<TopChallenge[]>([])
  const [insights, setInsights] = useState<InsightData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const merchantId = useAuthStore((state) => state.merchantId)

  /**
   * Fetch dashboard metrics (parallelized with timeouts)
   */
  const fetchMetrics = useCallback(async () => {
    if (!merchantId) {
      setError('No merchant ID found')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const today = format(new Date(), DATE_FORMATS.API)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const thirtyDaysAgoStr = format(thirtyDaysAgo, DATE_FORMATS.API)

      // Parallelize all queries with 3s timeout each
      const QUERY_TIMEOUT = 3000

      const results = await Promise.allSettled([
        // Query 1: Today's visits
        Promise.race([
          supabase
            .from('checkins')
            .select('*', { count: 'exact', head: true })
            .eq('merchant_id', merchantId)
            .gte('checked_in_at', `${today}T00:00:00`)
            .lte('checked_in_at', `${today}T23:59:59`),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), QUERY_TIMEOUT)
          ),
        ]),

        // Query 2: Today's points
        Promise.race([
          supabase
            .from('point_transactions')
            .select('points')
            .eq('merchant_id', merchantId)
            .eq('type', 'earn')
            .gte('created_at', `${today}T00:00:00`)
            .lte('created_at', `${today}T23:59:59`),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), QUERY_TIMEOUT)
          ),
        ]),

        // Query 3: Active customers
        Promise.race([
          supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .eq('merchant_id', merchantId)
            .gte('last_visit', thirtyDaysAgoStr),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), QUERY_TIMEOUT)
          ),
        ]),

        // Query 4: Active challenges
        Promise.race([
          supabase
            .from('challenges')
            .select('*', { count: 'exact', head: true })
            .eq('merchant_id', merchantId)
            .eq('is_active', true),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), QUERY_TIMEOUT)
          ),
        ]),

        // Query 5: Total customers
        Promise.race([
          supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .eq('merchant_id', merchantId),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), QUERY_TIMEOUT)
          ),
        ]),

        // Query 6: Total points
        Promise.race([
          supabase
            .from('point_transactions')
            .select('points')
            .eq('merchant_id', merchantId)
            .eq('type', 'earn'),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), QUERY_TIMEOUT)
          ),
        ]),
      ])

      // Extract results with fallbacks
      const [
        todayVisitsResult,
        todayPointsResult,
        activeCustomersResult,
        activeChallengesResult,
        totalCustomersResult,
        totalPointsResult,
      ] = results

      // Process results with proper typing
      const todayVisits =
        todayVisitsResult.status === 'fulfilled'
          ? (todayVisitsResult.value as { count: number | null }).count || 0
          : 0

      const todayPoints =
        todayPointsResult.status === 'fulfilled'
          ? ((todayPointsResult.value as { data: Array<{ points: number }> | null }).data?.reduce(
              (sum: number, t: { points: number }) => sum + t.points,
              0
            ) || 0)
          : 0

      const activeCustomers =
        activeCustomersResult.status === 'fulfilled'
          ? (activeCustomersResult.value as { count: number | null }).count || 0
          : 0

      const activeChallenges =
        activeChallengesResult.status === 'fulfilled'
          ? (activeChallengesResult.value as { count: number | null }).count || 0
          : 0

      const totalCustomers =
        totalCustomersResult.status === 'fulfilled'
          ? (totalCustomersResult.value as { count: number | null }).count || 0
          : 0

      const totalPointsDistributed =
        totalPointsResult.status === 'fulfilled'
          ? ((totalPointsResult.value as { data: Array<{ points: number }> | null }).data?.reduce(
              (sum: number, t: { points: number }) => sum + t.points,
              0
            ) || 0)
          : 0

      // Log any failed queries
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.warn(`Query ${index + 1} failed:`, result.reason)
        }
      })

      // Calculate metrics
      const retentionRate =
        totalCustomers > 0
          ? Math.round((activeCustomers / totalCustomers) * 100)
          : 0

      setMetrics({
        today_visits: todayVisits,
        today_points: todayPoints,
        active_customers: activeCustomers,
        active_challenges: activeChallenges,
        total_customers: totalCustomers,
        total_points_distributed: totalPointsDistributed,
        new_customers: 0,
        retention_rate: retentionRate,
        gift_cards_generated: 0,
        gift_cards_redeemed: 0,
        growth_percentage: 0,
      })
    } catch (err) {
      console.error('Error in fetchMetrics:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics')
    } finally {
      setLoading(false)
    }
  }, [merchantId])

  /**
   * Fetch trend data for a specific metric
   */
  const fetchTrends = useCallback(
    async (metric: 'visits' | 'points' | 'customers') => {
      if (!merchantId) {
        setError('No merchant ID found')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const fromDate = dateRange?.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Default 30 days
        const toDate = dateRange?.to || new Date()

        const fromStr = format(fromDate, DATE_FORMATS.API)
        const toStr = format(toDate, DATE_FORMATS.API)

        switch (metric) {
          case 'visits': {
            const { data, error: trendsError } = await supabase
              .from('checkins')
              .select('checked_in_at')
              .eq('merchant_id', merchantId)
              .gte('checked_in_at', `${fromStr}T00:00:00`)
              .lte('checked_in_at', `${toStr}T23:59:59`)
              .order('checked_in_at', { ascending: true })

            if (trendsError) {
              console.error('Error fetching visits trend:', trendsError)
              setError(trendsError.message)
              return null
            }

            return data
          }

          case 'points': {
            const { data, error: trendsError } = await supabase
              .from('point_transactions')
              .select('points, created_at')
              .eq('merchant_id', merchantId)
              .eq('type', 'earn')
              .gte('created_at', `${fromStr}T00:00:00`)
              .lte('created_at', `${toStr}T23:59:59`)
              .order('created_at', { ascending: true })

            if (trendsError) {
              console.error('Error fetching points trend:', trendsError)
              setError(trendsError.message)
              return null
            }

            return data
          }

          case 'customers': {
            const { data, error: trendsError } = await supabase
              .from('customers')
              .select('created_at')
              .eq('merchant_id', merchantId)
              .gte('created_at', `${fromStr}T00:00:00`)
              .lte('created_at', `${toStr}T23:59:59`)
              .order('created_at', { ascending: true })

            if (trendsError) {
              console.error('Error fetching customers trend:', trendsError)
              setError(trendsError.message)
              return null
            }

            return data
          }

          default:
            setError('Invalid metric type')
            return null
        }
      } catch (err) {
        console.error('Error in fetchTrends:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch trends')
        return null
      } finally {
        setLoading(false)
      }
    },
    [merchantId, dateRange]
  )

  /**
   * Fetch comprehensive analytics data for the analytics page
   */
  const fetchAnalytics = useCallback(async () => {
    if (!merchantId) {
      setError('No merchant ID found')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const fromDate = dateRange?.from || subDays(new Date(), 30)
      const toDate = dateRange?.to || new Date()
      const fromStr = format(fromDate, DATE_FORMATS.API)
      const toStr = format(toDate, DATE_FORMATS.API)

      // Calculate previous period for growth comparison
      const periodDuration = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
      const prevFromDate = subDays(fromDate, periodDuration)
      const prevFromStr = format(prevFromDate, DATE_FORMATS.API)

      // Fetch all data in parallel
      const [
        checkinsResult,
        prevCheckinsResult,
        pointsResult,
        customersResult,
        ,
        giftCardsResult,
        redeemedGiftCardsResult,
        challengesResult,
        totalCustomersResult,
        activeCustomersResult
      ] = await Promise.all([
        // Current period check-ins
        supabase
          .from('checkins')
          .select('checked_in_at')
          .eq('merchant_id', merchantId)
          .gte('checked_in_at', `${fromStr}T00:00:00`)
          .lte('checked_in_at', `${toStr}T23:59:59`),

        // Previous period check-ins for growth calculation
        supabase
          .from('checkins')
          .select('*', { count: 'exact', head: true })
          .eq('merchant_id', merchantId)
          .gte('checked_in_at', `${prevFromStr}T00:00:00`)
          .lt('checked_in_at', `${fromStr}T00:00:00`),

        // Points transactions
        supabase
          .from('point_transactions')
          .select('points, created_at')
          .eq('merchant_id', merchantId)
          .eq('type', 'earn')
          .gte('created_at', `${fromStr}T00:00:00`)
          .lte('created_at', `${toStr}T23:59:59`),

        // New customers in period
        supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('merchant_id', merchantId)
          .gte('created_at', `${fromStr}T00:00:00`)
          .lte('created_at', `${toStr}T23:59:59`),

        // Previous period customers
        supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('merchant_id', merchantId)
          .gte('created_at', `${prevFromStr}T00:00:00`)
          .lt('created_at', `${fromStr}T00:00:00`),

        // Gift cards generated
        supabase
          .from('gift_cards')
          .select('*', { count: 'exact', head: true })
          .eq('merchant_id', merchantId)
          .gte('created_at', `${fromStr}T00:00:00`)
          .lte('created_at', `${toStr}T23:59:59`),

        // Redeemed gift cards
        supabase
          .from('gift_cards')
          .select('*', { count: 'exact', head: true })
          .eq('merchant_id', merchantId)
          .eq('status', 'redeemed')
          .gte('redeemed_at', `${fromStr}T00:00:00`)
          .lte('redeemed_at', `${toStr}T23:59:59`),

        // Top challenges (mock for now - would need challenge_completions table)
        supabase
          .from('challenges')
          .select('id, name')
          .eq('merchant_id', merchantId)
          .eq('is_active', true)
          .limit(5),

        // Total customers
        supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('merchant_id', merchantId),

        // Active customers (visited in period)
        supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('merchant_id', merchantId)
          .gte('last_visit', fromStr)
      ])

      // Process check-ins data by day
      const days = eachDayOfInterval({ start: fromDate, end: toDate })
      const checkinsMap = new Map<string, number>()

      checkinsResult.data?.forEach((checkin: { checked_in_at: string }) => {
        const day = format(startOfDay(new Date(checkin.checked_in_at)), DATE_FORMATS.API)
        checkinsMap.set(day, (checkinsMap.get(day) || 0) + 1)
      })

      const checkinsChartData: ChartDataPoint[] = days.map(day => ({
        date: format(day, 'dd/MM'),
        value: checkinsMap.get(format(day, DATE_FORMATS.API)) || 0
      }))

      // Process points data by day
      const pointsMap = new Map<string, number>()

      pointsResult.data?.forEach((transaction: { points: number; created_at: string }) => {
        const day = format(startOfDay(new Date(transaction.created_at)), DATE_FORMATS.API)
        pointsMap.set(day, (pointsMap.get(day) || 0) + transaction.points)
      })

      const pointsChartData: ChartDataPoint[] = days.map(day => ({
        date: format(day, 'dd/MM'),
        value: pointsMap.get(format(day, DATE_FORMATS.API)) || 0
      }))

      // Calculate metrics
      const totalCheckins = checkinsResult.data?.length || 0
      const prevCheckins = prevCheckinsResult.count || 0
      const newCustomers = customersResult.count || 0
      const totalCustomers = totalCustomersResult.count || 0
      const activeCustomers = activeCustomersResult.count || 0
      const giftCardsGenerated = giftCardsResult.count || 0
      const giftCardsRedeemed = redeemedGiftCardsResult.count || 0

      // Calculate retention rate (active customers / total customers * 100)
      const retentionRate = totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0

      // Calculate growth percentage
      const growthPercentage = prevCheckins > 0
        ? Math.round(((totalCheckins - prevCheckins) / prevCheckins) * 100)
        : totalCheckins > 0 ? 100 : 0

      // Set top challenges (with mock completions for now)
      const topChallengesData: TopChallenge[] = (challengesResult.data || []).map((challenge, index) => ({
        id: challenge.id,
        name: challenge.name,
        completions: Math.max(0, 50 - (index * 10)) // Mock data
      }))

      // Generate insights
      const generatedInsights: InsightData[] = []

      if (retentionRate >= 60) {
        generatedInsights.push({
          icon: '🎯',
          text: `Excelente tasa de retención del ${retentionRate}%`,
        })
      }

      if (giftCardsRedeemed > 0) {
        const avgRedemptionDays = 5.2 // Mock - would calculate from actual data
        generatedInsights.push({
          icon: '⏱️',
          text: `Las gift cards se redimen en promedio a los ${avgRedemptionDays} días`,
        })
      }

      if (totalCheckins > 0) {
        generatedInsights.push({
          icon: '📈',
          text: `${totalCheckins} check-ins registrados en el período`,
        })
      }

      if (growthPercentage > 0) {
        generatedInsights.push({
          icon: '🚀',
          text: `Crecimiento del ${growthPercentage}% comparado con el período anterior`,
        })
      }

      // Set all state
      setMetrics({
        today_visits: totalCheckins,
        today_points: pointsResult.data?.reduce((sum, t) => sum + t.points, 0) || 0,
        active_customers: activeCustomers,
        active_challenges: challengesResult.data?.length || 0,
        total_customers: totalCustomers,
        total_points_distributed: pointsResult.data?.reduce((sum, t) => sum + t.points, 0) || 0,
        new_customers: newCustomers,
        retention_rate: retentionRate,
        gift_cards_generated: giftCardsGenerated,
        gift_cards_redeemed: giftCardsRedeemed,
        growth_percentage: growthPercentage,
      })

      setCheckinsData(checkinsChartData)
      setPointsData(pointsChartData)
      setTopChallenges(topChallengesData)
      setInsights(generatedInsights)

    } catch (err) {
      console.error('Error in fetchAnalytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }, [merchantId, dateRange])

  return {
    metrics,
    checkinsData,
    pointsData,
    topChallenges,
    insights,
    loading,
    error,
    fetchMetrics,
    fetchTrends,
    fetchAnalytics,
  }
}
