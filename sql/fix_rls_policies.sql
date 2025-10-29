-- ============================================
-- Script para ARREGLAR políticas RLS
-- ============================================

-- Primero, ver qué políticas existen actualmente
SELECT
  policyname,
  cmd as operacion
FROM pg_policies
WHERE tablename = 'users';

-- Si el resultado anterior está vacío o incompleto, continúa...

-- ============================================
-- ELIMINAR POLÍTICAS EXISTENTES (si las hay)
-- ============================================

DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Service role has full access" ON public.users;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on auth" ON public.users;

-- ============================================
-- CREAR POLÍTICAS NUEVAMENTE
-- ============================================

-- 1. SELECT - Los usuarios pueden leer su propia data
CREATE POLICY "Users can read own data"
ON public.users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR
  auth.uid() = auth
);

-- 2. UPDATE - Los usuarios pueden actualizar su propia data
CREATE POLICY "Users can update own data"
ON public.users
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id
  OR
  auth.uid() = auth
)
WITH CHECK (
  auth.uid() = id
  OR
  auth.uid() = auth
);

-- 3. INSERT - Los usuarios pueden crear su propio registro
CREATE POLICY "Users can insert own data"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id
  OR
  auth.uid() = auth
);

-- 4. Service Role - Acceso completo
CREATE POLICY "Service role has full access"
ON public.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- VERIFICAR QUE SE CREARON CORRECTAMENTE
-- ============================================

SELECT
  'Políticas creadas:' as mensaje,
  COUNT(*) as total
FROM pg_policies
WHERE tablename = 'users';

-- Debe mostrar: total = 4

-- Ver detalles de cada política
SELECT
  policyname as "Política",
  cmd as "Operación",
  roles as "Rol"
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- ============================================
-- VERIFICACIÓN FINAL COMPLETA
-- ============================================

SELECT
  '✅ RLS Habilitado' as check,
  EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'users' AND rowsecurity = true) as resultado
UNION ALL
SELECT
  '✅ Políticas Creadas',
  (SELECT COUNT(*) >= 4 FROM pg_policies WHERE tablename = 'users')
UNION ALL
SELECT
  '✅ Columna first_time',
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'first_time')
UNION ALL
SELECT
  '✅ Columna auth',
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'auth');

-- Resultado esperado: TODOS deben ser TRUE
