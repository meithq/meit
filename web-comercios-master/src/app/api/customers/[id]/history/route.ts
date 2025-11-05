import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAuthContext, checkPermission } from '@/lib/api/auth';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api/response';
import type { Database } from '@meit/supabase/types';

// GET /api/customers/[id]/history - Get customer transaction history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, merchant_id } = await getAuthContext(request);

    if (!await checkPermission(user.role, 'customers', 'read')) {
      return forbiddenResponse();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
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

    // Verify customer belongs to this merchant
    const { data: customerMerchant } = await supabase
      .from('customer_merchants')
      .select('customer_id')
      .eq('customer_id', (await params).id)
      .eq('merchant_id', merchant_id)
      .single();

    if (!customerMerchant) {
      return errorResponse('Customer not found', 404);
    }

    // Get transaction history
    const { data: transactions, error, count } = await supabase
      .from('point_transactions')
      .select('*', { count: 'exact' })
      .eq('customer_id', (await params).id)
      .eq('merchant_id', merchant_id)
      .order('created_at', { ascending: false })
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
    console.error('[API] GET /api/customers/[id]/history error:', error);
    return errorResponse('Failed to fetch transaction history', 500);
  }
}
