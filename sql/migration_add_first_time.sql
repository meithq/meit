-- Migration: Add first_time and auth columns to users table
-- Execute this in Supabase SQL Editor

-- Add first_time column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS first_time boolean DEFAULT true;

-- Add auth column to users table (references auth.users)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS auth uuid REFERENCES auth.users(id);

-- Update existing users to set first_time = false (they're already registered)
UPDATE public.users
SET first_time = false
WHERE first_time IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_auth ON public.users(auth);
CREATE INDEX IF NOT EXISTS idx_users_first_time ON public.users(first_time);

-- Enable RLS policies for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY IF NOT EXISTS "Users can read own data"
ON public.users
FOR SELECT
USING (auth.uid() = auth);

-- Policy: Users can update their own data
CREATE POLICY IF NOT EXISTS "Users can update own data"
ON public.users
FOR UPDATE
USING (auth.uid() = auth);

-- Policy: Allow service role to do everything
CREATE POLICY IF NOT EXISTS "Service role can do everything"
ON public.users
FOR ALL
USING (auth.role() = 'service_role');

COMMENT ON COLUMN public.users.first_time IS 'Indicates if this is the users first time logging in';
COMMENT ON COLUMN public.users.auth IS 'Reference to auth.users table';
