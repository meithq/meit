import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAuthContext, checkPermission } from '@/lib/api/auth';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse, validationErrorResponse } from '@/lib/api/response';
import { validateRequest, ValidationError } from '@/lib/api/validation';
import { updateChallengeStatusSchema } from '@meit/shared/validators/api';
import type { Database } from '@meit/supabase/types';

// PATCH /api/challenges/[id]/status - Update challenge status (activate/pause)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, merchant_id } = await getAuthContext(request);

    if (!await checkPermission(user.role, 'challenges', 'write')) {
      return forbiddenResponse();
    }

    const { status } = await validateRequest(request, updateChallengeStatusSchema);

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

    // Map status enum to is_active boolean
    const is_active = status === 'active';

    const { data: challenge, error } = await supabase
      .from('challenges')
      .update({ is_active })
      .eq('id', (await params).id)
      .eq('merchant_id', merchant_id)
      .select()
      .single();

    if (error) {
      return notFoundResponse('Challenge not found');
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      merchant_id,
      action: 'update',
      entity_type: 'challenge',
      entity_id: (await params).id,
      new_data: { status },
    });

    return successResponse({ challenge });

  } catch (error) {
    if (error instanceof ValidationError) {
      return validationErrorResponse(error.errors);
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('[API] PATCH /api/challenges/[id]/status error:', error);
    return errorResponse('Failed to update challenge status', 500);
  }
}
