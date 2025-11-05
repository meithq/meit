-- =====================================================
-- Hacer la política de points_audit más flexible
-- =====================================================

-- Eliminar política existente
DROP POLICY IF EXISTS "Users can create audit records for their customers" ON points_audit;

-- Crear política que permite insertar si:
-- 1. El customer_id pertenece a sus negocios, O
-- 2. El business_id es null (para casos donde no hay business específico)
CREATE POLICY "Users can create audit records for their customers"
ON points_audit
FOR INSERT
TO authenticated
WITH CHECK (
  -- Permitir si el customer pertenece a sus negocios
  customer_id IN (
    SELECT cb.customer_id
    FROM customer_businesses cb
    INNER JOIN business_settings bs ON cb.business_settings_id = bs.id
    WHERE bs.owner = auth.uid()
  )
  OR
  -- O permitir si business_id es null y customer pertenece a sus negocios
  (
    business_id IS NULL
    AND customer_id IN (
      SELECT cb.customer_id
      FROM customer_businesses cb
      INNER JOIN business_settings bs ON cb.business_settings_id = bs.id
      WHERE bs.owner = auth.uid()
    )
  )
);

-- Verificar la política
SELECT
  tablename,
  policyname,
  cmd,
  roles,
  permissive
FROM pg_policies
WHERE tablename = 'points_audit'
AND cmd = 'INSERT';
