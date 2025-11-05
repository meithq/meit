-- =====================================================
-- Tabla de gift cards generadas
-- =====================================================

CREATE TABLE IF NOT EXISTS gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Relación con el cliente y negocio
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  business_settings_id BIGINT NOT NULL REFERENCES business_settings(id) ON DELETE CASCADE,

  -- Código único de la gift card
  code VARCHAR(20) NOT NULL UNIQUE,

  -- Información de la gift card
  value NUMERIC(10, 2) NOT NULL, -- Valor en USD
  points_used INTEGER NOT NULL, -- Puntos que se usaron para generarla

  -- Estado y vencimiento
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, redeemed, expired, cancelled
  expires_at TIMESTAMPTZ NOT NULL,
  redeemed_at TIMESTAMPTZ,

  -- Notificación
  notification_sent BOOLEAN DEFAULT FALSE,

  -- Índices para mejorar performance
  CONSTRAINT gift_cards_status_check CHECK (status IN ('active', 'redeemed', 'expired', 'cancelled'))
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_gift_cards_customer ON gift_cards(customer_id);
CREATE INDEX IF NOT EXISTS idx_gift_cards_business ON gift_cards(business_settings_id);
CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_cards_status ON gift_cards(status);
CREATE INDEX IF NOT EXISTS idx_gift_cards_expires_at ON gift_cards(expires_at);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_gift_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gift_cards_updated_at
  BEFORE UPDATE ON gift_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_gift_cards_updated_at();

-- =====================================================
-- Políticas RLS (Row Level Security)
-- =====================================================

ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver gift cards de clientes de sus negocios
CREATE POLICY "Users can view gift cards from their businesses"
ON gift_cards
FOR SELECT
TO authenticated
USING (
  business_settings_id IN (
    SELECT id FROM business_settings WHERE owner = auth.uid()
  )
);

-- Los usuarios pueden insertar gift cards para sus negocios
CREATE POLICY "Users can insert gift cards for their businesses"
ON gift_cards
FOR INSERT
TO authenticated
WITH CHECK (
  business_settings_id IN (
    SELECT id FROM business_settings WHERE owner = auth.uid()
  )
);

-- Los usuarios pueden actualizar gift cards de sus negocios
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

-- Los usuarios pueden eliminar gift cards de sus negocios
CREATE POLICY "Users can delete gift cards from their businesses"
ON gift_cards
FOR DELETE
TO authenticated
USING (
  business_settings_id IN (
    SELECT id FROM business_settings WHERE owner = auth.uid()
  )
);

-- =====================================================
-- Función para generar código único de gift card
-- =====================================================

CREATE OR REPLACE FUNCTION generate_gift_card_code()
RETURNS VARCHAR(20) AS $$
DECLARE
  chars VARCHAR(32) := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Sin I, O, 0, 1 para evitar confusión
  result VARCHAR(20) := 'GC-';
  i INTEGER;
BEGIN
  -- Generar código de 12 caracteres (GC-XXXX-XXXX-XXXX)
  FOR i IN 1..12 LOOP
    IF i IN (5, 9) THEN
      result := result || '-';
    ELSE
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END IF;
  END LOOP;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Comentarios en las columnas
-- =====================================================

COMMENT ON TABLE gift_cards IS 'Gift cards generadas automáticamente cuando los clientes alcanzan los puntos requeridos';
COMMENT ON COLUMN gift_cards.code IS 'Código único de la gift card (formato: GC-XXXX-XXXX-XXXX)';
COMMENT ON COLUMN gift_cards.value IS 'Valor de la gift card en USD';
COMMENT ON COLUMN gift_cards.points_used IS 'Cantidad de puntos que se usaron para generar esta gift card';
COMMENT ON COLUMN gift_cards.status IS 'Estado: active, redeemed, expired, cancelled';
COMMENT ON COLUMN gift_cards.expires_at IS 'Fecha de vencimiento de la gift card';
COMMENT ON COLUMN gift_cards.redeemed_at IS 'Fecha en que se canjeó la gift card';
COMMENT ON COLUMN gift_cards.notification_sent IS 'Indica si se envió la notificación al cliente';
