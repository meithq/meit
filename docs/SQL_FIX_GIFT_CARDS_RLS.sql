-- =====================================================
-- Fix Gift Cards RLS Policies
-- =====================================================
-- Este script corrige las políticas RLS de gift_cards
-- para asegurar que los usuarios puedan contar y ver
-- las gift cards correctamente

-- Primero verificar si la tabla existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'gift_cards') THEN
    RAISE NOTICE 'Table gift_cards does not exist. Please run SQL_GIFT_CARDS.sql first';
  ELSE
    RAISE NOTICE 'Table gift_cards exists';
  END IF;
END
$$;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view gift cards from their businesses" ON gift_cards;
DROP POLICY IF EXISTS "Users can insert gift cards for their businesses" ON gift_cards;
DROP POLICY IF EXISTS "Users can update gift cards from their businesses" ON gift_cards;
DROP POLICY IF EXISTS "Users can delete gift cards from their businesses" ON gift_cards;

-- Asegurar que RLS está habilitado
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;

-- Política SELECT: Los usuarios pueden ver gift cards de clientes de sus negocios
CREATE POLICY "Users can view gift cards from their businesses"
ON gift_cards
FOR SELECT
TO authenticated
USING (
  business_settings_id IN (
    SELECT id FROM business_settings WHERE owner = auth.uid()
  )
);

-- Política INSERT: Los usuarios pueden insertar gift cards para sus negocios
CREATE POLICY "Users can insert gift cards for their businesses"
ON gift_cards
FOR INSERT
TO authenticated
WITH CHECK (
  business_settings_id IN (
    SELECT id FROM business_settings WHERE owner = auth.uid()
  )
);

-- Política UPDATE: Los usuarios pueden actualizar gift cards de sus negocios
CREATE POLICY "Users can update gift cards from their businesses"
ON gift_cards
FOR UPDATE
TO authenticated
USING (
  business_settings_id IN (
    SELECT id FROM business_settings WHERE owner = auth.uid()
  )
)
WITH CHECK (
  business_settings_id IN (
    SELECT id FROM business_settings WHERE owner = auth.uid()
  )
);

-- Política DELETE: Los usuarios pueden eliminar gift cards de sus negocios
CREATE POLICY "Users can delete gift cards from their businesses"
ON gift_cards
FOR DELETE
TO authenticated
USING (
  business_settings_id IN (
    SELECT id FROM business_settings WHERE owner = auth.uid()
  )
);

-- Verificar las políticas
SELECT
  tablename,
  policyname,
  cmd,
  roles,
  permissive,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'gift_cards'
ORDER BY cmd, policyname;

-- Verificar que la tabla existe y tiene datos
SELECT
  COUNT(*) as total_gift_cards,
  COUNT(*) FILTER (WHERE status = 'active') as active_gift_cards,
  COUNT(*) FILTER (WHERE status = 'redeemed') as redeemed_gift_cards,
  COUNT(*) FILTER (WHERE status = 'expired') as expired_gift_cards
FROM gift_cards;
