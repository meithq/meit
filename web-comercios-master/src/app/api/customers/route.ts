import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAuthContext, checkPermission } from '@/lib/api/auth';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, validationErrorResponse } from '@/lib/api/response';
import { validateRequest, ValidationError } from '@/lib/api/validation';
import { createCustomerSchema } from '@meit/shared/validators/api';
import type { Database } from '@meit/supabase/types';

// GET /api/customers - List customers
export async function GET(request: NextRequest) {
  try {
    const { user, merchant_id } = await getAuthContext(request);

    if (!await checkPermission(user.role, 'customers', 'read')) {
      return forbiddenResponse();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
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
      .from('customer_merchants')
      .select(`
        *,
        customer:customers!customer_merchants_customer_id_fkey(id, phone, name, email, opt_in_marketing)
      `, { count: 'exact' })
      .eq('merchant_id', merchant_id)
      .order('last_visit_at', { ascending: false });

    if (search) {
      query = query.or(`customer.name.ilike.%${search}%,customer.phone.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return successResponse({
      customers: data || [],
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
    console.error('[API] GET /api/customers error:', error);
    return errorResponse('Failed to fetch customers', 500);
  }
}

// POST /api/customers - Create customer
export async function POST(request: NextRequest) {
  try {
    const { user, merchant_id } = await getAuthContext(request);

    if (!await checkPermission(user.role, 'customers', 'write')) {
      return forbiddenResponse();
    }

    const { phone, name, email } = await validateRequest(request, createCustomerSchema);

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

    // Check if customer exists
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', phone)
      .single();

    let customerId: string;

    if (!existingCustomer) {
      // Create new customer
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert({
          phone,
          name,
          email,
          opt_in_marketing: true,
        })
        .select()
        .single();

      if (createError) throw createError;
      customerId = newCustomer.id;
    } else {
      customerId = existingCustomer.id;
    }

    // Check if customer-merchant relationship exists
    const { data: existingRelation } = await supabase
      .from('customer_merchants')
      .select('*')
      .eq('customer_id', customerId)
      .eq('merchant_id', merchant_id)
      .single();

    if (existingRelation) {
      return errorResponse('Customer already registered with this merchant', 400);
    }

    // Create customer-merchant relationship
    const { data: relation, error: relationError } = await supabase
      .from('customer_merchants')
      .insert({
        customer_id: customerId,
        merchant_id,
        points_balance: 0,
        visits_count: 0,
      })
      .select()
      .single();

    if (relationError) throw relationError;

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      merchant_id,
      action: 'create',
      entity_type: 'customer',
      entity_id: customerId,
      new_data: { phone, name, email },
    });

    return successResponse({ customer: relation }, 201);

  } catch (error) {
    if (error instanceof ValidationError) {
      return validationErrorResponse(error.errors);
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('[API] POST /api/customers error:', error);
    return errorResponse('Failed to create customer', 500);
  }
}
