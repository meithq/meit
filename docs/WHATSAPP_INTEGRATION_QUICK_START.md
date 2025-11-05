# WhatsApp Integration - Quick Start

## Resumen

Esta integración permite que los clientes se registren automáticamente en tu plataforma cuando envíen un mensaje por WhatsApp.

## Archivos creados

### Backend

- **`lib/types/evolution-api.ts`** - Tipos TypeScript para webhooks de Evolution API
- **`lib/supabase/customers-types.ts`** - Tipos para la tabla de clientes
- **`lib/supabase/customers.ts`** - Funciones para gestionar clientes en Supabase
- **`app/api/webhooks/whatsapp/route.ts`** - API endpoint que recibe webhooks de Evolution API

### Documentación

- **`docs/EVOLUTION_API_SETUP.md`** - Guía completa de configuración paso a paso

## Checklist de configuración

- [ ] 1. Ejecutar SQL en Supabase para crear tabla `customers`
- [ ] 2. Agregar variables de entorno en `.env.local`
- [ ] 3. Instalar y configurar Evolution API
- [ ] 4. Crear instancia en Evolution API y conectar WhatsApp
- [ ] 5. Configurar webhook apuntando a tu aplicación
- [ ] 6. Probar enviando un mensaje desde otro número

## Variables de entorno requeridas

```bash
EVOLUTION_API_KEY=tu_clave_secreta
EVOLUTION_API_URL=https://tu-evolution-api.com
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## Flujo de trabajo

```
Cliente envía mensaje por WhatsApp
         ↓
Evolution API captura el mensaje
         ↓
Webhook envía datos a /api/webhooks/whatsapp
         ↓
Verificación de API key
         ↓
Extracción de teléfono y nombre
         ↓
Buscar cliente en Supabase
         ↓
Si no existe → Crear nuevo cliente
Si existe → Actualizar last_message_at
         ↓
Responder con éxito
```

## Endpoints

### Webhook (POST)
```
POST /api/webhooks/whatsapp
Headers: apikey: tu_clave_secreta
```

### Health Check (GET)
```
GET /api/webhooks/whatsapp
```

## Estructura de la tabla customers

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único del cliente |
| phone | TEXT | Número de WhatsApp (ej: 5491112345678) |
| name | TEXT | Nombre del perfil de WhatsApp |
| email | TEXT | Email (opcional) |
| points | INTEGER | Puntos acumulados |
| total_checkins | INTEGER | Total de check-ins |
| first_message_at | TIMESTAMPTZ | Fecha del primer mensaje |
| last_message_at | TIMESTAMPTZ | Fecha del último mensaje |
| is_active | BOOLEAN | Estado del cliente |
| metadata | JSONB | Información adicional |
| created_at | TIMESTAMPTZ | Fecha de creación |
| updated_at | TIMESTAMPTZ | Fecha de actualización |

## Testing

### 1. Verificar que el endpoint está funcionando

```bash
curl https://tu-app.vercel.app/api/webhooks/whatsapp
```

Respuesta esperada:
```json
{
  "status": "ok",
  "message": "WhatsApp webhook endpoint is running",
  "timestamp": "2024-01-15T..."
}
```

### 2. Enviar mensaje de prueba

1. Desde otro teléfono, envía un mensaje al número conectado
2. Verifica los logs de tu aplicación
3. Verifica la tabla `customers` en Supabase

### 3. Verificar webhook en Evolution API

```bash
curl https://tu-evolution-api.com/webhook/find/negocio_principal \
  -H "apikey: tu_clave_secreta"
```

## Próximas funcionalidades sugeridas

1. **Mensaje de bienvenida automático**
   - Enviar mensaje cuando se registra un nuevo cliente
   - Explicar cómo funciona el sistema de puntos

2. **Comandos por WhatsApp**
   - `/puntos` - Consultar puntos acumulados
   - `/sucursales` - Ver lista de sucursales
   - `/ayuda` - Obtener ayuda

3. **Notificaciones automáticas**
   - Avisar cuando tenga suficientes puntos para gift card
   - Recordar gift cards próximas a vencer

4. **Check-in por WhatsApp**
   - Permitir check-ins enviando un código o ubicación

## Documentación completa

Ver `docs/EVOLUTION_API_SETUP.md` para la guía completa paso a paso.

## Soporte

Para problemas comunes, consulta la sección de Troubleshooting en la documentación completa.
