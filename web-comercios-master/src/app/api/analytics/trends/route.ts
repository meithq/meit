import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAuthContext, checkPermission } from '@/lib/api/auth';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api/response';
import type { Database } from '@meit/supabase/types';

// GET /api/analytics/trends - Get chart data for trends
export async function GET(request: NextRequest) {
  try {
    const { user, merchant_id } = await getAuthContext(request);

    if (!await checkPermission(user.role, 'analytics', 'read')) {
      return forbiddenResponse();
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const periodDays = parseInt(period);
    const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

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

    // Get daily check-ins trend
    const { data: checkins } = await supabase
      .from('checkins')
      .select('created_at')
      .eq('merchant_id', merchant_id)
      .gte('created_at', periodStart.toISOString())
      .order('created_at', { ascending: true });

    // Group by day
    const checkinsByDay: Record<string, number> = {};
    checkins?.forEach(checkin => {
      if (checkin.created_at) {
        const day = new Date(checkin.created_at).toISOString().split('T')[0];
        checkinsByDay[day] = (checkinsByDay[day] || 0) + 1;
      }
    });

    // Get daily points earned trend
    const { data: pointsEarned } = await supabase
      .from('point_transactions')
      .select('created_at, points')
      .eq('merchant_id', merchant_id)
      .eq('transaction_type', 'earn')
      .gte('created_at', periodStart.toISOString())
      .order('created_at', { ascending: true });

    const pointsByDay: Record<string, number> = {};
    pointsEarned?.forEach(tx => {
      if (tx.created_at) {
        const day = new Date(tx.created_at).toISOString().split('T')[0];
        pointsByDay[day] = (pointsByDay[day] || 0) + (tx.points || 0);
      }
    });

    // Get daily new customers trend
    const { data: newCustomers } = await supabase
      .from('customer_merchants')
      .select('created_at')
      .eq('merchant_id', merchant_id)
      .gte('created_at', periodStart.toISOString())
      .order('created_at', { ascending: true });

    const customersByDay: Record<string, number> = {};
    newCustomers?.forEach(cm => {
      if (cm.created_at) {
        const day = new Date(cm.created_at).toISOString().split('T')[0];
        customersByDay[day] = (customersByDay[day] || 0) + 1;
      }
    });

    // Build time series data
    const trends = [];
    for (let i = 0; i < periodDays; i++) {
      const date = new Date(periodStart);
      date.setDate(date.getDate() + i);
      const day = date.toISOString().split('T')[0];

      trends.push({
        date: day,
        checkins: checkinsByDay[day] || 0,
        points_earned: pointsByDay[day] || 0,
        new_customers: customersByDay[day] || 0,
      });
    }

    return successResponse({
      period_days: periodDays,
      trends,
    });

  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('[API] GET /api/analytics/trends error:', error);
    return errorResponse('Failed to fetch trends data', 500);
  }
}
