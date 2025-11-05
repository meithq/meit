import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAuthContext } from '@/lib/api/auth';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, validationErrorResponse } from '@/lib/api/response';
import { validateRequest, ValidationError } from '@/lib/api/validation';
import { completeOnboardingSchema } from '@meit/shared/validators/api';
import type { Database } from '@meit/supabase/types';

// POST /api/onboarding/complete - Complete merchant onboarding
export async function POST(request: NextRequest) {
  try {
    const { user, merchant_id } = await getAuthContext(request);

    // Only admin can complete onboarding
    if (user.role !== 'admin') {
      return forbiddenResponse('Only administrators can complete onboarding');
    }

    const {
      business_info,
      points_config,
      challenges,
      whatsapp_connected,
      qr_generated,
    } = await validateRequest(request, completeOnboardingSchema);

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

    // Get current merchant data
    const { data: merchant, error: fetchError } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', merchant_id)
      .single();

    if (fetchError) throw fetchError;

    // Update merchant with onboarding data
    // TODO: merchants table doesn't have config, business_name, business_type fields yet
    // For now, just update the basic fields that exist
    const { data: updatedMerchant, error: updateError } = await supabase
      .from('merchants')
      .update({
        phone: business_info.phone,
        // onboarding_completed: true,  // TODO: Add this field to merchants table
        // onboarding_completed_at: new Date().toISOString(),
      })
      .eq('id', merchant_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Link selected challenges (if pre-created templates)
    if (challenges && challenges.length > 0) {
      for (const challengeId of challenges) {
        await supabase
          .from('challenges')
          .update({ is_active: true })
          .eq('id', challengeId)
          .eq('merchant_id', merchant_id);
      }
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      merchant_id,
      action: 'update',
      entity_type: 'merchant_onboarding',
      entity_id: merchant_id,
      new_data: {
        business_info,
        points_config,
        challenges: challenges.length,
        whatsapp_connected,
        qr_generated,
      },
    });

    return successResponse({
      success: true,
      merchant: updatedMerchant,
      message: 'Onboarding completed successfully',
    });

  } catch (error) {
    if (error instanceof ValidationError) {
      return validationErrorResponse(error.errors);
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('[API] POST /api/onboarding/complete error:', error);
    return errorResponse('Failed to complete onboarding', 500);
  }
}
