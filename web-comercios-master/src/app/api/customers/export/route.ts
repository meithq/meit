import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAuthContext, checkPermission } from '@/lib/api/auth';
import { errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api/response';
import type { Database } from '@meit/supabase/types';

// GET /api/customers/export - Export customers as CSV
export async function GET(request: NextRequest) {
  try {
    const { user, merchant_id } = await getAuthContext(request);

    if (!await checkPermission(user.role, 'customers', 'read')) {
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

    const { data: customers, error } = await supabase
      .from('customer_merchants')
      .select(`
        *,
        customer:customers!customer_merchants_customer_id_fkey(id, phone, name, email, opt_in_marketing, created_at)
      `)
      .eq('merchant_id', merchant_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Build CSV
    const headers = [
      'Customer ID',
      'Name',
      'Phone',
      'Email',
      'Points Balance',
      'Visit Count',
      'Last Visit',
      'Joined Date',
      'Marketing Opt-In'
    ];

    const rows = (customers || []).map(cm => [
      cm.customer?.id || '',
      cm.customer?.name || '',
      cm.customer?.phone || '',
      cm.customer?.email || '',
      cm.points_balance?.toString() || '0',
      cm.visits_count?.toString() || '0',
      cm.last_visit_at || '',
      cm.created_at || '',
      cm.customer?.opt_in_marketing ? 'Yes' : 'No'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Audit log - use merchant_id as entity_id for bulk operations
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      merchant_id,
      action: 'export',
      entity_type: 'customer',
      entity_id: merchant_id,
      new_data: { count: customers?.length || 0 },
    });

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="customers_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('[API] GET /api/customers/export error:', error);
    return errorResponse('Failed to export customers', 500);
  }
}
