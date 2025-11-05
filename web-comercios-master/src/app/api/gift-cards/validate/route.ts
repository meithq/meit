import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAuthContext, checkPermission } from '@/lib/api/auth';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, validationErrorResponse } from '@/lib/api/response';
import { validateRequest, ValidationError } from '@/lib/api/validation';
import { validateGiftCardSchema } from '@meit/shared/validators/api';
import type { Database } from '@meit/supabase/types';

export async function POST(request: NextRequest) {
  try {
    const { user, merchant_id } = await getAuthContext(request);

    if (!await checkPermission(user.role, 'gift_cards', 'validate')) {
      return forbiddenResponse();
    }

    const { code } = await validateRequest(request, validateGiftCardSchema);

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

    const { data: giftCard, error } = await supabase
      .from('gift_cards')
      .select('*, customer:customers!gift_cards_customer_id_fkey(id, phone, name)')
      .eq('code', code.toUpperCase())
      .eq('merchant_id', merchant_id)
      .single();

    if (error || !giftCard) {
      return successResponse({ valid: false, error: 'Gift card not found' });
    }

    if (giftCard.status !== 'active') {
      return successResponse({ valid: false, error: `Gift card is ${giftCard.status}` });
    }

    if (new Date(giftCard.expires_at) < new Date()) {
      return successResponse({ valid: false, error: 'Gift card expired' });
    }

    return successResponse({
      valid: true,
      code: giftCard.code,
      value: giftCard.reward_value,
      customer: giftCard.customer,
      expires_at: giftCard.expires_at,
    });

  } catch (error) {
    if (error instanceof ValidationError) {
      return validationErrorResponse(error.errors);
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('[API] /api/gift-cards/validate error:', error);
    return errorResponse('Failed to validate gift card', 500);
  }
}
