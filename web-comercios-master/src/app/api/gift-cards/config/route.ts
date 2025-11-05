import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAuthContext, checkPermission } from '@/lib/api/auth';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, validationErrorResponse } from '@/lib/api/response';
import { validateRequest, ValidationError } from '@/lib/api/validation';
import { updateGiftCardConfigSchema } from '@meit/shared/validators/api';
import type { Database } from '@meit/supabase/types';

// GET /api/gift-cards/config - Get gift card configuration
export async function GET(request: NextRequest) {
  try {
    const { user, merchant_id } = await getAuthContext(request);

    if (!await checkPermission(user.role, 'gift_cards', 'read')) {
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

    // TODO: merchants table doesn't have config field yet
    // Will need to add a JSONB config column or create separate settings table
    const config = {
      gift_card_threshold: 100,  // Default: 100 points
      gift_card_value: 5,         // Default: $5 gift card
      auto_generate: true,        // Default: auto-generate enabled
      points_per_dollar: 1,       // Default: 1 point per dollar
    };

    return successResponse({ config });

  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('[API] GET /api/gift-cards/config error:', error);
    return errorResponse('Failed to fetch gift card config', 500);
  }
}

// PUT /api/gift-cards/config - Update gift card configuration
export async function PUT(request: NextRequest) {
  try {
    const { user, merchant_id } = await getAuthContext(request);

    // Only admin can update config
    if (user.role !== 'admin') {
      return forbiddenResponse('Only administrators can update gift card configuration');
    }

    const updates = await validateRequest(request, updateGiftCardConfigSchema);

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

    // TODO: merchants table doesn't have config field yet
    // For now, just return the updates as confirmation
    // In the future, this will save to merchants.config JSONB field

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      merchant_id,
      action: 'update',
      entity_type: 'gift_card_config',
      entity_id: merchant_id,
      new_data: updates,
    });

    return successResponse({ config: updates });

  } catch (error) {
    if (error instanceof ValidationError) {
      return validationErrorResponse(error.errors);
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('[API] PUT /api/gift-cards/config error:', error);
    return errorResponse('Failed to update gift card config', 500);
  }
}
