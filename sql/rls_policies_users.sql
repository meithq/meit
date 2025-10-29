-- ============================================
-- Políticas RLS para la tabla USERS
-- ============================================

-- 1. Habilitar RLS en la tabla users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes si existen (para empezar limpio)
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on auth" ON public.users;
DROP POLICY IF EXISTS "Service role has full access" ON public.users;

-- ============================================
-- POLÍTICAS DE LECTURA (SELECT)
-- ============================================

-- Política: Los usuarios autenticados pueden leer su propia información
CREATE POLICY "Users can read own data"
ON public.users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR
  auth.uid() = auth
);

-- ============================================
-- POLÍTICAS DE ACTUALIZACIÓN (UPDATE)
-- ============================================

-- Política: Los usuarios autenticados pueden actualizar su propia información
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

-- ============================================
-- POLÍTICAS DE INSERCIÓN (INSERT)
-- ============================================

-- Política: Los usuarios autenticados pueden crear su propio registro
CREATE POLICY "Users can insert own data"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id
  OR
  auth.uid() = auth
);

-- ============================================
-- POLÍTICAS PARA SERVICE ROLE
-- ============================================

-- Política: Service role tiene acceso completo (para operaciones del backend)
CREATE POLICY "Service role has full access"
ON public.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver todas las políticas creadas
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as operation,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- Verificar que RLS esté habilitado
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'users' AND schemaname = 'public';

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON POLICY "Users can read own data" ON public.users IS
'Permite a los usuarios autenticados leer su propia información usando id o auth column';

COMMENT ON POLICY "Users can update own data" ON public.users IS
'Permite a los usuarios autenticados actualizar su propia información (first_time, name, etc.)';

COMMENT ON POLICY "Users can insert own data" ON public.users IS
'Permite a los usuarios autenticados crear su propio registro durante el signup';

COMMENT ON POLICY "Service role has full access" ON public.users IS
'Permite al service role realizar cualquier operación para funcionalidades del backend';
