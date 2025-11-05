-- ============================================================================
-- FIX: Agregar política RLS para service_role en customer_businesses
-- ============================================================================

-- 1. Verificar que RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'customer_businesses';

-- 2. Ver políticas actuales
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
WHERE tablename = 'customer_businesses';

-- 3. IMPORTANTE: Volver a habilitar RLS si lo desactivaste
ALTER TABLE customer_businesses ENABLE ROW LEVEL SECURITY;

-- 4. Verificar si ya existe la política para service_role
SELECT policyname
FROM pg_policies
WHERE tablename = 'customer_businesses'
AND policyname = 'Allow service role full access to customer_businesses';

-- 5. Si NO existe, crearla (este es el comando importante)
-- Esta política permite al service_role (webhooks) acceso completo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'customer_businesses'
    AND policyname = 'Allow service role full access to customer_businesses'
  ) THEN
    CREATE POLICY "Allow service role full access to customer_businesses"
      ON customer_businesses
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
    RAISE NOTICE 'Política creada exitosamente';
  ELSE
    RAISE NOTICE 'La política ya existe';
  END IF;
END $$;

-- 6. Verificar que se creó correctamente
SELECT
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'customer_businesses'
AND policyname LIKE '%service%role%';

-- 7. Ver TODAS las políticas finales de customer_businesses
SELECT
  policyname,
  cmd as tipo_comando,
  roles,
  CASE
    WHEN qual = 'true' THEN 'Sin restricciones'
    ELSE 'Con restricciones'
  END as acceso_lectura,
  CASE
    WHEN with_check = 'true' THEN 'Sin restricciones'
    ELSE 'Con restricciones'
  END as acceso_escritura
FROM pg_policies
WHERE tablename = 'customer_businesses'
ORDER BY policyname;
