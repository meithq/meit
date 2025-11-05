import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use Node runtime for now (Supabase client has Node dependencies)
// Edge runtime requires edge-compatible Supabase client
export const runtime = 'nodejs';
export const revalidate = 60; // Cache for 60 seconds (ISR)

interface DashboardMetrics {
  today_visits: number;
  today_points: number;
  active_customers: number;
  active_challenges: number;
  total_customers: number;
  total_points_distributed: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchantId');

    if (!merchantId) {
      return NextResponse.json(
        { error: 'merchantId is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    // Parallelize all queries with 3s timeout each
    const QUERY_TIMEOUT = 3000;

    const withTimeout = <T>(promise: Promise<T>): Promise<T> =>
      Promise.race([
        promise,
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error('Query timeout')), QUERY_TIMEOUT)
        ),
      ]);

    const results = await Promise.allSettled([
      // Query 1: Today's visits
      withTimeout(
        Promise.resolve(
          supabase
            .from('checkins')
            .select('*', { count: 'exact', head: true })
            .eq('merchant_id', merchantId)
            .gte('checked_in_at', `${today}T00:00:00`)
            .lte('checked_in_at', `${today}T23:59:59`)
        )
      ),

      // Query 2: Today's points
      withTimeout(
        Promise.resolve(
          supabase
            .from('point_transactions')
            .select('points')
            .eq('merchant_id', merchantId)
            .eq('type', 'earn')
            .gte('created_at', `${today}T00:00:00`)
            .lte('created_at', `${today}T23:59:59`)
        )
      ),

      // Query 3: Active customers
      withTimeout(
        Promise.resolve(
          supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .eq('merchant_id', merchantId)
            .gte('last_visit', thirtyDaysAgoStr)
        )
      ),

      // Query 4: Active challenges
      withTimeout(
        Promise.resolve(
          supabase
            .from('challenges')
            .select('*', { count: 'exact', head: true })
            .eq('merchant_id', merchantId)
            .eq('is_active', true)
        )
      ),

      // Query 5: Total customers
      withTimeout(
        Promise.resolve(
          supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .eq('merchant_id', merchantId)
        )
      ),

      // Query 6: Total points
      withTimeout(
        Promise.resolve(
          supabase
            .from('point_transactions')
            .select('points')
            .eq('merchant_id', merchantId)
            .eq('type', 'earn')
        )
      ),
    ]);

    // Extract results with fallbacks
    const [
      todayVisitsResult,
      todayPointsResult,
      activeCustomersResult,
      activeChallengesResult,
      totalCustomersResult,
      totalPointsResult,
    ] = results;

    // Process results
    const todayVisits =
      todayVisitsResult.status === 'fulfilled'
        ? (todayVisitsResult.value.count ?? 0)
        : 0;

    const todayPoints =
      todayPointsResult.status === 'fulfilled'
        ? (todayPointsResult.value.data?.reduce(
            (sum, t) => sum + (t.points || 0),
            0
          ) ?? 0)
        : 0;

    const activeCustomers =
      activeCustomersResult.status === 'fulfilled'
        ? (activeCustomersResult.value.count ?? 0)
        : 0;

    const activeChallenges =
      activeChallengesResult.status === 'fulfilled'
        ? (activeChallengesResult.value.count ?? 0)
        : 0;

    const totalCustomers =
      totalCustomersResult.status === 'fulfilled'
        ? (totalCustomersResult.value.count ?? 0)
        : 0;

    const totalPointsDistributed =
      totalPointsResult.status === 'fulfilled'
        ? (totalPointsResult.value.data?.reduce(
            (sum, t) => sum + (t.points || 0),
            0
          ) ?? 0)
        : 0;

    // Log any failed queries
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.warn(`[API /metrics] Query ${index + 1} failed:`, result.reason);
      }
    });

    const metrics: DashboardMetrics = {
      today_visits: todayVisits,
      today_points: todayPoints,
      active_customers: activeCustomers,
      active_challenges: activeChallenges,
      total_customers: totalCustomers,
      total_points_distributed: totalPointsDistributed,
    };

    return NextResponse.json(
      { success: true, data: metrics },
      {
        headers: {
          'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('[API /metrics] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
