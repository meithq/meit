# Configuración de Evolution API para Vercel

## Problema Actual
Los mensajes de check-in no registran clientes porque el webhook de Evolution API no está apuntando correctamente a la aplicación en Vercel.

## Solución

### 1. Configurar Webhook en Evolution API

Necesitas configurar el webhook en tu instancia de Evolution API para que envíe los eventos a Vercel.

**URL del Webhook:**
```
https://meitcomercios.vercel.app/api/webhooks/whatsapp
```

**Eventos a escuchar:**
- `messages.upsert` (obligatorio)

**Headers necesarios:**
- `apikey`: `384E8DAF62DB-42EF-9828-54295D8EC688`

#### Cómo configurar el webhook:

**Opción A: Usando la API de Evolution (Recomendado)**

```bash
curl -X POST https://n8n-evolution-api.icf5jx.easypanel.host/webhook/set/meit \
  -H "Content-Type: application/json" \
  -H "apikey: 384E8DAF62DB-42EF-9828-54295D8EC688" \
  -d '{
    "url": "https://meitcomercios.vercel.app/api/webhooks/whatsapp",
    "webhook_by_events": false,
    "webhook_base64": false,
    "events": [
      "messages.upsert"
    ]
  }'
```

**Opción B: Desde el panel de Evolution API**

Si tu instalación de Evolution API tiene panel web:
1. Accede al panel de administración
2. Ve a la instancia `meit`
3. Busca la sección de Webhooks
4. Configura:
   - **URL**: `https://meitcomercios.vercel.app/api/webhooks/whatsapp`
   - **Eventos**: Marca `messages.upsert`
   - **Headers**: Añade `apikey` con el valor de tu API key

### 2. Variables de Entorno en Vercel

Asegúrate de que estas variables estén configuradas en tu proyecto de Vercel:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://yhfmxwleuufwueypmvgm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZm14d2xldXVmd3VleXBtdmdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MzMxNjgsImV4cCI6MjA3NDIwOTE2OH0.Ku9ZqJb557RUVhOuKvFbGI-YWUOZXBzcw_P-eK8rIek
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZm14d2xldXVmd3VleXBtdmdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODYzMzE2OCwiZXhwIjoyMDc0MjA5MTY4fQ.D4cS8KuMSAZia8RmRb1DZFbDcMDSGm-lQXM1T9d-U9E

# Evolution API
EVOLUTION_API_URL=https://n8n-evolution-api.icf5jx.easypanel.host
EVOLUTION_API_KEY=384E8DAF62DB-42EF-9828-54295D8EC688
EVOLUTION_INSTANCE_NAME=meit

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=584126376341
```

#### Cómo añadir variables en Vercel:
1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Añade cada variable (asegúrate de marcarlas para Production, Preview y Development)
4. Después de añadir todas, haz un nuevo deploy

### 3. Verificar que el Webhook funciona

**Probar el endpoint manualmente:**

```bash
# Test GET (debe responder que está funcionando)
curl https://meitcomercios.vercel.app/api/webhooks/whatsapp

# Respuesta esperada:
# {"status":"ok","message":"WhatsApp webhook endpoint is running","timestamp":"..."}
```

**Probar con un mensaje simulado:**

```bash
curl -X POST https://meitcomercios.vercel.app/api/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -H "apikey: 384E8DAF62DB-42EF-9828-54295D8EC688" \
  -d '{
    "event": "messages.upsert",
    "instance": "meit",
    "data": {
      "key": {
        "remoteJid": "584126376341@s.whatsapp.net",
        "fromMe": false,
        "id": "test123"
      },
      "pushName": "Test User",
      "message": {
        "conversation": "Hola quiero hacer checkin en Test Business - Test Branch"
      }
    }
  }'
```

### 4. Verificar Logs en Vercel

1. Ve a tu proyecto en Vercel
2. Pestaña "Logs" o "Functions"
3. Busca logs del endpoint `/api/webhooks/whatsapp`
4. Deberías ver:
   - `Webhook received: { event: 'messages.upsert', ... }`
   - `Processing message: { phone: '...', name: '...', message: '...' }`

### 5. Flujo de Check-in Completo

Cuando un cliente escanea el QR y envía un mensaje:

1. **Cliente** escanea QR → Abre WhatsApp con mensaje prellenado
2. **WhatsApp** → Envía mensaje a tu número (584126376341)
3. **Evolution API** → Recibe el mensaje
4. **Evolution API** → Envía webhook a Vercel: `POST https://meitcomercios.vercel.app/api/webhooks/whatsapp`
5. **Vercel** → Procesa el mensaje:
   - Valida API key
   - Extrae información del cliente
   - Busca o crea el cliente en Supabase
   - Procesa el check-in
   - Envía respuesta de confirmación
6. **Evolution API** → Envía respuesta al cliente por WhatsApp

### 6. Troubleshooting

#### El cliente no recibe respuesta:

**Verificar que Evolution API está conectado:**
```bash
curl https://n8n-evolution-api.icf5jx.easypanel.host/instance/connectionState/meit \
  -H "apikey: 384E8DAF62DB-42EF-9828-54295D8EC688"
```

Respuesta esperada: `{"state":"open"}`

#### El webhook no se está llamando:

1. Verifica que el webhook esté configurado:
```bash
curl https://n8n-evolution-api.icf5jx.easypanel.host/webhook/find/meit \
  -H "apikey: 384E8DAF62DB-42EF-9828-54295D8EC688"
```

2. Si no está configurado o la URL es incorrecta, configúralo de nuevo usando el comando del paso 1.

#### Error 401 Unauthorized:

- Verifica que la variable `EVOLUTION_API_KEY` en Vercel sea la correcta
- Verifica que Evolution API esté enviando el header `apikey`

#### Cliente no se registra:

1. Verifica los logs en Vercel
2. Verifica que el mensaje tenga el formato correcto: `Hola quiero hacer checkin en [Nombre Negocio] - [Nombre Sucursal]`
3. Verifica que el negocio y sucursal existan en la base de datos con esos nombres exactos

### 7. Comandos útiles para monitoreo

**Ver estado de la instancia:**
```bash
curl https://n8n-evolution-api.icf5jx.easypanel.host/instance/connectionState/meit \
  -H "apikey: 384E8DAF62DB-42EF-9828-54295D8EC688"
```

**Ver configuración del webhook:**
```bash
curl https://n8n-evolution-api.icf5jx.easypanel.host/webhook/find/meit \
  -H "apikey: 384E8DAF62DB-42EF-9828-54295D8EC688"
```

**Reiniciar instancia (si es necesario):**
```bash
curl -X PUT https://n8n-evolution-api.icf5jx.easypanel.host/instance/restart/meit \
  -H "apikey: 384E8DAF62DB-42EF-9828-54295D8EC688"
```

## Checklist de Configuración

- [ ] Variables de entorno configuradas en Vercel
- [ ] Nuevo deploy realizado en Vercel
- [ ] Webhook configurado en Evolution API apuntando a Vercel
- [ ] Endpoint de webhook respondiendo correctamente (GET test)
- [ ] Evolution API conectado (`state: "open"`)
- [ ] Negocios y sucursales creados en la base de datos
- [ ] Test de check-in manual funcionando
- [ ] Logs visibles en Vercel

## Notas Importantes

1. **Cada vez que cambies variables de entorno en Vercel, debes hacer un nuevo deploy**
2. **El nombre del negocio y sucursal en el mensaje debe coincidir EXACTAMENTE con los nombres en la base de datos**
3. **El webhook debe estar configurado para el evento `messages.upsert`**
4. **La API key debe coincidir entre Evolution API y las variables de Vercel**
