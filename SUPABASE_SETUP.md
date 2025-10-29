# Configuración de Supabase para MEIT

Este documento te guiará a través de la configuración de Supabase para tu proyecto MEIT.

## 📋 Requisitos Previos

- Una cuenta en [Supabase](https://supabase.com)
- Node.js instalado
- Git instalado

## 🚀 Pasos de Configuración

### 1. Crear un Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) e inicia sesión
2. Haz clic en "New Project"
3. Completa la información:
   - **Nombre del proyecto**: MEIT
   - **Database Password**: Guarda esta contraseña de forma segura
   - **Región**: Selecciona la más cercana a tus usuarios
4. Haz clic en "Create new project" y espera 1-2 minutos

### 2. Obtener las Credenciales

1. Ve a **Settings** > **API** en tu proyecto de Supabase
2. Copia los siguientes valores:
   - **Project URL** (ej: `https://xxxxx.supabase.co`)
   - **anon/public key** (la clave pública)
   - **service_role key** (opcional, solo para operaciones del servidor)

### 3. Configurar Variables de Entorno

1. Crea un archivo `.env.local` en la raíz del proyecto:
   ```bash
   cp .env.example .env.local
   ```

2. Edita `.env.local` y agrega tus credenciales:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```

### 4. Configurar Autenticación

#### Habilitar Proveedores de OAuth

1. Ve a **Authentication** > **Providers** en Supabase
2. Para habilitar Google:
   - Ve a [Google Cloud Console](https://console.cloud.google.com)
   - Crea un proyecto y habilita Google+ API
   - Ve a "Credentials" > "Create Credentials" > "OAuth client ID"
   - Tipo de aplicación: "Web application"
   - Authorized redirect URIs: `https://tu-proyecto.supabase.co/auth/v1/callback`
   - Copia Client ID y Client Secret
   - Pégalos en Supabase en el proveedor de Google
   - Habilita el proveedor

#### Configurar URLs de Redirección

1. Ve a **Authentication** > **URL Configuration**
2. Agrega a **Redirect URLs**:
   - `http://localhost:3000/auth/callback` (desarrollo)
   - `https://tu-dominio.com/auth/callback` (producción)

### 5. Crear la Base de Datos

#### Opción A: Usar el Editor SQL de Supabase

1. Ve a **SQL Editor** en Supabase
2. Crea las tablas necesarias. Ejemplo:

```sql
-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";

-- Tabla de comercios
create table public.comercios (
  id uuid default uuid_generate_v4() primary key,
  nombre text not null,
  tipo text,
  telefono text,
  direccion text,
  puntos_por_dolar decimal default 1,
  puntos_gift_card integer default 100,
  valor_gift_card decimal default 10,
  limite_diario integer default 1000,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de usuarios (extendiendo auth.users)
create table public.usuarios (
  id uuid references auth.users on delete cascade primary key,
  nombre text,
  email text unique not null,
  rol text default 'empleado',
  comercio_id uuid references public.comercios(id),
  estado text default 'activo',
  ultimo_acceso timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de sucursales
create table public.sucursales (
  id uuid default uuid_generate_v4() primary key,
  comercio_id uuid references public.comercios(id) not null,
  nombre text not null,
  direccion text,
  telefono text,
  estado text default 'activa',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de clientes
create table public.clientes (
  id uuid default uuid_generate_v4() primary key,
  comercio_id uuid references public.comercios(id) not null,
  nombre text not null,
  email text,
  telefono text unique,
  puntos integer default 0,
  total_compras decimal default 0,
  ultima_visita timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de gift cards
create table public.gift_cards (
  id uuid default uuid_generate_v4() primary key,
  comercio_id uuid references public.comercios(id) not null,
  cliente_id uuid references public.clientes(id) not null,
  codigo text unique not null,
  valor decimal not null,
  estado text default 'activa',
  fecha_expiracion timestamp with time zone,
  fecha_uso timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de retos
create table public.retos (
  id uuid default uuid_generate_v4() primary key,
  comercio_id uuid references public.comercios(id) not null,
  titulo text not null,
  descripcion text,
  puntos integer not null,
  meta integer not null,
  completados_hoy integer default 0,
  estado text default 'activo',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de transacciones
create table public.transacciones (
  id uuid default uuid_generate_v4() primary key,
  comercio_id uuid references public.comercios(id) not null,
  cliente_id uuid references public.clientes(id) not null,
  tipo text not null, -- 'compra', 'canje', 'regalo'
  monto decimal,
  puntos integer,
  descripcion text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS)
alter table public.comercios enable row level security;
alter table public.usuarios enable row level security;
alter table public.sucursales enable row level security;
alter table public.clientes enable row level security;
alter table public.gift_cards enable row level security;
alter table public.retos enable row level security;
alter table public.transacciones enable row level security;

-- Políticas de seguridad (ejemplos básicos)
-- Los usuarios solo pueden ver datos de su comercio
create policy "Users can view own comercio data"
  on public.comercios for select
  using (id in (
    select comercio_id from public.usuarios where id = auth.uid()
  ));

create policy "Users can view own comercio clientes"
  on public.clientes for select
  using (comercio_id in (
    select comercio_id from public.usuarios where id = auth.uid()
  ));

-- Función para actualizar updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers para actualizar updated_at
create trigger update_comercios_updated_at before update on public.comercios
  for each row execute procedure update_updated_at_column();

create trigger update_usuarios_updated_at before update on public.usuarios
  for each row execute procedure update_updated_at_column();

create trigger update_sucursales_updated_at before update on public.sucursales
  for each row execute procedure update_updated_at_column();

create trigger update_clientes_updated_at before update on public.clientes
  for each row execute procedure update_updated_at_column();

create trigger update_retos_updated_at before update on public.retos
  for each row execute procedure update_updated_at_column();
```

#### Opción B: Generar tipos TypeScript

Para obtener tipos TypeScript de tu base de datos:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Generar tipos
npx supabase gen types typescript --project-id TU_PROJECT_ID > types/supabase.ts
```

### 6. Configurar Storage

1. Ve a **Storage** en Supabase
2. Crea los siguientes buckets:
   - `avatares` - Para fotos de perfil (público)
   - `logos` - Para logos de comercios (público)
   - `documentos` - Para documentos internos (privado)

3. Configura las políticas de acceso según necesites

### 7. Probar la Configuración

1. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Ve a `http://localhost:3000/registro`
3. Intenta crear una cuenta
4. Si todo funciona, deberías ver al usuario en **Authentication** > **Users** en Supabase

## 📚 Recursos Útiles

- **Cliente del navegador**: `lib/supabase/client.ts`
- **Cliente del servidor**: `lib/supabase/server.ts`
- **Funciones de Auth**: `lib/supabase/auth.ts`
- **Funciones de DB**: `lib/supabase/database.ts`
- **Funciones de Storage**: `lib/supabase/storage.ts`
- **Hooks de React**: `hooks/use-supabase.ts`

## 🔒 Seguridad

- ✅ Nunca expongas tu `service_role_key` en el código del cliente
- ✅ Usa Row Level Security (RLS) para proteger tus datos
- ✅ Valida todos los datos en el servidor antes de insertarlos
- ✅ Usa políticas de Storage para controlar el acceso a archivos
- ✅ Agrega `.env.local` a `.gitignore`

## 🐛 Problemas Comunes

### Error: "Invalid API key"
- Verifica que las variables de entorno estén correctamente configuradas
- Reinicia el servidor de desarrollo después de cambiar `.env.local`

### Error: "Row Level Security policy violation"
- Asegúrate de haber configurado las políticas RLS correctamente
- Verifica que el usuario tenga los permisos necesarios

### OAuth no funciona
- Verifica que las URLs de redirección estén configuradas correctamente
- Asegúrate de que el proveedor OAuth esté habilitado en Supabase

## 📞 Soporte

- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)
