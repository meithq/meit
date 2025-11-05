import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAuthContext, checkPermission } from '@/lib/api/auth';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api/response';
import type { Database } from '@meit/supabase/types';

// GET /api/analytics/insights - Get automated insights
export async function GET(request: NextRequest) {
  try {
    const { user, merchant_id } = await getAuthContext(request);

    if (!await checkPermission(user.role, 'analytics', 'read')) {
      return forbiddenResponse();
    }

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

    const insights: Array<{
      type: string;
      severity: 'info' | 'warning' | 'success';
      title: string;
      description: string;
    }> = [];

    // Top customers by points
    const { data: topCustomers } = await supabase
      .from('customer_merchants')
      .select(`
        customer_id,
        points_balance,
        customer:customers!customer_merchants_customer_id_fkey(name, phone)
      `)
      .eq('merchant_id', merchant_id)
      .order('points_balance', { ascending: false })
      .limit(5);

    if (topCustomers && topCustomers.length > 0) {
      insights.push({
        type: 'top_customers',
        severity: 'success',
        title: 'Top Loyalty Customers',
        description: `Your top customer has ${topCustomers[0].points_balance} points. Reward loyal customers with special offers!`,
      });
    }

    // Dormant customers (no visit in 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: dormantCustomers } = await supabase
      .from('customer_merchants')
      .select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchant_id)
      .lt('last_visit_at', thirtyDaysAgo);

    if (dormantCustomers && dormantCustomers > 0) {
      insights.push({
        type: 'dormant_customers',
        severity: 'warning',
        title: 'Re-engage Dormant Customers',
        description: `${dormantCustomers} customers haven't visited in 30+ days. Consider a re-engagement campaign!`,
      });
    }

    // Customers near gift card threshold
    // TODO: Get threshold from merchant settings when implemented
    const threshold = 100; // Default gift card threshold
    const nearThreshold = threshold * 0.8; // 80% of threshold

    const { count: nearThresholdCustomers } = await supabase
      .from('customer_merchants')
      .select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchant_id)
      .gte('points_balance', nearThreshold)
      .lt('points_balance', threshold);

    if (nearThresholdCustomers && nearThresholdCustomers > 0) {
      insights.push({
        type: 'near_reward',
        severity: 'info',
        title: 'Customers Close to Rewards',
        description: `${nearThresholdCustomers} customers are close to earning a gift card. Encourage one more visit!`,
      });
    }

    // Active challenges performance
    const { data: activeChallenges } = await supabase
      .from('challenges')
      .select('id, name')
      .eq('merchant_id', merchant_id)
      .eq('is_active', true);

    if (activeChallenges && activeChallenges.length > 0) {
      insights.push({
        type: 'active_challenges',
        severity: 'info',
        title: 'Active Challenges',
        description: `You have ${activeChallenges.length} active challenge(s) running. Monitor their performance to optimize engagement.`,
      });
    }

    // Gift card redemption rate
    const { count: totalGiftCards } = await supabase
      .from('gift_cards')
      .select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchant_id);

    const { count: redeemedGiftCards } = await supabase
      .from('gift_cards')
      .select('*', { count: 'exact', head: true })
      .eq('merchant_id', merchant_id)
      .eq('status', 'redeemed');

    if (totalGiftCards && totalGiftCards > 0) {
      const redemptionRate = ((redeemedGiftCards || 0) / totalGiftCards * 100).toFixed(1);
      insights.push({
        type: 'redemption_rate',
        severity: parseFloat(redemptionRate) < 50 ? 'warning' : 'success',
        title: 'Gift Card Redemption Rate',
        description: `${redemptionRate}% of gift cards have been redeemed. ${parseFloat(redemptionRate) < 50 ? 'Consider reminding customers about their rewards.' : 'Great redemption rate!'}`,
      });
    }

    return successResponse({ insights });

  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('[API] GET /api/analytics/insights error:', error);
    return errorResponse('Failed to fetch insights', 500);
  }
}
