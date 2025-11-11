-- =====================================================
-- Tabla de Redenciones de Gift Cards
-- =====================================================
-- Esta tabla registra quién redimió cada gift card,
-- guardando tanto el operador como el admin que autorizó

CREATE TABLE IF NOT EXISTS gift_card_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Relaciones
  gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  business_settings_id BIGINT NOT NULL REFERENCES business_settings(id) ON DELETE CASCADE,

  -- Usuarios involucrados
  operator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Información de la redención
  gift_card_value NUMERIC(10, 2) NOT NULL,
  notes TEXT,

  -- Índices
  CONSTRAINT gift_card_redemptions_unique UNIQUE(gift_card_id)
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_gift_card_redemptions_gift_card_id ON gift_card_redemptions(gift_card_id);
CREATE INDEX IF NOT EXISTS idx_gift_card_redemptions_customer_id ON gift_card_redemptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_gift_card_redemptions_business_settings_id ON gift_card_redemptions(business_settings_id);
CREATE INDEX IF NOT EXISTS idx_gift_card_redemptions_operator_id ON gift_card_redemptions(operator_id);
CREATE INDEX IF NOT EXISTS idx_gift_card_redemptions_admin_id ON gift_card_redemptions(admin_id);
CREATE INDEX IF NOT EXISTS idx_gift_card_redemptions_created_at ON gift_card_redemptions(created_at DESC);

-- =====================================================
-- Políticas RLS (Row Level Security)
-- =====================================================

ALTER TABLE gift_card_redemptions ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver redenciones de sus negocios
CREATE POLICY "Users can view redemptions from their businesses"
ON gift_card_redemptions
FOR SELECT
TO authenticated
USING (
  business_settings_id IN (
    SELECT id FROM business_settings WHERE owner = auth.uid()
  )
);

-- Los usuarios pueden insertar redenciones para sus negocios
CREATE POLICY "Users can insert redemptions for their businesses"
ON gift_card_redemptions
FOR INSERT
TO authenticated
WITH CHECK (
  business_settings_id IN (
    SELECT id FROM business_settings WHERE owner = auth.uid()
  )
);

-- Comentarios
COMMENT ON TABLE gift_card_redemptions IS 'Registra las redenciones de gift cards con información del operador y admin';
COMMENT ON COLUMN gift_card_redemptions.operator_id IS 'Usuario que realizó la operación de redención';
COMMENT ON COLUMN gift_card_redemptions.admin_id IS 'Admin que autorizó la redención con su PIN';
COMMENT ON COLUMN gift_card_redemptions.gift_card_value IS 'Valor de la gift card al momento de redimir';
