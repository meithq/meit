import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAuthContext, checkPermission } from '@/lib/api/auth';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, validationErrorResponse } from '@/lib/api/response';
import { validateRequest, ValidationError } from '@/lib/api/validation';
import { createChallengeSchema } from '@meit/shared/validators/api';
import type { Database } from '@meit/supabase/types';

// GET /api/challenges - List challenges
export async function GET(request: NextRequest) {
  try {
    const { user, merchant_id } = await getAuthContext(request);

    if (!await checkPermission(user.role, 'challenges', 'read')) {
      return forbiddenResponse();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active' | 'paused'

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

    let query = supabase
      .from('challenges')
      .select('*')
      .eq('merchant_id', merchant_id)
      .order('created_at', { ascending: false });

    // Map status query param to is_active boolean
    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'paused') {
      query = query.eq('is_active', false);
    }

    const { data: challenges, error } = await query;

    if (error) throw error;

    return successResponse({ challenges: challenges || [] });

  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('[API] GET /api/challenges error:', error);
    return errorResponse('Failed to fetch challenges', 500);
  }
}

// POST /api/challenges - Create challenge
export async function POST(request: NextRequest) {
  try {
    const { user, merchant_id } = await getAuthContext(request);

    if (!await checkPermission(user.role, 'challenges', 'write')) {
      return forbiddenResponse();
    }

    const challengeData = await validateRequest(request, createChallengeSchema);

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
      .insert({
        ...challengeData,
        merchant_id,
        is_active: true, // New challenges are active by default
      })
      .select()
      .single();

    if (error) throw error;

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      merchant_id,
      action: 'create',
      entity_type: 'challenge',
      entity_id: challenge.id,
      new_data: challengeData,
    });

    return successResponse({ challenge }, 201);

  } catch (error) {
    if (error instanceof ValidationError) {
      return validationErrorResponse(error.errors);
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('[API] POST /api/challenges error:', error);
    return errorResponse('Failed to create challenge', 500);
  }
}
