-- ============================================================================
-- MIGRACIÓN: Actualizar customer_businesses para usar business_settings_id
-- ============================================================================

-- 1. Primero, vamos a agregar la nueva columna business_settings_id
ALTER TABLE customer_businesses
ADD COLUMN business_settings_id INTEGER;

-- 2. Poblar business_settings_id basado en business_id existente
-- (Asumiendo que cada business ya tiene su business_settings_id)
UPDATE customer_businesses cb
SET business_settings_id = b.business_settings_id
FROM businesses b
WHERE cb.business_id = b.id;

-- 3. Verificar que todos los registros tienen business_settings_id
SELECT
  COUNT(*) as total_registros,
  COUNT(business_settings_id) as con_business_settings_id,
  COUNT(*) - COUNT(business_settings_id) as sin_business_settings_id
FROM customer_businesses;

-- 4. Hacer la columna NOT NULL (solo después de verificar que todos tienen valor)
ALTER TABLE customer_businesses
ALTER COLUMN business_settings_id SET NOT NULL;

-- 5. Agregar la foreign key
ALTER TABLE customer_businesses
ADD CONSTRAINT fk_customer_businesses_business_settings
FOREIGN KEY (business_settings_id)
REFERENCES business_settings(id)
ON DELETE CASCADE;

-- 6. Crear índice para business_settings_id
CREATE INDEX idx_customer_businesses_business_settings_id
ON customer_businesses(business_settings_id);

-- 7. OPCIONAL: Eliminar la columna business_id antigua si ya no la necesitas
-- ALTER TABLE customer_businesses DROP COLUMN business_id;

-- 8. Eliminar el constraint único antiguo (customer_id, business_id)
ALTER TABLE customer_businesses
DROP CONSTRAINT IF EXISTS customer_businesses_customer_id_business_id_key;

-- 9. Agregar nuevo constraint único para customer + business_settings
-- (Un cliente no puede estar registrado dos veces en el mismo negocio padre)
ALTER TABLE customer_businesses
ADD CONSTRAINT customer_businesses_customer_business_settings_unique
UNIQUE (customer_id, business_settings_id);

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Ver la estructura actualizada
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
  contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'customer_businesses'::regclass;

-- Ver datos de ejemplo con la nueva estructura
SELECT
  cb.id,
  c.phone as customer_phone,
  c.name as customer_name,
  bs.name as business_name,
  cb.total_points,
  cb.visits_count
FROM customer_businesses cb
JOIN customers c ON cb.customer_id = c.id
JOIN business_settings bs ON cb.business_settings_id = bs.id
LIMIT 5;
