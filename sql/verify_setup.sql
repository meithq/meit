-- Script de verificación - Ejecuta esto en Supabase SQL Editor

-- 1. Verificar que las columnas existen
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND table_schema = 'public'
  AND column_name IN ('first_time', 'auth', 'role')
ORDER BY column_name;

-- 2. Verificar políticas RLS
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users';

-- 3. Verificar que RLS esté habilitado
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'users'
  AND schemaname = 'public';

-- 4. Ver algunos datos de ejemplo (sin datos sensibles)
SELECT
    id,
    email,
    first_time,
    auth IS NOT NULL as has_auth_link,
    role,
    created_at
FROM public.users
LIMIT 5;
