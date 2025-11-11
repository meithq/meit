-- ============================================================================
-- TABLA: notifications
-- Descripción: Sistema de notificaciones para eventos del negocio
-- ============================================================================

-- 1. Crear la tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relación con el negocio
  business_settings_id INTEGER NOT NULL REFERENCES business_settings(id) ON DELETE CASCADE,

  -- Tipo de notificación
  type VARCHAR(50) NOT NULL,
  -- Tipos posibles:
  -- 'checkin' - Cliente hizo check-in
  -- 'gift_card_generated' - Se generó una gift card
  -- 'gift_card_redeemed' - Se canjeó una gift card
  -- 'points_assigned' - Se asignaron puntos manualmente
  -- 'customer_milestone' - Cliente alcanzó un hito (ej: 1000 puntos)
  -- 'challenge_completed' - Cliente completó un reto
  -- 'new_customer' - Nuevo cliente registrado

  -- Contenido de la notificación
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,

  -- Datos adicionales (JSON)
  metadata JSONB DEFAULT '{}',
  -- Ejemplo de metadata:
  -- {
  --   "customer_id": "uuid",
  --   "customer_name": "Juan Pérez",
  --   "customer_phone": "584121234567",
  --   "branch_id": 1,
  --   "branch_name": "Sucursal Centro",
  --   "points": 10,
  --   "gift_card_code": "GC-12345",
  --   "amount": 100
  -- }

  -- Estado
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,

  -- Prioridad (para ordenar o destacar)
  priority VARCHAR(20) DEFAULT 'normal',
  -- 'low', 'normal', 'high', 'urgent'

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Índices para búsquedas rápidas
  CONSTRAINT notifications_type_check CHECK (
    type IN (
      'checkin',
      'gift_card_generated',
      'gift_card_redeemed',
      'points_assigned',
      'customer_milestone',
      'challenge_completed',
      'new_customer'
    )
  ),
  CONSTRAINT notifications_priority_check CHECK (
    priority IN ('low', 'normal', 'high', 'urgent')
  )
);

-- 2. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_notifications_business_settings
  ON notifications(business_settings_id);

CREATE INDEX IF NOT EXISTS idx_notifications_type
  ON notifications(type);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read
  ON notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_unread_by_business
  ON notifications(business_settings_id, is_read, created_at DESC);

-- 3. Habilitar Realtime para la tabla
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 5. Política: Los usuarios solo pueden ver sus propias notificaciones
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  USING (
    business_settings_id IN (
      SELECT id FROM business_settings WHERE owner = auth.uid()
    )
  );

-- 6. Política: Los usuarios pueden marcar como leídas sus notificaciones
CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
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

-- 7. Política: Service role puede crear notificaciones (webhooks)
CREATE POLICY "Service role can insert notifications"
  ON notifications
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 8. Política: Los usuarios pueden eliminar sus notificaciones
CREATE POLICY "Users can delete their own notifications"
  ON notifications
  FOR DELETE
  USING (
    business_settings_id IN (
      SELECT id FROM business_settings WHERE owner = auth.uid()
    )
  );

-- ============================================================================
-- FUNCIÓN: Crear notificación automáticamente
-- ============================================================================

CREATE OR REPLACE FUNCTION create_notification(
  p_business_settings_id INTEGER,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_message TEXT,
  p_metadata JSONB DEFAULT '{}',
  p_priority VARCHAR(20) DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    business_settings_id,
    type,
    title,
    message,
    metadata,
    priority
  ) VALUES (
    p_business_settings_id,
    p_type,
    p_title,
    p_message,
    p_metadata,
    p_priority
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCIÓN: Marcar notificación como leída
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_notification_as_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications
  SET
    is_read = true,
    read_at = NOW()
  WHERE id = p_notification_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCIÓN: Marcar todas las notificaciones como leídas
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_all_notifications_as_read(p_business_settings_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET
    is_read = true,
    read_at = NOW()
  WHERE
    business_settings_id = p_business_settings_id
    AND is_read = false;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCIÓN: Limpiar notificaciones antiguas (más de 30 días)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE
    created_at < NOW() - INTERVAL '30 days'
    AND is_read = true;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- EJEMPLOS DE USO
-- ============================================================================

-- Ejemplo 1: Crear notificación de check-in
/*
SELECT create_notification(
  1, -- business_settings_id
  'checkin',
  'Nuevo check-in',
  'Juan Pérez ha hecho check-in en Sucursal Centro',
  '{"customer_id": "uuid-123", "customer_name": "Juan Pérez", "customer_phone": "584121234567", "branch_name": "Sucursal Centro", "points": 10}'::jsonb,
  'normal'
);
*/

-- Ejemplo 2: Crear notificación de gift card generada
/*
SELECT create_notification(
  1, -- business_settings_id
  'gift_card_generated',
  'Gift Card Generada',
  'María García ha canjeado una gift card de $50',
  '{"customer_id": "uuid-456", "customer_name": "María García", "gift_card_code": "GC-12345", "amount": 50, "points_used": 500}'::jsonb,
  'high'
);
*/

-- Ejemplo 3: Obtener notificaciones no leídas de un negocio
/*
SELECT
  id,
  type,
  title,
  message,
  metadata,
  priority,
  created_at
FROM notifications
WHERE
  business_settings_id = 1
  AND is_read = false
ORDER BY
  priority DESC,
  created_at DESC;
*/

-- Ejemplo 4: Marcar notificación como leída
/*
SELECT mark_notification_as_read('uuid-notification');
*/

-- Ejemplo 5: Marcar todas como leídas
/*
SELECT mark_all_notifications_as_read(1);
*/

-- Ejemplo 6: Contar notificaciones no leídas
/*
SELECT COUNT(*) as unread_count
FROM notifications
WHERE
  business_settings_id = 1
  AND is_read = false;
*/

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Ver estructura de la tabla
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- Ver políticas RLS
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'notifications';

-- Ver índices
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'notifications';
