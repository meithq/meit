-- ============================================================================
-- VERIFICAR NOMBRE EXACTO en business_settings
-- ============================================================================

-- Ver el nombre EXACTO con información adicional
SELECT
  id,
  name,
  LENGTH(name) as longitud_nombre,
  name = 'Adirson Inc' as coincide_exacto,
  name ILIKE 'Adirson Inc' as coincide_case_insensitive,
  LOWER(name) as nombre_minusculas,
  TRIM(name) as nombre_sin_espacios,
  created_at
FROM business_settings
ORDER BY created_at DESC;

-- Ver si hay espacios extra o caracteres especiales
SELECT
  id,
  name,
  encode(name::bytea, 'hex') as nombre_hex,
  created_at
FROM business_settings
ORDER BY created_at DESC;

-- Intentar buscar como lo hace el código
SELECT
  id,
  name
FROM business_settings
WHERE name ILIKE 'Adirson Inc'
LIMIT 1;

-- Buscar cualquier variación de "Adirson"
SELECT
  id,
  name,
  'Encontrado' as resultado
FROM business_settings
WHERE name ILIKE '%Adirson%';
