-- ============================================================================
-- TABLA DE RELACIÓN: customer_businesses
-- Relación muchos-a-muchos entre customers y businesses
-- ============================================================================

-- Crear tabla de relación
CREATE TABLE IF NOT EXISTS customer_businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Referencias
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  -- Información específica de la relación
  total_points INTEGER DEFAULT 0, -- Puntos del cliente en este negocio específico
  lifetime_points INTEGER DEFAULT 0, -- Puntos totales históricos en este negocio
  visits_count INTEGER DEFAULT 0, -- Total de visitas a este negocio

  -- Fechas importantes
  first_visit_at TIMESTAMPTZ DEFAULT NOW(), -- Primera visita a este negocio
  last_visit_at TIMESTAMPTZ DEFAULT NOW(), -- Última visita a este negocio

  -- Estado
  is_active BOOLEAN DEFAULT TRUE, -- Si la relación está activa

  -- Metadata adicional (opcional)
  notes TEXT, -- Notas del negocio sobre este cliente
  tags TEXT[], -- Tags para categorizar clientes

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: Un cliente no puede estar registrado dos veces en el mismo negocio
  UNIQUE(customer_id, business_id)
);

-- ============================================================================
-- ÍNDICES para mejorar rendimiento
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_customer_businesses_customer_id
  ON customer_businesses(customer_id);

CREATE INDEX IF NOT EXISTS idx_customer_businesses_business_id
  ON customer_businesses(business_id);

CREATE INDEX IF NOT EXISTS idx_customer_businesses_is_active
  ON customer_businesses(is_active);

CREATE INDEX IF NOT EXISTS idx_customer_businesses_last_visit
  ON customer_businesses(last_visit_at DESC);

-- ============================================================================
-- HABILITAR REALTIME para actualizaciones en tiempo real
-- ============================================================================

ALTER TABLE customer_businesses REPLICA IDENTITY FULL;

-- ============================================================================
-- TRIGGER para actualizar updated_at automáticamente
-- ============================================================================

CREATE OR REPLACE FUNCTION update_customer_businesses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_customer_businesses_updated_at_trigger ON customer_businesses;
CREATE TRIGGER update_customer_businesses_updated_at_trigger
  BEFORE UPDATE ON customer_businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_businesses_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE customer_businesses ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a usuarios autenticados (solo sus propios negocios)
CREATE POLICY "Users can view their business customers"
  ON customer_businesses
  FOR SELECT
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner = auth.uid()
    )
  );

-- Política para permitir inserción a usuarios autenticados (solo en sus negocios)
CREATE POLICY "Users can add customers to their businesses"
  ON customer_businesses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE owner = auth.uid()
    )
  );

-- Política para permitir actualización a usuarios autenticados (solo sus negocios)
CREATE POLICY "Users can update their business customers"
  ON customer_businesses
  FOR UPDATE
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner = auth.uid()
    )
  );

-- Política para permitir eliminación a usuarios autenticados (solo sus negocios)
CREATE POLICY "Users can remove customers from their businesses"
  ON customer_businesses
  FOR DELETE
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner = auth.uid()
    )
  );

-- Política para permitir acceso completo desde service_role (webhooks)
CREATE POLICY "Allow service role full access to customer_businesses"
  ON customer_businesses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- VISTAS ÚTILES (opcional)
-- ============================================================================

-- Vista para obtener clientes con información del negocio
CREATE OR REPLACE VIEW customer_businesses_with_details AS
SELECT
  cb.*,
  c.phone,
  c.name as customer_name,
  c.email,
  c.is_active as customer_is_active,
  b.name as business_name,
  b.address as business_address,
  b.owner as business_owner
FROM customer_businesses cb
JOIN customers c ON cb.customer_id = c.id
JOIN businesses b ON cb.business_id = b.id;

-- ============================================================================
-- DATOS DE EJEMPLO (opcional - comentar en producción)
-- ============================================================================

-- Ejemplo de cómo se vería la relación:
-- INSERT INTO customer_businesses (customer_id, business_id, total_points, visits_count)
-- VALUES
--   ('customer-uuid-1', 1, 50, 5),
--   ('customer-uuid-1', 2, 30, 3),
--   ('customer-uuid-2', 1, 100, 10);
