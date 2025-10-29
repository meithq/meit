# Guía de Uso de Supabase en MEIT

Esta carpeta contiene todas las utilidades para trabajar con Supabase en el proyecto.

## 📁 Estructura

```
lib/supabase/
├── client.ts       # Cliente de Supabase para el navegador
├── server.ts       # Cliente de Supabase para el servidor
├── middleware.ts   # Middleware para manejar sesiones
├── auth.ts         # Funciones de autenticación
├── database.ts     # Helpers para consultas a la DB
└── storage.ts      # Funciones para manejo de archivos
```

## 🔐 Autenticación

### Registro con Email

```typescript
import { signUpWithEmail } from '@/lib/supabase/auth'

async function handleSignUp() {
  try {
    const data = await signUpWithEmail(
      'usuario@ejemplo.com',
      'password123',
      { name: 'Juan Pérez' }
    )
    console.log('Usuario registrado:', data.user)
  } catch (error) {
    console.error('Error al registrar:', error)
  }
}
```

### Login con Email

```typescript
import { signInWithEmail } from '@/lib/supabase/auth'

async function handleLogin() {
  try {
    const data = await signInWithEmail('usuario@ejemplo.com', 'password123')
    console.log('Usuario autenticado:', data.user)
  } catch (error) {
    console.error('Error al iniciar sesión:', error)
  }
}
```

### Login con Google

```typescript
import { signInWithGoogle } from '@/lib/supabase/auth'

async function handleGoogleLogin() {
  try {
    await signInWithGoogle()
    // El usuario será redirigido a Google
  } catch (error) {
    console.error('Error con Google:', error)
  }
}
```

### Cerrar Sesión

```typescript
import { signOut } from '@/lib/supabase/auth'

async function handleSignOut() {
  try {
    await signOut()
    console.log('Sesión cerrada')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}
```

### Obtener Usuario Actual

```typescript
import { getCurrentUser } from '@/lib/supabase/auth'

async function getUser() {
  try {
    const user = await getCurrentUser()
    console.log('Usuario actual:', user)
  } catch (error) {
    console.error('Error al obtener usuario:', error)
  }
}
```

## 🗄️ Base de Datos

### Obtener Todos los Registros

```typescript
import { getAll } from '@/lib/supabase/database'

async function fetchClientes() {
  try {
    const clientes = await getAll<Cliente>('clientes')
    console.log('Clientes:', clientes)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Obtener por ID

```typescript
import { getById } from '@/lib/supabase/database'

async function fetchCliente(id: string) {
  try {
    const cliente = await getById<Cliente>('clientes', id)
    console.log('Cliente:', cliente)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Insertar Registro

```typescript
import { insert } from '@/lib/supabase/database'

async function createCliente() {
  try {
    const newCliente = await insert<Cliente>('clientes', {
      nombre: 'Juan Pérez',
      email: 'juan@ejemplo.com',
      telefono: '1234567890',
      puntos: 0
    })
    console.log('Cliente creado:', newCliente)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Actualizar Registro

```typescript
import { update } from '@/lib/supabase/database'

async function updateCliente(id: string) {
  try {
    const updated = await update<Cliente>('clientes', id, {
      puntos: 100
    })
    console.log('Cliente actualizado:', updated)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Eliminar Registro

```typescript
import { remove } from '@/lib/supabase/database'

async function deleteCliente(id: string) {
  try {
    await remove('clientes', id)
    console.log('Cliente eliminado')
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Búsqueda

```typescript
import { search } from '@/lib/supabase/database'

async function searchClientes(query: string) {
  try {
    const results = await search<Cliente>('clientes', 'nombre', query)
    console.log('Resultados:', results)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Paginación

```typescript
import { getPaginated } from '@/lib/supabase/database'

async function fetchClientesPaginated(page: number) {
  try {
    const result = await getPaginated<Cliente>('clientes', page, 10)
    console.log('Datos:', result.data)
    console.log('Total de páginas:', result.totalPages)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

## 📦 Storage

### Subir Archivo

```typescript
import { uploadFile } from '@/lib/supabase/storage'

async function handleUpload(file: File) {
  try {
    const data = await uploadFile('avatares', `user-${userId}.jpg`, file, {
      cacheControl: '3600',
      upsert: true
    })
    console.log('Archivo subido:', data)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Obtener URL Pública

```typescript
import { getPublicUrl } from '@/lib/supabase/storage'

const avatarUrl = getPublicUrl('avatares', 'user-123.jpg')
console.log('URL:', avatarUrl)
```

### Descargar Archivo

```typescript
import { downloadFile } from '@/lib/supabase/storage'

async function download() {
  try {
    const blob = await downloadFile('documentos', 'reporte.pdf')
    // Crear URL temporal para descarga
    const url = URL.createObjectURL(blob)
    window.open(url)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Eliminar Archivos

```typescript
import { deleteFiles } from '@/lib/supabase/storage'

async function deleteAvatar() {
  try {
    await deleteFiles('avatares', ['user-123.jpg'])
    console.log('Archivo eliminado')
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### Listar Archivos

```typescript
import { listFiles } from '@/lib/supabase/storage'

async function listAvatares() {
  try {
    const files = await listFiles('avatares', '', {
      limit: 10,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' }
    })
    console.log('Archivos:', files)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### URL Firmada (para archivos privados)

```typescript
import { createSignedUrl } from '@/lib/supabase/storage'

async function getPrivateUrl() {
  try {
    const { signedUrl } = await createSignedUrl('documentos', 'privado.pdf', 3600)
    console.log('URL firmada:', signedUrl)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

## ⚛️ Hooks de React

### useSupabase

```typescript
'use client'

import { useSupabase } from '@/hooks/use-supabase'

function MyComponent() {
  const supabase = useSupabase()

  async function fetchData() {
    const { data } = await supabase.from('clientes').select('*')
    console.log(data)
  }

  return <button onClick={fetchData}>Cargar datos</button>
}
```

### useUser

```typescript
'use client'

import { useUser } from '@/hooks/use-supabase'

function ProfileComponent() {
  const { user, loading } = useUser()

  if (loading) return <div>Cargando...</div>
  if (!user) return <div>No autenticado</div>

  return (
    <div>
      <h1>Hola, {user.email}</h1>
      <p>ID: {user.id}</p>
    </div>
  )
}
```

## 🔒 Uso del Servidor

Para operaciones del servidor (Server Components, Route Handlers, Server Actions):

```typescript
import { createClient } from '@/lib/supabase/server'

export async function ServerComponent() {
  const supabase = await createClient()

  const { data: clientes } = await supabase.from('clientes').select('*')

  return (
    <div>
      {clientes?.map(cliente => (
        <div key={cliente.id}>{cliente.nombre}</div>
      ))}
    </div>
  )
}
```

## 🌐 Uso del Cliente

Para operaciones del cliente (Client Components):

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

export function ClientComponent() {
  const supabase = createClient()

  async function loadData() {
    const { data } = await supabase.from('clientes').select('*')
    console.log(data)
  }

  return <button onClick={loadData}>Cargar</button>
}
```

## 📝 Consejos

1. **Siempre usa try/catch** para manejar errores
2. **Usa el cliente del servidor** en Server Components y Route Handlers
3. **Usa el cliente del navegador** en Client Components
4. **Configura RLS** (Row Level Security) en tus tablas de Supabase
5. **No expongas** el service_role_key en el cliente
6. **Valida los datos** antes de insertarlos en la base de datos
