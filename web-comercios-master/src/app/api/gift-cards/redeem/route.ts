import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAuthContext, checkPermission } from '@/lib/api/auth';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, validationErrorResponse } from '@/lib/api/response';
import { validateRequest, ValidationError } from '@/lib/api/validation';
import { redeemGiftCardSchema } from '@meit/shared/validators/api';
import type { Database } from '@meit/supabase/types';

export async function POST(request: NextRequest) {
  try {
    const { user, merchant_id } = await getAuthContext(request);

    if (!await checkPermission(user.role, 'gift_cards', 'redeem')) {
      return forbiddenResponse();
    }

    const { code, amount } = await validateRequest(request, redeemGiftCardSchema);

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

    // 1. Validate gift card
    const { data: giftCard, error: gcError } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('merchant_id', merchant_id)
      .eq('status', 'active')
      .single();

    if (gcError || !giftCard) {
      return errorResponse('Gift card not found or already redeemed', 404);
    }

    if (new Date(giftCard.expires_at) < new Date()) {
      return errorResponse('Gift card has expired', 400);
    }

    // 2. Mark as redeemed
    const { error: updateError } = await supabase
      .from('gift_cards')
      .update({
        status: 'redeemed',
        redeemed_at: new Date().toISOString(),
        redeemed_by: user.id,
      })
      .eq('id', giftCard.id);

    if (updateError) throw updateError;

    // 3. Create point transaction for audit
    await supabase.from('point_transactions').insert({
      customer_id: giftCard.customer_id,
      merchant_id,
      transaction_type: 'redeem',
      points: -giftCard.points_cost,
      reference_id: giftCard.id,
      reference_type: 'gift_card',
      description: `Redeemed gift card ${code} for $${giftCard.reward_value}`,
      created_by: user.id,
    });

    // 4. Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      merchant_id,
      action: 'update',
      entity_type: 'gift_card',
      entity_id: giftCard.id,
      new_data: { status: 'redeemed' },
    });

    return successResponse({
      success: true,
      redeemed_value: giftCard.reward_value,
      remaining_value: 0,
    });

  } catch (error) {
    if (error instanceof ValidationError) {
      return validationErrorResponse(error.errors);
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('[API] /api/gift-cards/redeem error:', error);
    return errorResponse('Failed to redeem gift card', 500);
  }
}
