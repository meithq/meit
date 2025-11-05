import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAuthContext, checkPermission } from '@/lib/api/auth';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api/response';
import type { Database } from '@meit/supabase/types';

// GET /api/analytics/dashboard - Get main dashboard metrics
export async function GET(request: NextRequest) {
  try {
    const { user, merchant_id } = await getAuthContext(request);

    if (!await checkPermission(user.role, 'analytics', 'read')) {
      return forbiddenResponse();
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const periodDays = parseInt(period);
    const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();

    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Total customers
    const { count: totalCustomers } = await supabase
      .from('customer_merchants')
      .select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchant_id);

    // Active customers (visited in period)
    const { count: activeCustomers } = await supabase
      .from('customer_merchants')
      .select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchant_id)
      .gte('last_visit_at', periodStart);

    // Total points earned in period
    const { data: earnedPoints } = await supabase
      .from('point_transactions')
      .select('points')
      .eq('merchant_id', merchant_id)
      .eq('transaction_type', 'earn')
      .gte('created_at', periodStart);

    const totalPointsEarned = earnedPoints?.reduce((sum, tx) => sum + (tx.points || 0), 0) || 0;

    // Total points redeemed in period
    const { data: redeemedPoints } = await supabase
      .from('point_transactions')
      .select('points')
      .eq('merchant_id', merchant_id)
      .eq('transaction_type', 'redeem')
      .gte('created_at', periodStart);

    const totalPointsRedeemed = redeemedPoints?.reduce((sum, tx) => sum + (tx.points || 0), 0) || 0;

    // Gift cards generated in period
    const { count: giftCardsGenerated } = await supabase
      .from('gift_cards')
      .select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchant_id)
      .gte('created_at', periodStart);

    // Gift cards redeemed in period
    const { count: giftCardsRedeemed } = await supabase
      .from('gift_cards')
      .select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchant_id)
      .eq('status', 'redeemed')
      .gte('redeemed_at', periodStart);

    // Total check-ins in period
    const { count: totalCheckins } = await supabase
      .from('checkins')
      .select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchant_id)
      .gte('created_at', periodStart);

    // Average points per customer
    const avgPointsPerCustomer = totalCustomers ? Math.round(totalPointsEarned / totalCustomers) : 0;

    // Engagement rate
    const engagementRate = totalCustomers ? ((activeCustomers || 0) / totalCustomers * 100).toFixed(1) : '0.0';

    return successResponse({
      period_days: periodDays,
      metrics: {
        total_customers: totalCustomers || 0,
        active_customers: activeCustomers || 0,
        engagement_rate: parseFloat(engagementRate),
        total_points_earned: totalPointsEarned,
        total_points_redeemed: totalPointsRedeemed,
        gift_cards_generated: giftCardsGenerated || 0,
        gift_cards_redeemed: giftCardsRedeemed || 0,
        total_checkins: totalCheckins || 0,
        avg_points_per_customer: avgPointsPerCustomer,
      },
    });

  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('[API] GET /api/analytics/dashboard error:', error);
    return errorResponse('Failed to fetch dashboard metrics', 500);
  }
}
