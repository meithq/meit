-- ============================================================================
-- VERIFICAR NOMBRE DEL NEGOCIO EN business_settings
-- ============================================================================

-- Ver todos los business_settings (debería haber solo uno por usuario)
SELECT
  id,
  name as nombre_negocio,
  owner,
  created_at
FROM business_settings
ORDER BY created_at DESC;

-- Ver todas las sucursales y a qué negocio pertenecen
SELECT
  b.id,
  b.name as nombre_sucursal,
  b.business_settings_id,
  bs.name as nombre_negocio_padre,
  b.address,
  b.created_at
FROM businesses b
LEFT JOIN business_settings bs ON b.business_settings_id = bs.id
ORDER BY b.created_at DESC;

-- Verificar si existe "Adirson Inc 2"
SELECT
  id,
  name,
  'business_settings' as tabla
FROM business_settings
WHERE name ILIKE '%Adirson%'

UNION ALL

SELECT
  id::text,
  name,
  'businesses' as tabla
FROM businesses
WHERE name ILIKE '%Adirson%';
