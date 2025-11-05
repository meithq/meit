-- ============================================================================
-- FIX: Poblar business_settings_id en sucursales existentes
-- ============================================================================

-- PASO 1: Ver el problema
-- Ver sucursales sin business_settings_id
SELECT
  id,
  name,
  owner,
  business_settings_id,
  created_at
FROM businesses
WHERE business_settings_id IS NULL;

-- PASO 2: Actualizar sucursales para que tengan business_settings_id
-- Esto asigna a cada sucursal el business_settings del mismo owner

UPDATE businesses b
SET business_settings_id = bs.id
FROM business_settings bs
WHERE b.owner = bs.owner
AND b.business_settings_id IS NULL;

-- PASO 3: Verificar que se actualizó correctamente
SELECT
  b.id,
  b.name as sucursal,
  b.business_settings_id,
  bs.name as negocio_padre,
  b.owner
FROM businesses b
LEFT JOIN business_settings bs ON b.business_settings_id = bs.id
ORDER BY b.created_at DESC;

-- PASO 4: Ver si aún hay sucursales sin business_settings_id
SELECT COUNT(*) as sucursales_sin_negocio_padre
FROM businesses
WHERE business_settings_id IS NULL;
