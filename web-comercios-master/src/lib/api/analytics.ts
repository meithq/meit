import { supabase } from '@/lib/supabase';
import { format, subDays, eachDayOfInterval, startOfDay } from 'date-fns';
import { DATE_FORMATS } from '@/lib/constants';
import type { DashboardMetrics } from '@/types/database';

// Extended metrics for analytics page
export interface AnalyticsMetrics extends DashboardMetrics {
  new_customers: number;
  retention_rate: number;
  gift_cards_generated: number;
  gift_cards_redeemed: number;
  growth_percentage: number;
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface TopChallenge {
  id: string;
  name: string;
  completions: number;
}

export interface InsightData {
  icon: string;
  text: string;
  cta?: string;
}

export interface FullAnalyticsData {
  metrics: AnalyticsMetrics;
  checkinsData: ChartDataPoint[];
  pointsData: ChartDataPoint[];
  topChallenges: TopChallenge[];
  insights: InsightData[];
}

/**
 * Fetch dashboard metrics
 * Exported for reuse in hooks and prefetching
 */
export async function fetchDashboardMetrics(merchantId: string): Promise<AnalyticsMetrics> {
  const today = format(new Date(), DATE_FORMATS.API);
  const thirtyDaysAgo = format(subDays(new Date(), 30), DATE_FORMATS.API);

  // Parallelize all queries with Promise.allSettled for graceful failures
  const results = await Promise.allSettled([
    // Today's visits
    supabase
      .from('checkins')
      .select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchantId)
      .gte('checked_in_at', `${today}T00:00:00`)
      .lte('checked_in_at', `${today}T23:59:59`),

    // Today's points
    supabase
      .from('point_transactions')
      .select('points')
      .eq('merchant_id', merchantId)
      .eq('type', 'earn')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`),

    // Active customers (last 30 days)
    supabase
      .from('customer_merchants')
      .select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchantId)
      .eq('is_active', true)
      .gte('last_visit', thirtyDaysAgo),

    // Active challenges
    supabase
      .from('challenges')
      .select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchantId)
      .eq('is_active', true),

    // Total customers
    supabase
      .from('customer_merchants')
      .select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchantId)
      .eq('is_active', true),
  ]);

  // Extract results with fallbacks
  const todayVisits =
    results[0].status === 'fulfilled' ? (results[0].value.count || 0) : 0;

  const todayPoints =
    results[1].status === 'fulfilled'
      ? results[1].value.data?.reduce((sum, t) => sum + t.points, 0) || 0
      : 0;

  const activeCustomers =
    results[2].status === 'fulfilled' ? (results[2].value.count || 0) : 0;

  const activeChallenges =
    results[3].status === 'fulfilled' ? (results[3].value.count || 0) : 0;

  const totalCustomers =
    results[4].status === 'fulfilled' ? (results[4].value.count || 0) : 0;

  // Calculate retention rate
  const retentionRate =
    totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0;

  return {
    today_visits: todayVisits,
    today_points: todayPoints,
    active_customers: activeCustomers,
    active_challenges: activeChallenges,
    total_customers: totalCustomers,
    total_points_distributed: todayPoints,
    new_customers: 0,
    retention_rate: retentionRate,
    gift_cards_generated: 0,
    gift_cards_redeemed: 0,
    growth_percentage: 0,
  };
}

/**
 * Fetch full analytics data with date range
 * Exported for reuse in hooks and prefetching
 */
export async function fetchFullAnalytics(
  merchantId: string,
  fromDate: Date,
  toDate: Date
): Promise<FullAnalyticsData> {
  const fromStr = format(fromDate, DATE_FORMATS.API);
  const toStr = format(toDate, DATE_FORMATS.API);

  // Calculate previous period for growth comparison
  const periodDuration = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
  const prevFromDate = subDays(fromDate, periodDuration);
  const prevFromStr = format(prevFromDate, DATE_FORMATS.API);

  // Fetch all data in parallel
  const [
    checkinsResult,
    prevCheckinsResult,
    pointsResult,
    customersResult,
    challengesResult,
    totalCustomersResult,
    activeCustomersResult,
  ] = await Promise.all([
    // Current period check-ins
    supabase
      .from('checkins')
      .select('checked_in_at')
      .eq('merchant_id', merchantId)
      .gte('checked_in_at', `${fromStr}T00:00:00`)
      .lte('checked_in_at', `${toStr}T23:59:59`),

    // Previous period check-ins for growth
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
      .from('customer_merchants')
      .select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchantId)
      .gte('first_visit', `${fromStr}T00:00:00`)
      .lte('first_visit', `${toStr}T23:59:59`),

    // Top challenges
    supabase
      .from('challenges')
      .select('id, name')
      .eq('merchant_id', merchantId)
      .eq('is_active', true)
      .limit(5),

    // Total customers
    supabase
      .from('customer_merchants')
      .select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchantId)
      .eq('is_active', true),

    // Active customers (visited in period)
    supabase
      .from('customer_merchants')
      .select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchantId)
      .eq('is_active', true)
      .gte('last_visit', fromStr),
  ]);

  // Process check-ins data by day
  const days = eachDayOfInterval({ start: fromDate, end: toDate });
  const checkinsMap = new Map<string, number>();

  checkinsResult.data?.forEach((checkin) => {
    const day = format(startOfDay(new Date(checkin.checked_in_at)), DATE_FORMATS.API);
    checkinsMap.set(day, (checkinsMap.get(day) || 0) + 1);
  });

  const checkinsChartData: ChartDataPoint[] = days.map((day) => ({
    date: format(day, 'dd/MM'),
    value: checkinsMap.get(format(day, DATE_FORMATS.API)) || 0,
  }));

  // Process points data by day
  const pointsMap = new Map<string, number>();

  pointsResult.data?.forEach((transaction) => {
    const day = format(startOfDay(new Date(transaction.created_at)), DATE_FORMATS.API);
    pointsMap.set(day, (pointsMap.get(day) || 0) + transaction.points);
  });

  const pointsChartData: ChartDataPoint[] = days.map((day) => ({
    date: format(day, 'dd/MM'),
    value: pointsMap.get(format(day, DATE_FORMATS.API)) || 0,
  }));

  // Calculate metrics
  const totalCheckins = checkinsResult.data?.length || 0;
  const prevCheckins = prevCheckinsResult.count || 0;
  const newCustomers = customersResult.count || 0;
  const totalCustomers = totalCustomersResult.count || 0;
  const activeCustomers = activeCustomersResult.count || 0;

  const retentionRate =
    totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0;

  const growthPercentage =
    prevCheckins > 0
      ? Math.round(((totalCheckins - prevCheckins) / prevCheckins) * 100)
      : totalCheckins > 0
        ? 100
        : 0;

  // Set top challenges (with mock completions)
  const topChallengesData: TopChallenge[] = (challengesResult.data || []).map(
    (challenge, index) => ({
      id: challenge.id,
      name: challenge.name,
      completions: Math.max(0, 50 - index * 10), // Mock data
    })
  );

  // Generate insights
  const generatedInsights: InsightData[] = [];

  if (retentionRate >= 60) {
    generatedInsights.push({
      icon: '🎯',
      text: `Excelente tasa de retención del ${retentionRate}%`,
    });
  }

  if (totalCheckins > 0) {
    generatedInsights.push({
      icon: '📈',
      text: `${totalCheckins} check-ins registrados en el período`,
    });
  }

  if (growthPercentage > 0) {
    generatedInsights.push({
      icon: '🚀',
      text: `Crecimiento del ${growthPercentage}% comparado con el período anterior`,
    });
  }

  if (newCustomers > 0) {
    generatedInsights.push({
      icon: '🆕',
      text: `${newCustomers} nuevos clientes en este período`,
    });
  }

  const metrics: AnalyticsMetrics = {
    today_visits: totalCheckins,
    today_points: pointsResult.data?.reduce((sum, t) => sum + t.points, 0) || 0,
    active_customers: activeCustomers,
    active_challenges: challengesResult.data?.length || 0,
    total_customers: totalCustomers,
    total_points_distributed: pointsResult.data?.reduce((sum, t) => sum + t.points, 0) || 0,
    new_customers: newCustomers,
    retention_rate: retentionRate,
    gift_cards_generated: 0,
    gift_cards_redeemed: 0,
    growth_percentage: growthPercentage,
  };

  return {
    metrics,
    checkinsData: checkinsChartData,
    pointsData: pointsChartData,
    topChallenges: topChallengesData,
    insights: generatedInsights,
  };
}
