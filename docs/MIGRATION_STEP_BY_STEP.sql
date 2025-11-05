-- ============================================================================
-- MIGRACIÓN PASO A PASO: customer_businesses → business_settings_id
-- Ejecutar cada sección por separado y verificar resultados
-- ============================================================================

-- ============================================================================
-- PASO 1: Agregar nueva columna business_settings_id
-- ============================================================================
ALTER TABLE customer_businesses
ADD COLUMN business_settings_id INTEGER;

-- Verificar que se agregó:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'customer_businesses' AND column_name = 'business_settings_id';

-- ============================================================================
-- PASO 2: Poblar business_settings_id desde businesses
-- ============================================================================

-- Primero verificar que todas las businesses tienen business_settings_id
SELECT
  COUNT(*) as total_businesses,
  COUNT(business_settings_id) as con_business_settings_id,
  COUNT(*) - COUNT(business_settings_id) as sin_business_settings_id
FROM businesses;

-- Si todo está OK, actualizar customer_businesses
UPDATE customer_businesses cb
SET business_settings_id = b.business_settings_id
FROM businesses b
WHERE cb.business_id = b.id;

-- Verificar el resultado:
SELECT
  COUNT(*) as total,
  COUNT(business_settings_id) as con_business_settings_id,
  COUNT(business_id) as con_business_id
FROM customer_businesses;

-- ============================================================================
-- PASO 3: Hacer la columna NOT NULL
-- ============================================================================

-- Solo ejecutar si TODOS los registros tienen business_settings_id
ALTER TABLE customer_businesses
ALTER COLUMN business_settings_id SET NOT NULL;

-- ============================================================================
-- PASO 4: Agregar Foreign Key
-- ============================================================================

ALTER TABLE customer_businesses
ADD CONSTRAINT fk_customer_businesses_business_settings
FOREIGN KEY (business_settings_id)
REFERENCES business_settings(id)
ON DELETE CASCADE;

-- ============================================================================
-- PASO 5: Crear índice
-- ============================================================================

CREATE INDEX idx_customer_businesses_business_settings_id
ON customer_businesses(business_settings_id);

-- ============================================================================
-- PASO 6: Eliminar constraint único antiguo
-- ============================================================================

ALTER TABLE customer_businesses
DROP CONSTRAINT IF EXISTS customer_businesses_customer_id_business_id_key;

-- ============================================================================
-- PASO 7: Agregar nuevo constraint único
-- ============================================================================

ALTER TABLE customer_businesses
ADD CONSTRAINT customer_businesses_customer_business_settings_unique
UNIQUE (customer_id, business_settings_id);

-- ============================================================================
-- PASO 8 (OPCIONAL): Eliminar columna business_id antigua
-- ============================================================================

-- ADVERTENCIA: Solo ejecutar esto después de verificar que todo funciona
-- y actualizar el código TypeScript

-- ALTER TABLE customer_businesses DROP COLUMN business_id;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

-- Ver estructura completa
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'customer_businesses'
ORDER BY ordinal_position;

-- Ver constraints
SELECT
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'customer_businesses'::regclass;

-- Ver índices
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'customer_businesses';

-- Ver datos de ejemplo
SELECT
  cb.id,
  c.phone as customer_phone,
  bs.name as business_name,
  b.name as branch_name,
  cb.total_points,
  cb.visits_count,
  cb.business_settings_id,
  cb.business_id
FROM customer_businesses cb
LEFT JOIN customers c ON cb.customer_id = c.id
LEFT JOIN business_settings bs ON cb.business_settings_id = bs.id
LEFT JOIN businesses b ON cb.business_id = b.id
LIMIT 5;
