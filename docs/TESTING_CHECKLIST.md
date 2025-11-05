# 📋 Checklist de Pruebas - Sistema Multi-Negocio

## ✅ 1. Verificar Base de Datos

### Ejecutar script de verificación
```sql
-- Copiar y ejecutar el contenido de: docs/VERIFY_CUSTOMER_BUSINESSES.sql
```

**Resultados esperados:**
- ✅ Tabla `customer_businesses` existe con columnas: id, customer_id, business_id, total_points, lifetime_points, visits_count, etc.
- ✅ 4-5 índices creados (idx_customer_businesses_customer_id, idx_customer_businesses_business_id, etc.)
- ✅ 5 políticas RLS activas
- ✅ RLS habilitado (rowsecurity = true)
- ✅ Vista `customer_businesses_with_details` existe

---

## ✅ 2. Preparar Datos de Prueba

### A. Crear/Verificar Negocios en Supabase

**En la UI de tu app (módulo Sucursales):**
1. Ve a "Sucursales"
2. Crea 2 negocios de prueba:
   - **Panadería Central** - Sucursal: Principal
   - **Charcutería Don José** - Sucursal: Local 1

**O consultar negocios existentes:**
```sql
SELECT id, name, address FROM businesses ORDER BY created_at DESC;
```

---

## ✅ 3. Probar Check-in por WhatsApp

### Escenario 1: Primera visita a Panadería Central

1. **Escanear QR de "Panadería Central - Principal"**
   - Debería abrir WhatsApp con mensaje pre-llenado
   - Número: `584126376341`

2. **Enviar el mensaje** (o escribir manualmente):
   ```
   Hola quiero hacer checkin en Panadería Central - Principal
   ```

3. **Verificar respuesta del bot:**
   ```
   ✅ Check-in exitoso

   ¡Bienvenido a Panadería Central!
   📍 Sucursal: Principal

   🎉 ¡Es tu primera visita a este negocio! Has sido registrado.

   🎁 Puntos ganados: 10 puntos
   ⭐ Total de puntos en Panadería Central: 10 puntos
   🏪 Visitas a Panadería Central: 1 visitas
   ```

4. **Verificar en base de datos:**
   ```sql
   -- Ver el cliente creado
   SELECT phone, name, is_active FROM customers ORDER BY created_at DESC LIMIT 1;

   -- Ver la relación customer-business
   SELECT
     cb.*,
     c.phone,
     c.name as customer_name,
     b.name as business_name
   FROM customer_businesses cb
   JOIN customers c ON cb.customer_id = c.id
   JOIN businesses b ON cb.business_id = b.id
   ORDER BY cb.created_at DESC
   LIMIT 1;
   ```

   **Esperado:**
   - ✅ Cliente creado con tu número de WhatsApp
   - ✅ Relación en `customer_businesses` con: total_points=10, visits_count=1

---

### Escenario 2: Segunda visita a Panadería Central

1. **Enviar mensaje de check-in nuevamente:**
   ```
   Hola quiero hacer checkin en Panadería Central - Principal
   ```

2. **Verificar respuesta:**
   ```
   ✅ Check-in exitoso

   ¡Bienvenido a Panadería Central!
   📍 Sucursal: Principal

   🎁 Puntos ganados: 10 puntos
   ⭐ Total de puntos en Panadería Central: 20 puntos
   🏪 Visitas a Panadería Central: 2 visitas
   ```

3. **Verificar actualización:**
   ```sql
   SELECT total_points, visits_count
   FROM customer_businesses
   WHERE customer_id = (SELECT id FROM customers WHERE phone = 'TU_NUMERO')
   AND business_id = (SELECT id FROM businesses WHERE name ILIKE 'Panadería Central');
   ```

   **Esperado:**
   - ✅ total_points = 20
   - ✅ visits_count = 2

---

### Escenario 3: Primera visita a Charcutería Don José

1. **Escanear QR de "Charcutería Don José - Local 1"**

2. **Enviar mensaje:**
   ```
   Hola quiero hacer checkin en Charcutería Don José - Local 1
   ```

3. **Verificar respuesta:**
   ```
   ✅ Check-in exitoso

   ¡Bienvenido a Charcutería Don José!
   📍 Sucursal: Local 1

   🎉 ¡Es tu primera visita a este negocio! Has sido registrado.

   🎁 Puntos ganados: 10 puntos
   ⭐ Total de puntos en Charcutería Don José: 10 puntos
   🏪 Visitas a Charcutería Don José: 1 visitas
   ```

4. **Verificar independencia de puntos:**
   ```sql
   SELECT
     b.name as business_name,
     cb.total_points,
     cb.visits_count
   FROM customer_businesses cb
   JOIN businesses b ON cb.business_id = b.id
   WHERE cb.customer_id = (SELECT id FROM customers WHERE phone = 'TU_NUMERO')
   ORDER BY b.name;
   ```

   **Esperado:**
   - ✅ Charcutería Don José: 10 puntos, 1 visita
   - ✅ Panadería Central: 20 puntos, 2 visitas
   - ✅ **Puntos son independientes** ✨

---

## ✅ 4. Probar Comando PUNTOS

1. **Enviar mensaje:**
   ```
   PUNTOS
   ```

2. **Verificar respuesta con desglose:**
   ```
   ⭐ Balance de Puntos

   Hola [Tu Nombre], aquí está tu resumen:

   📊 Total general: 30 puntos
   🏪 Visitas totales: 3 visitas
   🏢 Negocios registrados: 2

   ━━━━━━━━━━━━━━━━
   Desglose por negocio:

   1. Charcutería Don José
      📍 [dirección]
      ⭐ 10 puntos
      🏪 1 visitas

   2. Panadería Central
      📍 [dirección]
      ⭐ 20 puntos
      🏪 2 visitas
   ━━━━━━━━━━━━━━━━

   ¡Sigue acumulando puntos para canjear por gift cards! 🎁
   ```

   **Esperado:**
   - ✅ Muestra total general sumado
   - ✅ Muestra desglose por negocio
   - ✅ Puntos independientes por negocio

---

## ✅ 5. Probar Módulo de Clientes (UI)

### A. Login en la aplicación
1. Ir a tu aplicación
2. Hacer login con tu cuenta

### B. Navegar a módulo de clientes
1. Click en "Clientes" en el menú

### C. Verificar funcionalidad

**Si tienes múltiples negocios:**
- ✅ Aparece selector de negocios en el header
- ✅ Al seleccionar "Panadería Central" → muestra 1 cliente (tú)
- ✅ Al seleccionar "Charcutería Don José" → muestra 1 cliente (tú)
- ✅ Los puntos mostrados son específicos del negocio seleccionado

**Tarjeta de cliente debe mostrar:**
- ✅ Nombre del cliente
- ✅ Teléfono
- ✅ Puntos en ESE negocio (no globales)
- ✅ Visitas a ESE negocio
- ✅ Última visita

### D. Probar exportación CSV
1. Click en "Exportar CSV"
2. Verificar que el nombre incluye el negocio: `clientes-Panadería-Central-2025-11-04.csv`
3. Abrir CSV y verificar datos correctos

---

## ✅ 6. Pruebas de Errores

### A. Negocio no encontrado
```
Hola quiero hacer checkin en Negocio Inexistente - Sucursal Test
```

**Esperado:**
```
❌ Negocio no encontrado

Lo sentimos, no pudimos encontrar el negocio "Negocio Inexistente" en nuestro sistema.

Por favor verifica el nombre del negocio y vuelve a intentar, o contacta con el personal.
```

### B. Comandos adicionales
- `AYUDA` → Muestra menú de ayuda
- `STOP` → Da de baja al cliente

---

## 📊 Verificación Final

```sql
-- Ver resumen completo de un cliente
SELECT
  c.phone,
  c.name,
  COUNT(DISTINCT cb.business_id) as negocios_registrados,
  SUM(cb.total_points) as puntos_totales,
  SUM(cb.visits_count) as visitas_totales
FROM customers c
LEFT JOIN customer_businesses cb ON c.id = cb.customer_id
WHERE c.phone = 'TU_NUMERO'
GROUP BY c.id, c.phone, c.name;

-- Ver desglose por negocio
SELECT
  b.name as negocio,
  cb.total_points as puntos,
  cb.visits_count as visitas,
  cb.first_visit_at,
  cb.last_visit_at
FROM customer_businesses cb
JOIN businesses b ON cb.business_id = b.id
WHERE cb.customer_id = (SELECT id FROM customers WHERE phone = 'TU_NUMERO')
ORDER BY b.name;
```

---

## 🎯 Resultado Esperado

✅ Los clientes pueden pertenecer a múltiples negocios
✅ Los puntos son completamente independientes por negocio
✅ El módulo de clientes filtra correctamente por negocio
✅ El comando PUNTOS muestra desglose completo
✅ Los check-ins funcionan correctamente

---

## 🐛 Troubleshooting

### Problema: "Business not found"
- Verificar que el nombre del negocio en el mensaje coincida EXACTAMENTE con el nombre en la base de datos
- La búsqueda es case-insensitive (mayúsculas/minúsculas no importan)

### Problema: Cliente no aparece en módulo
- Verificar que el negocio seleccionado sea correcto
- Verificar que existe la relación en `customer_businesses`
- Verificar las políticas RLS en Supabase

### Problema: Puntos no se actualizan
- Verificar logs del webhook en `/api/webhooks/whatsapp`
- Verificar que Evolution API está enviando los webhooks
- Verificar que la API key es correcta

---

**Fecha de creación:** 2025-11-04
**Sistema:** Multi-negocio con puntos independientes
