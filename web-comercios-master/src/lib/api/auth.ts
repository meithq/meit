import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@meit/supabase/types';

export interface AuthContext {
  user: {
    id: string;
    email: string;
    role: string;
  };
  merchant_id: string;
}

export async function getAuthContext(request: Request): Promise<AuthContext> {
  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    throw new Error('Unauthorized');
  }

  // Get user details from public.users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, merchant_id, email, role, is_active')
    .eq('id', authUser.id)
    .single();

  if (userError || !userData || !userData.is_active) {
    throw new Error('User not found or inactive');
  }

  if (!userData.merchant_id) {
    throw new Error('User has no merchant associated');
  }

  return {
    user: {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    },
    merchant_id: userData.merchant_id,
  };
}

export async function checkPermission(
  role: string,
  resource: string,
  action: string
): Promise<boolean> {
  // Admin has full access
  if (role === 'admin') return true;

  // Operator permissions
  const operatorPermissions: Record<string, string[]> = {
    'customers': ['read', 'write'],
    'checkins': ['read', 'write'],
    'points': ['assign'],
    'gift_cards': ['validate', 'redeem'],
  };

  return operatorPermissions[resource]?.includes(action) || false;
}
