import { createClient } from './client'

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: { name?: string }
) {
  const supabase = createClient()

  // 1. Create user in auth.users with display name
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/admin`,
      data: {
        ...metadata,
        display_name: metadata?.name || '',
      },
    },
  })

  if (authError) {
    throw authError
  }

  console.log('SignUp Response:', {
    user: authData.user,
    session: authData.session,
    email_confirmed: authData.user?.email_confirmed_at,
    identities: authData.user?.identities,
  })

  // Log additional info for debugging
  if (authData.user?.email_confirmed_at) {
    console.warn('⚠️ Email was auto-confirmed! Check Supabase settings: disable "Enable auto-confirm"')
  } else {
    console.log('✅ Email confirmation required - OTP email should be sent')
  }

  // 2. If auth user was created, insert record in users table
  if (authData.user) {
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        auth: authData.user.id,
        email: email,
        name: metadata?.name || '',
        role: 1, // Admin role
        is_active: true,
        first_time: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (insertError) {
      console.error('Error creating user record:', insertError)
      // Don't throw here, auth user is already created
    }
  }

  return authData
}

export async function signInWithGoogle() {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

export async function resetPassword(email: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  if (error) {
    throw error
  }
}

export async function updatePassword(newPassword: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    throw error
  }
}

export async function getCurrentUser() {
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return user
}

export async function getUserProfile(userId: string) {
  const supabase = createClient()

  console.log('🔍 Getting user profile for:', userId)

  // Try to find by id first, then by auth column
  let { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  // If not found by id, try by auth column
  if (error && error.code === 'PGRST116') {
    console.log('⚠️ User not found by id, trying auth column...')
    const result = await supabase
      .from('users')
      .select('*')
      .eq('auth', userId)
      .single()

    data = result.data
    error = result.error
  }

  if (error) {
    console.error('❌ Error getting user profile:', error)
    throw error
  }

  console.log('✅ User profile loaded:', { id: data.id, email: data.email, first_time: data.first_time })
  return data
}

export async function updateFirstTimeStatus(userId: string, firstTime: boolean = false) {
  const supabase = createClient()

  console.log('🔄 updateFirstTimeStatus called with:', { userId, firstTime })

  // Try to update by id first
  let { data, error } = await supabase
    .from('users')
    .update({
      first_time: firstTime,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()

  // If no rows updated, try by auth column
  if (!error && (!data || data.length === 0)) {
    console.log('⚠️ No rows updated by id, trying auth column...')
    const result = await supabase
      .from('users')
      .update({
        first_time: firstTime,
        updated_at: new Date().toISOString()
      })
      .eq('auth', userId)
      .select()

    data = result.data
    error = result.error
  }

  if (error) {
    console.error('❌ Supabase update error:', error)
    throw error
  }

  if (!data || data.length === 0) {
    console.error('❌ No rows were updated. User might not exist.')
    throw new Error('No rows were updated')
  }

  console.log('✅ Supabase update response:', data)
  return data
}

export async function updateLastLogin(userId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('users')
    .update({
      last_login: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    throw error
  }
}

export async function verifyOTP(email: string, token: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup'
  })

  if (error) {
    throw error
  }

  return data
}

export async function resendOTP(email: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    }
  })

  if (error) {
    throw error
  }
}

export async function sendOTPEmail(email: string, name?: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      data: {
        name: name || '',
        display_name: name || '',
      },
      shouldCreateUser: true,
    }
  })

  if (error) {
    throw error
  }

  return data
}

export async function createUserProfile(userId: string, email: string, name: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('users')
    .insert({
      id: userId,
      auth: userId,
      email: email,
      name: name,
      role: 1, // Admin role
      is_active: true,
      first_time: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

  if (error) {
    // Check if user already exists
    if (error.code === '23505') {
      // User already exists, just return
      return
    }
    throw error
  }
}
