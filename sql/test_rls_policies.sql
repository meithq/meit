-- ============================================
-- Script de prueba para políticas RLS
-- ============================================
-- IMPORTANTE: Ejecuta esto después de crear las políticas

-- ============================================
-- 1. VERIFICAR ESTADO DE RLS
-- ============================================

-- Verificar que RLS esté habilitado
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'users' AND schemaname = 'public';
-- Resultado esperado: rls_enabled = true

-- ============================================
-- 2. LISTAR TODAS LAS POLÍTICAS
-- ============================================

SELECT
  policyname as "Política",
  cmd as "Operación",
  roles as "Roles",
  CASE
    WHEN qual IS NULL THEN 'Sin restricción'
    ELSE 'Con restricción'
  END as "USING",
  CASE
    WHEN with_check IS NULL THEN 'Sin validación'
    ELSE 'Con validación'
  END as "WITH CHECK"
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- ============================================
-- 3. PROBAR CONSULTAS COMO USUARIO AUTENTICADO
-- ============================================

-- Simular consulta de lectura (esto debería funcionar si el auth.uid() coincide)
-- Reemplaza 'TU_USER_ID' con un ID real de tu tabla users
EXPLAIN (ANALYZE, VERBOSE, BUFFERS)
SELECT * FROM public.users
WHERE id = 'TU_USER_ID' OR auth = 'TU_USER_ID';

-- ============================================
-- 4. VERIFICAR DATOS DE USUARIOS
-- ============================================

-- Ver usuarios y sus valores de first_time
SELECT
  id,
  email,
  name,
  first_time,
  role,
  is_active,
  auth IS NOT NULL as "Tiene link auth",
  created_at,
  updated_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- 5. CONTAR POLÍTICAS POR OPERACIÓN
-- ============================================

SELECT
  cmd as "Operación",
  COUNT(*) as "Número de políticas"
FROM pg_policies
WHERE tablename = 'users'
GROUP BY cmd
ORDER BY cmd;
-- Resultado esperado:
-- SELECT: 1 política (Users can read own data)
-- UPDATE: 1 política (Users can update own data)
-- INSERT: 1 política (Users can insert own data)
-- ALL: 1 política (Service role has full access)

-- ============================================
-- 6. VERIFICAR PERMISOS DE LA TABLA
-- ============================================

SELECT
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants
WHERE table_name = 'users'
  AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- ============================================
-- 7. PRUEBA DE ACTUALIZACIÓN MANUAL
-- ============================================
-- Solo para testing - actualiza un usuario específico

-- NOTA: Reemplaza 'TU_EMAIL' con un email real de tu base de datos
-- UPDATE public.users
-- SET first_time = true
-- WHERE email = 'TU_EMAIL';

-- Verificar el cambio
-- SELECT email, first_time, updated_at
-- FROM public.users
-- WHERE email = 'TU_EMAIL';

-- ============================================
-- 8. DIAGNÓSTICO DE PROBLEMAS COMUNES
-- ============================================

-- Buscar usuarios sin columna auth asignada
SELECT
  id,
  email,
  auth,
  CASE
    WHEN auth IS NULL THEN '⚠️ SIN LINK AUTH'
    WHEN auth = id THEN '✅ LINK CORRECTO'
    ELSE '⚠️ LINK DIFERENTE'
  END as estado_auth
FROM public.users;

-- Buscar usuarios con first_time en NULL (debería estar siempre en true o false)
SELECT
  id,
  email,
  first_time,
  CASE
    WHEN first_time IS NULL THEN '⚠️ NULL (ARREGLAR)'
    WHEN first_time = true THEN '🆕 PRIMER LOGIN'
    ELSE '✅ YA USÓ LA APP'
  END as estado_first_time
FROM public.users;
