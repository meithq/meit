import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAuthContext, checkPermission } from '@/lib/api/auth';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse, validationErrorResponse } from '@/lib/api/response';
import { validateRequest, ValidationError } from '@/lib/api/validation';
import { updateCustomerSchema } from '@meit/shared/validators/api';
import type { Database } from '@meit/supabase/types';

// GET /api/customers/[id] - Get customer details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { data: customer, error } = await supabase
      .from('customer_merchants')
      .select(`
        *,
        customer:customers!customer_merchants_customer_id_fkey(*)
      `)
      .eq('customer_id', (await params).id)
      .eq('merchant_id', merchant_id)
      .single();

    if (error || !customer) {
      return notFoundResponse('Customer not found');
    }

    return successResponse({ customer });

  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('[API] GET /api/customers/[id] error:', error);
    return errorResponse('Failed to fetch customer', 500);
  }
}

// PUT /api/customers/[id] - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, merchant_id } = await getAuthContext(request);

    if (!await checkPermission(user.role, 'customers', 'write')) {
      return forbiddenResponse();
    }

    const updates = await validateRequest(request, updateCustomerSchema);

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
      return notFoundResponse('Customer not found');
    }

    // Update customer
    const { data: updatedCustomer, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', (await params).id)
      .select()
      .single();

    if (error) throw error;

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      merchant_id,
      action: 'update',
      entity_type: 'customer',
      entity_id: (await params).id,
      new_data: updates,
    });

    return successResponse({ customer: updatedCustomer });

  } catch (error) {
    if (error instanceof ValidationError) {
      return validationErrorResponse(error.errors);
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('[API] PUT /api/customers/[id] error:', error);
    return errorResponse('Failed to update customer', 500);
  }
}
