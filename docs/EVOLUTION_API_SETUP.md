# Configuración de Evolution API para Registro Automático de Clientes

Esta guía te ayudará a configurar Evolution API para registrar automáticamente a los clientes cuando envíen mensajes por WhatsApp.

## Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Paso 1: Crear la tabla de clientes en Supabase](#paso-1-crear-la-tabla-de-clientes-en-supabase)
3. [Paso 2: Configurar variables de entorno](#paso-2-configurar-variables-de-entorno)
4. [Paso 3: Instalar Evolution API](#paso-3-instalar-evolution-api)
5. [Paso 4: Crear una instancia y conectar WhatsApp](#paso-4-crear-una-instancia-y-conectar-whatsapp)
6. [Paso 5: Configurar el webhook](#paso-5-configurar-el-webhook)
7. [Paso 6: Probar la integración](#paso-6-probar-la-integración)
8. [Troubleshooting](#troubleshooting)

---

## Requisitos Previos

- Cuenta de Supabase activa
- Servidor (VPS, Docker, o servicio cloud) para hospedar Evolution API
- Número de teléfono con WhatsApp para usar como número de negocio
- Tu aplicación Next.js desplegada (o usando ngrok para desarrollo)

---

## Paso 1: Crear la tabla de clientes en Supabase

### 1.1 Ir al SQL Editor en Supabase

1. Ingresa a tu proyecto en [Supabase](https://supabase.com)
2. Ve a la sección **SQL Editor**
3. Crea una nueva query

### 1.2 Ejecutar el siguiente SQL

```sql
-- Crear tabla de clientes
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL, -- Número de WhatsApp sin formato
  name TEXT NOT NULL, -- Nombre del perfil de WhatsApp
  email TEXT,
  points INTEGER DEFAULT 0, -- Puntos acumulados
  total_checkins INTEGER DEFAULT 0, -- Total de check-ins
  first_message_at TIMESTAMPTZ DEFAULT NOW(), -- Primer mensaje/registro
  last_message_at TIMESTAMPTZ DEFAULT NOW(), -- Último mensaje
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB, -- Información adicional
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a usuarios autenticados
CREATE POLICY "Allow authenticated users to read customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para permitir inserción a usuarios autenticados
CREATE POLICY "Allow authenticated users to insert customers"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para permitir actualización a usuarios autenticados
CREATE POLICY "Allow authenticated users to update customers"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política para permitir acceso desde service_role (para webhooks)
CREATE POLICY "Allow service role full access to customers"
  ON customers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

---

## Paso 2: Configurar variables de entorno

Agrega estas variables a tu archivo `.env.local`:

```bash
# Evolution API
EVOLUTION_API_KEY=tu_clave_secreta_aqui_generala_con_openssl_rand_base64_32
EVOLUTION_API_URL=https://tu-evolution-api.com # URL de tu instancia de Evolution API

# Supabase (probablemente ya las tienes)
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

**Importante:** La `EVOLUTION_API_KEY` debe ser la misma que configures en Evolution API.

---

## Paso 3: Instalar Evolution API

### Opción A: Usando Docker (Recomendado)

```bash
# Clonar el repositorio
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api

# Crear archivo de configuración
cp .env.example .env

# Editar .env con tus configuraciones
nano .env
```

Configuración mínima en `.env`:

```bash
# Server
SERVER_URL=https://tu-dominio.com
SERVER_PORT=8080

# Database (opcional, usa SQLite por defecto)
DATABASE_ENABLED=true
DATABASE_PROVIDER=postgresql
DATABASE_CONNECTION_URI=postgresql://user:password@localhost:5432/evolution

# Authentication
AUTHENTICATION_API_KEY=tu_clave_secreta_aqui_la_misma_del_paso_2

# Webhook Global (configuraremos webhooks por instancia después)
WEBHOOK_GLOBAL_ENABLED=false
```

```bash
# Iniciar con Docker Compose
docker-compose up -d
```

### Opción B: Instalación manual

Ver documentación oficial: https://doc.evolution-api.com/v1/en/install/

---

## Paso 4: Crear una instancia y conectar WhatsApp

### 4.1 Crear una instancia

Usando Postman, cURL o cualquier cliente HTTP:

```bash
curl -X POST https://tu-evolution-api.com/instance/create \
  -H "apikey: tu_clave_secreta_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "negocio_principal",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS"
  }'
```

Respuesta:

```json
{
  "instance": {
    "instanceName": "negocio_principal",
    "status": "created"
  },
  "qrcode": {
    "code": "data:image/png;base64,..."
  }
}
```

### 4.2 Escanear el QR Code

1. Copia el código QR que recibiste en la respuesta
2. Abre WhatsApp en tu teléfono
3. Ve a **Dispositivos vinculados** → **Vincular un dispositivo**
4. Escanea el código QR

### 4.3 Verificar conexión

```bash
curl -X GET https://tu-evolution-api.com/instance/connectionState/negocio_principal \
  -H "apikey: tu_clave_secreta_aqui"
```

Deberías ver:

```json
{
  "state": "open",
  "statusReason": "connected"
}
```

---

## Paso 5: Configurar el webhook

### 5.1 Configurar webhook para la instancia

```bash
curl -X POST https://tu-evolution-api.com/webhook/set/negocio_principal \
  -H "apikey: tu_clave_secreta_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://tu-app.vercel.app/api/webhooks/whatsapp",
    "webhook_by_events": true,
    "webhook_base64": false,
    "events": [
      "MESSAGES_UPSERT"
    ],
    "webhook_headers": {
      "apikey": "tu_clave_secreta_aqui"
    }
  }'
```

**Importante:**
- `url`: La URL de tu aplicación Next.js + `/api/webhooks/whatsapp`
- `webhook_headers.apikey`: La misma clave que tienes en `EVOLUTION_API_KEY`
- `events`: Solo necesitamos `MESSAGES_UPSERT` para capturar mensajes entrantes

### 5.2 Verificar webhook configurado

```bash
curl -X GET https://tu-evolution-api.com/webhook/find/negocio_principal \
  -H "apikey: tu_clave_secreta_aqui"
```

---

## Paso 6: Probar la integración

### 6.1 Enviar un mensaje de prueba

1. Desde otro teléfono, envía un mensaje de WhatsApp al número que conectaste
2. Escribe cualquier mensaje, por ejemplo: "Hola"

### 6.2 Verificar en los logs

Revisa los logs de tu aplicación Next.js (Vercel, consola local, etc.):

```
Webhook received: {
  event: 'messages.upsert',
  instance: 'negocio_principal',
  sender: '5491112345678@s.whatsapp.net'
}

Processing message: {
  phone: '5491112345678',
  name: 'Juan Pérez',
  message: 'Hola'
}
```

### 6.3 Verificar en Supabase

Ve a la tabla `customers` en Supabase y verifica que se haya creado el registro:

| id | phone | name | points | first_message_at |
|----|-------|------|--------|------------------|
| uuid... | 5491112345678 | Juan Pérez | 0 | 2024-01-15... |

### 6.4 Probar endpoint GET

```bash
curl https://tu-app.vercel.app/api/webhooks/whatsapp
```

Deberías recibir:

```json
{
  "status": "ok",
  "message": "WhatsApp webhook endpoint is running",
  "timestamp": "2024-01-15T..."
}
```

---

## Troubleshooting

### Problema: El webhook no recibe eventos

**Solución:**

1. Verifica que Evolution API esté funcionando:
   ```bash
   curl https://tu-evolution-api.com/instance/connectionState/negocio_principal \
     -H "apikey: tu_clave_secreta_aqui"
   ```

2. Verifica que el webhook esté configurado:
   ```bash
   curl https://tu-evolution-api.com/webhook/find/negocio_principal \
     -H "apikey: tu_clave_secreta_aqui"
   ```

3. Verifica los logs de Evolution API:
   ```bash
   docker logs evolution-api
   ```

### Problema: Error 401 Unauthorized en el webhook

**Solución:**

Verifica que el `apikey` en el header del webhook sea el mismo que tienes en `EVOLUTION_API_KEY`:

```bash
# En el webhook config
"webhook_headers": {
  "apikey": "debe_ser_igual_a_EVOLUTION_API_KEY"
}
```

### Problema: Cliente no se crea en Supabase

**Solución:**

1. Verifica que la tabla `customers` exista
2. Verifica las políticas de RLS (Row Level Security)
3. Verifica que las variables de entorno de Supabase estén correctas
4. Revisa los logs de Next.js para ver errores específicos

### Problema: Error CORS en desarrollo local

**Solución:**

Si estás probando en local, usa [ngrok](https://ngrok.com/) para exponer tu servidor:

```bash
ngrok http 3000
```

Usa la URL de ngrok en la configuración del webhook.

---

## Próximos pasos

Una vez que la integración esté funcionando:

1. **Mensaje automático de bienvenida:** Puedes usar la API de Evolution para enviar un mensaje automático cuando se registre un nuevo cliente

2. **Sistema de puntos:** Integrar con el sistema de check-ins para otorgar puntos

3. **Notificaciones:** Enviar notificaciones por WhatsApp cuando el cliente acumule suficientes puntos

4. **Gift cards:** Enviar gift cards por WhatsApp automáticamente

---

## Recursos adicionales

- [Documentación oficial de Evolution API](https://doc.evolution-api.com/v1/en/get-started/introduction)
- [API Reference de Evolution](https://doc.evolution-api.com/v1/en/endpoints/instance)
- [Supabase Documentation](https://supabase.com/docs)

---

## Soporte

Si tienes problemas, revisa:
1. Los logs de Evolution API
2. Los logs de tu aplicación Next.js
3. La tabla `customers` en Supabase
4. Las políticas de RLS en Supabase
