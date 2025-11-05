import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAuthContext, checkPermission } from '@/lib/api/auth';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, validationErrorResponse } from '@/lib/api/response';
import { validateRequest, ValidationError } from '@/lib/api/validation';
import { assignPointsSchema } from '@meit/shared/validators/api';
import type { Database } from '@meit/supabase/types';

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const { user, merchant_id } = await getAuthContext(request);

    // 2. Authorization
    if (!await checkPermission(user.role, 'points', 'assign')) {
      return forbiddenResponse('Insufficient permissions');
    }

    // 3. Validation
    const { customer_id, amount, challenge_ids } = await validateRequest(
      request,
      assignPointsSchema
    );

    // 4. Create Supabase client
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

    // 5. Get merchant points config
    // TODO: merchants table doesn't have config field yet, using defaults
    const pointsPerDollar = 1;  // Default: 1 point per dollar
    const points = Math.floor(amount * pointsPerDollar);

    // 6. Get customer-merchant relationship
    const { data: customerMerchant, error: cmError } = await supabase
      .from('customer_merchants')
      .select('*')
      .eq('customer_id', customer_id)
      .eq('merchant_id', merchant_id)
      .single();

    if (cmError) throw cmError;

    // 7. Create point transaction
    const { error: txError } = await supabase
      .from('point_transactions')
      .insert({
        customer_id,
        merchant_id,
        transaction_type: 'earn',
        points,
        reference_type: 'purchase',
        description: `Purchase of $${amount}`,
        created_by: user.id,
      });

    if (txError) throw txError;

    // 8. Update customer points balance
    const newBalance = (customerMerchant.points_balance || 0) + points;
    const { error: updateError } = await supabase
      .from('customer_merchants')
      .update({
        points_balance: newBalance,
        last_visit_at: new Date().toISOString(),
      })
      .eq('id', customerMerchant.id);

    if (updateError) throw updateError;

    // 9. Check for gift card generation
    // TODO [QA]: Potential race condition - if gift card creation succeeds but point deduction fails,
    // customer gets both points AND gift card. Consider wrapping in Supabase RPC transaction or
    // implementing retry/rollback logic. Low risk in practice due to simple operations.
    const giftCardThreshold = 100;  // Default: 100 points
    const giftCardValue = 5;        // Default: $5 gift card
    let generatedGiftCard = null;

    if (newBalance >= giftCardThreshold) {
      // Generate gift card
      const code = generateGiftCardCode();
      // TODO: gift_card_rule_id should reference an actual gift card rule
      // For now using merchant_id as placeholder
      const { data: newGiftCard, error: gcError } = await supabase
        .from('gift_cards')
        .insert({
          customer_id,
          merchant_id,
          gift_card_rule_id: merchant_id,  // Placeholder until rules are created
          code,
          points_cost: giftCardThreshold,
          reward_value: giftCardValue,
          status: 'active',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (!gcError && newGiftCard) {
        generatedGiftCard = newGiftCard;

        // Deduct points
        await supabase
          .from('customer_merchants')
          .update({ points_balance: newBalance - giftCardThreshold })
          .eq('id', customerMerchant.id);
      }
    }

    // 10. Check completed challenges
    const completedChallenges: string[] = [];
    if (challenge_ids && challenge_ids.length > 0) {
      // TODO: Implement challenge completion logic
      completedChallenges.push(...challenge_ids);
    }

    // 11. Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      merchant_id,
      action: 'create',
      entity_type: 'point_transaction',
      entity_id: customer_id,
      new_data: { points, amount, balance: newBalance },
    });

    // 12. Response
    return successResponse({
      points_earned: points,
      total_points: newBalance - (generatedGiftCard ? giftCardThreshold : 0),
      gift_card: generatedGiftCard ? {
        code: generatedGiftCard.code,
        value: generatedGiftCard.reward_value,
        expires_at: generatedGiftCard.expires_at,
      } : null,
      challenges_completed: completedChallenges,
    });

  } catch (error) {
    if (error instanceof ValidationError) {
      return validationErrorResponse(error.errors);
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('[API] /api/points/assign error:', error);
    return errorResponse('Failed to assign points', 500);
  }
}

function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
