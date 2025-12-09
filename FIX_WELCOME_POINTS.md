# Fix: Puntos de Bienvenida solo en Primera Visita

## 🐛 Problema Identificado

Los puntos de bienvenida (10 puntos) se estaban otorgando **en cada check-in** vía WhatsApp, en lugar de solo en la primera visita histórica del usuario.

### Comportamiento Incorrecto (Antes)
- Primera visita WhatsApp: 10 puntos ✓
- Segunda visita WhatsApp: +10 puntos (total 20) ❌
- Tercera visita WhatsApp: +10 puntos (total 30) ❌
- Y así sucesivamente...

### Comportamiento Correcto (Ahora)
- Primera visita WhatsApp: 10 puntos de bienvenida ✓
- Segunda visita WhatsApp: 0 puntos, solo incrementa contador de visitas ✓
- Tercera visita WhatsApp: 0 puntos, solo incrementa contador de visitas ✓

## ✅ Solución Implementada

### Cambios en `app/api/webhooks/whatsapp/route.ts`

**1. Verificar si es primera visita (líneas 557-565):**
```typescript
// 3. Verificar si ya existe la relación para determinar si es primera visita
const { data: existingRelationship } = await supabase
  .from('customer_businesses')
  .select('id')
  .eq('customer_id', context.customer.id)
  .eq('business_settings_id', businessSettings.id)
  .single()

const isFirstVisit = !existingRelationship
```

**2. Solo otorgar puntos en primera visita (líneas 567-578):**
```typescript
// 4. Crear o actualizar la relación customer-business
// ⚠️ IMPORTANTE: Solo dar puntos de bienvenida en la PRIMERA visita histórica
const WELCOME_BONUS_POINTS = 10
const pointsToAward = isFirstVisit ? WELCOME_BONUS_POINTS : 0

const { relationship, isNew: isNewRelationship } = await getOrCreateCustomerBusiness(
  context.customer.id,
  businessSettings.id,
  pointsToAward,  // 10 puntos solo si es primera visita, 0 si ya visitó antes
  branch?.id,
  supabase
)
```

**3. Actualizar mensajes de confirmación (líneas 632-642):**
```typescript
const message = `✅ *Check-in exitoso*

¡Bienvenido a *${businessName}*!
📍 Sucursal: ${branchName}

${isFirstVisit ? `🎉 ¡Es tu primera visita a este negocio! Has ganado ${WELCOME_BONUS_POINTS} puntos de bienvenida.\n\n` : ''}${!isFirstVisit ? '✨ *Visita registrada exitosamente*\n\n' : ''}${isFirstVisit ? `🎁 *Puntos ganados:* ${WELCOME_BONUS_POINTS} puntos de bienvenida\n` : ''}⭐ *Total de puntos en ${businessName}:* ${relationship.total_points || 0} puntos
🏪 *Visitas a ${businessName}:* ${relationship.visits_count || 0} visitas

¡Gracias por visitarnos! Sigue acumulando puntos para obtener recompensas.

Envía *PUNTOS* para ver tu balance completo.`
```

**4. Mejorar notificaciones (líneas 590-610):**
```typescript
// Notificación de check-in
await createNotification({
  business_settings_id: businessSettings.id,
  type: 'checkin',
  title: isFirstVisit ? 'Primer check-in de cliente' : 'Nuevo check-in',
  message: isFirstVisit
    ? `${context.customerName} ha hecho su primer check-in en ${branchName} (${WELCOME_BONUS_POINTS} puntos de bienvenida)`
    : `${context.customerName} ha hecho check-in en ${branchName}`,
  metadata: {
    customer_id: context.customer.id,
    customer_name: context.customerName,
    customer_phone: context.phone,
    branch_id: branch?.id,
    branch_name: branchName,
    points: pointsToAward,
    is_first_visit: isFirstVisit
  },
  priority: isFirstVisit ? 'high' : 'normal'
}, supabase)
```

## 🔍 Comparación con App Móvil

La app móvil (`src/services/checkin.ts`) ya tenía el comportamiento correcto:

```typescript
// Línea 278
const pointsToAward = isFirstVisit ? CHECK_IN_CONFIG.WELCOME_BONUS_POINTS : 0;
```

Ahora el webhook de WhatsApp tiene la misma lógica, asegurando consistencia entre ambos canales.

## 📝 Notas Importantes

1. **Definición de "Primera Visita"**: Se considera primera visita cuando NO existe un registro en `customer_businesses` para ese cliente y negocio específico.

2. **Independencia entre negocios**: Los puntos de bienvenida son por negocio (business_settings). Si un usuario se registra en otro negocio diferente, recibirá 10 puntos de bienvenida nuevamente.

3. **Independencia entre canales**: No importa si el usuario se registró primero por WhatsApp o por la app móvil:
   - Si se registra por WhatsApp primero → 10 puntos
   - Luego hace check-in por app → 0 puntos (ya está registrado)
   - O viceversa ✓

4. **Contador de visitas**: El contador de visitas se incrementa en cada check-in, independientemente de si se otorgan puntos o no.

## ✅ Testing

Para probar el fix:

1. Registrar un usuario nuevo por WhatsApp → Debe recibir 10 puntos
2. Hacer check-in nuevamente con el mismo usuario → Debe recibir 0 puntos
3. Verificar que el contador de visitas sí se incremente
4. Hacer lo mismo desde la app móvil → Debe mantener la consistencia

## 🎯 Resultado

Los puntos de bienvenida ahora se otorgan correctamente **SOLO en la primera visita histórica** del usuario a un negocio específico, sin importar el canal (WhatsApp o app móvil).
