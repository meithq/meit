# Sistema de Gift Cards - Generación Automática

## Descripción

Sistema automático que genera gift cards cuando los clientes alcanzan los puntos requeridos configurados en el módulo de gift cards.

## Cómo Funciona

1. **Configuración**: El negocio configura en el módulo de Gift Cards:
   - Puntos requeridos para generar una gift card (ej: 300 puntos)
   - Valor de la gift card en USD (ej: $5)
   - Días de vencimiento (ej: 30 días)
   - Máximo de gift cards activas por cliente (ej: 5)

2. **Asignación de Puntos**: Cuando se asignan puntos a un cliente en el POS:
   - Se agregan los puntos a su saldo
   - El sistema verifica automáticamente si tiene suficientes puntos
   - Si califica, genera automáticamente la(s) gift card(s)
   - Resta los puntos usados del saldo del cliente
   - Crea una notificación para el cliente
   - Muestra un toast en el POS

3. **Generación Múltiple**: Si el cliente tiene puntos suficientes para múltiples gift cards:
   - Genera todas las posibles hasta alcanzar el límite de activas
   - Ejemplo: Si tiene 900 puntos y se requieren 300, genera 3 gift cards

4. **Notificaciones**: El cliente recibe:
   - Notificación en el sistema con el código de la gift card
   - El código es único y tiene formato: GC-XXXX-XXXX-XXXX

## Pasos de Implementación

### 1. Ejecutar el SQL

Ejecuta el archivo SQL en tu base de datos de Supabase:

```bash
# Desde la interfaz de Supabase SQL Editor, ejecuta:
/Users/adirsonmartinez/Proyectos/Nextjs/meit/docs/SQL_GIFT_CARDS.sql
```

Este script crea:
- Tabla `gift_cards` con todos los campos necesarios
- Políticas RLS para seguridad
- Función `generate_gift_card_code()` para códigos únicos
- Índices para mejor performance

### 2. Verificar las Tablas

La tabla `gift_cards` contiene:
- `id`: UUID único
- `customer_id`: Referencia al cliente
- `business_settings_id`: Referencia al negocio
- `code`: Código único (GC-XXXX-XXXX-XXXX)
- `value`: Valor en USD
- `points_used`: Puntos que se canjearon
- `status`: Estado (active, redeemed, expired, cancelled)
- `expires_at`: Fecha de vencimiento
- `redeemed_at`: Fecha de canje (null si no se ha canjeado)
- `notification_sent`: Si se envió notificación

### 3. Configurar Gift Cards

En el módulo de Gift Cards de tu aplicación:
1. Ve a "Configuración" > "Gift Cards"
2. Configura los parámetros:
   - Puntos requeridos: 100-500 (predeterminado: 100)
   - Valor: $2-$25 USD (predeterminado: $5)
   - Días de vencimiento: 7-90 (predeterminado: 30)
   - Máximo activas: 1-10 (predeterminado: 5)
3. Guarda los cambios

### 4. Probar el Sistema

1. **Asignar Puntos en POS**:
   - Ve al módulo de POS
   - Selecciona un cliente
   - Selecciona retos que sumen los puntos requeridos o más
   - Ingresa el PIN de admin
   - Los puntos se asignan y automáticamente:
     - Si califica, se genera la gift card
     - Se resta los puntos usados
     - Aparece un toast: "🎁 Gift Card Generada"
     - Se crea una notificación

2. **Verificar en Notificaciones**:
   - Click en el ícono de notificaciones (🔔)
   - Verás la notificación con el código de la gift card

3. **Ver Historial del Cliente**:
   - Ve al módulo de Clientes
   - Click en la card del cliente
   - Verás el historial de puntos con:
     - Puntos asignados (+)
     - Puntos canjeados por gift card (-)

## Archivos Creados

### SQL
- `docs/SQL_GIFT_CARDS.sql` - Tabla y funciones

### TypeScript Types
- `lib/types/gift-cards.ts` - Interfaces y tipos

### Funciones Supabase
- `lib/supabase/gift-cards.ts` - CRUD de gift cards
- `lib/supabase/gift-card-auto-generation.ts` - Lógica de generación automática

### Integraciones
- `components/views/pos-view.tsx` - Llamada automática después de asignar puntos

## Funciones Principales

### `checkAndGenerateGiftCards(customerId, businessSettingsId)`

Verifica si el cliente califica y genera gift cards automáticamente.

**Retorna**: Array de resultados con información de cada gift card generada

**Ejemplo**:
```typescript
const results = await checkAndGenerateGiftCards(
  'customer-uuid',
  123
)

results.forEach(result => {
  if (result.generated) {
    console.log('Gift card:', result.giftCard.code)
  }
})
```

### `getGiftCardEligibilitySummary(customerId, businessSettingsId)`

Obtiene un resumen de elegibilidad del cliente.

**Retorna**:
```typescript
{
  currentPoints: number,        // Puntos actuales
  pointsRequired: number,        // Puntos necesarios
  pointsNeeded: number,          // Puntos que faltan
  canGenerate: boolean,          // Si puede generar
  possibleCards: number,         // Cuántas puede generar
  activeCards: number,           // Cuántas tiene activas
  maxActiveCards: number        // Máximo permitido
}
```

## Flujo de Datos

```
1. Cliente tiene 350 puntos
2. Configuración: 100 puntos = $5 gift card
3. Sistema detecta: puede generar 3 gift cards
4. Verifica límite: máximo 5 activas, tiene 0
5. Genera 3 gift cards:
   - GC-A2B4-C6D8-E9F2 ($5, vence en 30 días)
   - GC-G3H5-J7K9-L1M3 ($5, vence en 30 días)
   - GC-N4P6-Q8R2-S5T7 ($5, vence en 30 días)
6. Resta 300 puntos (3 × 100)
7. Cliente queda con 50 puntos
8. Crea 3 notificaciones
9. Muestra toast en POS
```

## Consideraciones de Seguridad

1. **RLS Habilitado**: Solo los dueños del negocio pueden ver/modificar gift cards
2. **Códigos Únicos**: Generados con caracteres sin confusión (sin I, O, 0, 1)
3. **Vencimiento**: Las gift cards expiran automáticamente
4. **Límites**: Previene acumulación excesiva con límite de activas
5. **Auditoría**: Todas las operaciones quedan registradas

## Próximos Pasos (Opcional)

1. **Webhook para WhatsApp**: Enviar código por WhatsApp cuando se genera
2. **QR Code**: Generar QR con el código de la gift card
3. **Canje**: Implementar sistema de canje en el POS
4. **Dashboard**: Mostrar estadísticas de gift cards en el dashboard
5. **Reportes**: Exportar gift cards generadas/canjeadas

## Troubleshooting

### "No se pudo generar la gift card"
- Verificar que la tabla `gift_cards` existe
- Verificar que la función `generate_gift_card_code()` existe
- Verificar las políticas RLS

### "Customer not found in business"
- Verificar que existe la relación en `customer_businesses`
- El cliente debe haber hecho al menos un check-in

### "Maximum active gift cards reached"
- El cliente ya tiene el máximo de gift cards activas
- Puede esperar a que expire alguna o canjearlas

### No se generan automáticamente
- Verificar configuración en el módulo de Gift Cards
- Verificar que los puntos son suficientes
- Revisar la consola del navegador para logs

## Logs y Debug

El sistema incluye logs detallados en consola:

```
🎁 Checking if customer qualifies for gift cards...
📋 Gift card settings: { points_required: 100, ... }
💰 Customer has 350 points
🎯 Can generate 3 gift cards
🎁 Generating gift card 1 of 3...
✅ Gift card created: GC-A2B4-C6D8-E9F2
💰 Points updated: 250
📧 Notification created
```

Estos logs ayudan a identificar cualquier problema en el flujo.
