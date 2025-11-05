-- =====================================================
-- SQL para tabla POINTS_AUDIT (Auditoría de asignación de puntos)
-- =====================================================

-- Crear tabla de auditoría para trackear asignaciones de puntos
CREATE TABLE IF NOT EXISTS points_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Quién realizó la acción
  operator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Quién autorizó la acción (admin que proporcionó el PIN)
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- A qué cliente se le asignaron puntos
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Qué sucursal
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  -- Detalles de la transacción
  points_assigned INTEGER NOT NULL,
  challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL,

  -- Metadata adicional
  notes TEXT
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_points_audit_operator_id ON points_audit(operator_id);
CREATE INDEX IF NOT EXISTS idx_points_audit_admin_id ON points_audit(admin_id);
CREATE INDEX IF NOT EXISTS idx_points_audit_customer_id ON points_audit(customer_id);
CREATE INDEX IF NOT EXISTS idx_points_audit_business_id ON points_audit(business_id);
CREATE INDEX IF NOT EXISTS idx_points_audit_created_at ON points_audit(created_at);

-- =====================================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS en la tabla
ALTER TABLE points_audit ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view audit logs from their businesses" ON points_audit;
DROP POLICY IF EXISTS "Users can insert audit logs for their businesses" ON points_audit;

-- Política para SELECT (ver auditoría)
-- Los usuarios pueden ver los registros de auditoría de sus negocios
CREATE POLICY "Users can view audit logs from their businesses"
ON points_audit
FOR SELECT
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner = auth.uid()
  )
);

-- Política para INSERT (crear registros de auditoría)
-- Los usuarios pueden crear registros de auditoría para sus negocios
CREATE POLICY "Users can insert audit logs for their businesses"
ON points_audit
FOR INSERT
TO authenticated
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses WHERE owner = auth.uid()
  )
);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que las políticas estén creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'points_audit';

-- Verificar que RLS esté habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'points_audit';

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

/*
1. Esta tabla registra TODAS las asignaciones de puntos de retos

2. Campos importantes:
   - operator_id: Usuario que realizó la acción (puede ser admin o operador)
   - admin_id: Admin cuyo PIN se usó para autorizar
   - customer_id: Cliente que recibió los puntos
   - business_id: Sucursal donde se realizó
   - points_assigned: Cantidad de puntos asignados
   - challenge_id: Reto completado (puede ser NULL si es asignación manual)

3. Las políticas RLS aseguran que:
   - Los usuarios solo pueden ver/crear registros de sus propios negocios
   - Se mantiene la trazabilidad completa

4. Los índices mejoran el rendimiento de consultas de auditoría
*/
