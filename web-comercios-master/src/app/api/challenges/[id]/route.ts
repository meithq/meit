import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAuthContext, checkPermission } from '@/lib/api/auth';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse, validationErrorResponse } from '@/lib/api/response';
import { validateRequest, ValidationError } from '@/lib/api/validation';
import { updateChallengeSchema } from '@meit/shared/validators/api';
import type { Database } from '@meit/supabase/types';

// GET /api/challenges/[id] - Get challenge details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, merchant_id } = await getAuthContext(request);

    if (!await checkPermission(user.role, 'challenges', 'read')) {
      return forbiddenResponse();
    }

    const { id } = await params;

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

    const { data: challenge, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', id)
      .eq('merchant_id', merchant_id)
      .single();

    if (error || !challenge) {
      return notFoundResponse('Challenge not found');
    }

    return successResponse({ challenge });

  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('[API] GET /api/challenges/[id] error:', error);
    return errorResponse('Failed to fetch challenge', 500);
  }
}

// PUT /api/challenges/[id] - Update challenge
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, merchant_id } = await getAuthContext(request);

    if (!await checkPermission(user.role, 'challenges', 'write')) {
      return forbiddenResponse();
    }

    const updates = await validateRequest(request, updateChallengeSchema);

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

    const { data: challenge, error } = await supabase
      .from('challenges')
      .update(updates)
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
      new_data: updates,
    });

    return successResponse({ challenge });

  } catch (error) {
    if (error instanceof ValidationError) {
      return validationErrorResponse(error.errors);
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('[API] PUT /api/challenges/[id] error:', error);
    return errorResponse('Failed to update challenge', 500);
  }
}

// DELETE /api/challenges/[id] - Delete challenge
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, merchant_id } = await getAuthContext(request);

    if (!await checkPermission(user.role, 'challenges', 'write')) {
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

    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', (await params).id)
      .eq('merchant_id', merchant_id);

    if (error) {
      return notFoundResponse('Challenge not found');
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      merchant_id,
      action: 'delete',
      entity_type: 'challenge',
      entity_id: (await params).id,
      new_data: null,
    });

    return successResponse({ success: true });

  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('[API] DELETE /api/challenges/[id] error:', error);
    return errorResponse('Failed to delete challenge', 500);
  }
}
