import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAuthContext, checkPermission } from '@/lib/api/auth';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api/response';
import type { Database } from '@meit/supabase/types';

// GET /api/gift-cards - List gift cards
export async function GET(request: NextRequest) {
  try {
    const { user, merchant_id } = await getAuthContext(request);

    if (!await checkPermission(user.role, 'gift_cards', 'read')) {
      return forbiddenResponse();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const customer_id = searchParams.get('customer_id');
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
      .from('gift_cards')
      .select(`
        *,
        customer:customers!gift_cards_customer_id_fkey(id, phone, name)
      `, { count: 'exact' })
      .eq('merchant_id', merchant_id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (customer_id) {
      query = query.eq('customer_id', customer_id);
    }

    const { data: giftCards, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return successResponse({
      gift_cards: giftCards || [],
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
    console.error('[API] GET /api/gift-cards error:', error);
    return errorResponse('Failed to fetch gift cards', 500);
  }
}
