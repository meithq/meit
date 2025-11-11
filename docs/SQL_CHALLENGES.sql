-- =====================================================
-- SQL para tabla CHALLENGES (Retos)
-- =====================================================

-- Primero, verificar si la tabla existe
-- Si no existe, crearla
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('monto_minimo', 'horario_visita', 'frecuencia_visitas', 'categoria_producto')),
  target_value INTEGER NOT NULL DEFAULT 0,
  is_repeatable BOOLEAN DEFAULT TRUE,
  max_completions_per_day INTEGER,
  max_completions_total INTEGER,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT FALSE,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_challenges_business_id ON challenges(business_id);
CREATE INDEX IF NOT EXISTS idx_challenges_is_active ON challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_challenges_challenge_type ON challenges(challenge_type);
CREATE INDEX IF NOT EXISTS idx_challenges_start_date ON challenges(start_date);
CREATE INDEX IF NOT EXISTS idx_challenges_end_date ON challenges(end_date);

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS en la tabla
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view challenges from their businesses" ON challenges;
DROP POLICY IF EXISTS "Users can insert challenges for their businesses" ON challenges;
DROP POLICY IF EXISTS "Users can update challenges from their businesses" ON challenges;
DROP POLICY IF EXISTS "Users can delete challenges from their businesses" ON challenges;

-- Política para SELECT (ver retos)
CREATE POLICY "Users can view challenges from their businesses"
ON challenges
FOR SELECT
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner = auth.uid()
  )
);

-- Política para INSERT (crear retos)
CREATE POLICY "Users can insert challenges for their businesses"
ON challenges
FOR INSERT
TO authenticated
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses WHERE owner = auth.uid()
  )
);

-- Política para UPDATE (actualizar retos)
CREATE POLICY "Users can update challenges from their businesses"
ON challenges
FOR UPDATE
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner = auth.uid()
  )
)
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses WHERE owner = auth.uid()
  )
);

-- Política para DELETE (eliminar retos)
CREATE POLICY "Users can delete challenges from their businesses"
ON challenges
FOR DELETE
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner = auth.uid()
  )
);

-- =====================================================
-- FUNCIÓN PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
-- =====================================================

-- Crear o reemplazar la función trigger
CREATE OR REPLACE FUNCTION update_challenges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger
DROP TRIGGER IF EXISTS trigger_update_challenges_updated_at ON challenges;
CREATE TRIGGER trigger_update_challenges_updated_at
BEFORE UPDATE ON challenges
FOR EACH ROW
EXECUTE FUNCTION update_challenges_updated_at();

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que las políticas estén creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'challenges';

-- Verificar que RLS esté habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'challenges';

-- =====================================================
-- DATOS DE PRUEBA (OPCIONAL)
-- =====================================================

/*
-- Ejemplo de inserción de un reto de prueba
-- Reemplaza 'YOUR_BUSINESS_ID' con un ID válido de tu tabla businesses

INSERT INTO challenges (
  name,
  description,
  points,
  challenge_type,
  target_value,
  is_repeatable,
  max_completions_per_day,
  start_date,
  end_date,
  is_active,
  business_id
) VALUES (
  'Compra matutina',
  'Realiza una compra entre las 6:00 AM y 10:00 AM',
  50,
  'horario_visita',
  6001000, -- Codifica 06:00 - 10:00
  true,
  1,
  NOW(),
  NOW() + INTERVAL '30 days',
  true,
  YOUR_BUSINESS_ID
);
*/

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

/*
1. Las políticas RLS garantizan que:
   - Los usuarios solo pueden ver/editar/eliminar retos de sus propias sucursales
   - No se puede acceder a retos de otros usuarios

2. El campo 'target_value' almacena valores codificados según el tipo:
   - monto_minimo: Valor directo en USD (ej: 100)
   - horario_visita: HHMM*10000 + HHMM (ej: 9001700 = 09:00 a 17:00)
   - frecuencia_visitas: visitas*1000 + dias (ej: 5007 = 5 visitas en 7 días)
   - categoria_producto: 0 (la categoría se guarda en otro campo o relación)

3. Los índices mejoran el rendimiento de las consultas

4. El trigger actualiza automáticamente 'updated_at' en cada UPDATE
*/
