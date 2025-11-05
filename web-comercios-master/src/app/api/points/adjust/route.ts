import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAuthContext, checkPermission } from '@/lib/api/auth';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, validationErrorResponse } from '@/lib/api/response';
import { validateRequest, ValidationError } from '@/lib/api/validation';
import { adjustPointsSchema } from '@meit/shared/validators/api';
import type { Database } from '@meit/supabase/types';

// POST /api/points/adjust - Manual points adjustment (admin only)
export async function POST(request: NextRequest) {
  try {
    const { user, merchant_id } = await getAuthContext(request);

    // Only admin can manually adjust points
    if (user.role !== 'admin') {
      return forbiddenResponse('Only administrators can manually adjust points');
    }

    const { customer_id, points, reason } = await validateRequest(
      request,
      adjustPointsSchema
    );

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

    // Get customer-merchant relationship
    const { data: customerMerchant, error: cmError } = await supabase
      .from('customer_merchants')
      .select('*')
      .eq('customer_id', customer_id)
      .eq('merchant_id', merchant_id)
      .single();

    if (cmError) {
      return errorResponse('Customer not found', 404);
    }

    // Create adjustment transaction
    const transactionType = points > 0 ? 'adjustment_add' : 'adjustment_subtract';
    const { error: txError } = await supabase
      .from('point_transactions')
      .insert({
        customer_id,
        merchant_id,
        transaction_type: transactionType,
        points: Math.abs(points),
        reference_type: 'manual_adjustment',
        description: reason,
        created_by: user.id,
      });

    if (txError) throw txError;

    // Update customer points balance
    const newBalance = (customerMerchant.points_balance || 0) + points;

    // Ensure balance doesn't go negative
    if (newBalance < 0) {
      return errorResponse('Adjustment would result in negative balance', 400);
    }

    const { data: updatedCustomerMerchant, error: updateError } = await supabase
      .from('customer_merchants')
      .update({ points_balance: newBalance })
      .eq('id', customerMerchant.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      merchant_id,
      action: 'update',
      entity_type: 'point_adjustment',
      entity_id: customer_id,
      new_data: { points, reason, new_balance: newBalance },
    });

    return successResponse({
      success: true,
      adjustment: points,
      previous_balance: customerMerchant.points_balance || 0,
      new_balance: newBalance,
      customer_merchant: updatedCustomerMerchant,
    });

  } catch (error) {
    if (error instanceof ValidationError) {
      return validationErrorResponse(error.errors);
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('[API] POST /api/points/adjust error:', error);
    return errorResponse('Failed to adjust points', 500);
  }
}
