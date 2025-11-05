import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAuthContext, checkPermission } from '@/lib/api/auth';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api/response';
import type { Database } from '@meit/supabase/types';

// GET /api/points/transactions - Get points transaction history
export async function GET(request: NextRequest) {
  try {
    const { user, merchant_id } = await getAuthContext(request);

    if (!await checkPermission(user.role, 'points', 'read')) {
      return forbiddenResponse();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const customer_id = searchParams.get('customer_id');
    const transaction_type = searchParams.get('type');
    const offset = (page - 1) * limit;

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

    let query = supabase
      .from('point_transactions')
      .select(`
        *,
        customer:customers!point_transactions_customer_id_fkey(id, phone, name)
      `, { count: 'exact' })
      .eq('merchant_id', merchant_id)
      .order('created_at', { ascending: false });

    if (customer_id) {
      query = query.eq('customer_id', customer_id);
    }

    if (transaction_type) {
      query = query.eq('transaction_type', transaction_type);
    }

    const { data: transactions, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return successResponse({
      transactions: transactions || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });

  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('[API] GET /api/points/transactions error:', error);
    return errorResponse('Failed to fetch transactions', 500);
  }
}
