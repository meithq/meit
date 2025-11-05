-- ============================================================================
-- VERIFICACIÓN DE LA TABLA customer_businesses
-- ============================================================================

-- 1. Verificar que la tabla existe y su estructura
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'customer_businesses'
ORDER BY ordinal_position;

-- 2. Verificar índices creados
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'customer_businesses';

-- 3. Verificar políticas RLS
SELECT
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'customer_businesses';

-- 4. Verificar que RLS está habilitado
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'customer_businesses';

-- 5. Ver datos actuales en la tabla (debería estar vacía)
SELECT * FROM customer_businesses;

-- 6. Verificar la vista customer_businesses_with_details
SELECT
  viewname,
  definition
FROM pg_views
WHERE viewname = 'customer_businesses_with_details';
