import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAuthContext, checkPermission } from '@/lib/api/auth';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, validationErrorResponse } from '@/lib/api/response';
import { validateRequest, ValidationError } from '@/lib/api/validation';
import { checkinSchema } from '@meit/shared/validators/api';
import type { Database } from '@meit/supabase/types';

// POST /api/checkin - Process QR check-in
export async function POST(request: NextRequest) {
  try {
    const { user, merchant_id } = await getAuthContext(request);

    if (!await checkPermission(user.role, 'checkins', 'write')) {
      return forbiddenResponse();
    }

    const { phone, qr_code, branch_id } = await validateRequest(request, checkinSchema);

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

    // Validate QR code belongs to this merchant
    const { data: branch } = await supabase
      .from('branches')
      .select('id, qr_code')
      .eq('merchant_id', merchant_id)
      .eq('qr_code', qr_code)
      .single();

    if (!branch) {
      return errorResponse('Invalid QR code', 400);
    }

    // Find or create customer
    let { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', phone)
      .single();

    if (!customer) {
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert({
          phone,
          opt_in_marketing: true,
        })
        .select()
        .single();

      if (createError) throw createError;
      customer = newCustomer;
    }

    // Find or create customer-merchant relationship
    let { data: customerMerchant } = await supabase
      .from('customer_merchants')
      .select('*')
      .eq('customer_id', customer.id)
      .eq('merchant_id', merchant_id)
      .single();

    if (!customerMerchant) {
      const { data: newRelation, error: relationError } = await supabase
        .from('customer_merchants')
        .insert({
          customer_id: customer.id,
          merchant_id,
          points_balance: 0,
          visits_count: 0,
        })
        .select()
        .single();

      if (relationError) throw relationError;
      customerMerchant = newRelation;
    }

    // Create check-in record
    const { data: checkin, error: checkinError } = await supabase
      .from('checkins')
      .insert({
        customer_id: customer.id,
        merchant_id,
        branch_id: branch_id || branch.id,
        created_by: user.id,
      })
      .select()
      .single();

    if (checkinError) throw checkinError;

    // Update customer stats
    await supabase
      .from('customer_merchants')
      .update({
        visits_count: (customerMerchant.visits_count || 0) + 1,
        last_visit_at: new Date().toISOString(),
      })
      .eq('id', customerMerchant.id);

    // Check for completed challenges (visit-based)
    const { data: visitChallenges } = await supabase
      .from('challenges')
      .select('*')
      .eq('merchant_id', merchant_id)
      .eq('challenge_type', 'visit_count')
      .eq('is_active', true);

    const completedChallenges = [];
    for (const challenge of visitChallenges || []) {
      if (challenge.target_value && (customerMerchant.visits_count || 0) + 1 >= challenge.target_value) {
        completedChallenges.push(challenge);
      }
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      merchant_id,
      action: 'create',
      entity_type: 'checkin',
      entity_id: checkin.id,
      new_data: { customer_id: customer.id, branch_id: branch.id },
    });

    return successResponse({
      checkin,
      customer: {
        id: customer.id,
        phone,
        visits_count: (customerMerchant.visits_count || 0) + 1,
        points_balance: customerMerchant.points_balance || 0,
      },
      completed_challenges: completedChallenges.map(c => ({
        id: c.id,
        name: c.name,
        points_reward: c.points_reward,
      })),
    }, 201);

  } catch (error) {
    if (error instanceof ValidationError) {
      return validationErrorResponse(error.errors);
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('[API] POST /api/checkin error:', error);
    return errorResponse('Failed to process check-in', 500);
  }
}
