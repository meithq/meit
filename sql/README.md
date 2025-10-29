# Scripts SQL para Supabase - Tabla Users

## 📋 Índice

1. [Configuración Inicial](#1-configuración-inicial)
2. [Políticas RLS](#2-políticas-rls)
3. [Pruebas y Verificación](#3-pruebas-y-verificación)
4. [Solución de Problemas](#4-solución-de-problemas)

---

## 1. Configuración Inicial

### Migración: Agregar columnas first_time y auth

Esta migración agrega las columnas necesarias para el sistema de onboarding de usuarios.

**Archivo:** `migration_add_first_time.sql`

**Columnas agregadas:**
- `first_time` (boolean): Indica si es la primera vez que el usuario inicia sesión
- `auth` (uuid): Referencia al usuario en la tabla `auth.users`

**Pasos para ejecutar:**

1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor** en el menú lateral
3. Copia y pega el contenido de `migration_add_first_time.sql`
4. Haz clic en **Run**

---

## 2. Políticas RLS

### Configurar Row Level Security

**Archivo:** `rls_policies_users.sql`

Este script crea **4 políticas de seguridad** para la tabla `users`:

#### 📖 Política de Lectura (SELECT)
- ✅ Los usuarios pueden leer **su propia información**
- ✅ Funciona con columna `id` o `auth`

```sql
-- Permite: SELECT * FROM users WHERE id = auth.uid()
```

#### ✏️ Política de Actualización (UPDATE)
- ✅ Los usuarios pueden actualizar **su propia información**
- ✅ Permite cambiar: `first_time`, `name`, `updated_at`, etc.
- ❌ NO permite cambiar: `id`, `auth`, `role`, `email`

```sql
-- Permite: UPDATE users SET first_time = false WHERE id = auth.uid()
```

#### ➕ Política de Inserción (INSERT)
- ✅ Los usuarios pueden crear **su propio registro** durante signup
- ✅ El `id` o `auth` debe coincidir con `auth.uid()`

```sql
-- Permite: INSERT INTO users (id, auth, email, name) VALUES (auth.uid(), ...)
```

#### 🔐 Política Service Role
- ✅ El service role tiene **acceso completo**
- ✅ Útil para operaciones del backend

**Pasos para ejecutar:**

1. Abre **SQL Editor** en Supabase
2. Copia y pega el contenido de `rls_policies_users.sql`
3. Haz clic en **Run**
4. Verifica que se crearon 4 políticas

---

## 3. Pruebas y Verificación

### Script de Pruebas

**Archivo:** `test_rls_policies.sql`

Este script te ayuda a verificar que todo funcione correctamente:

**Pasos:**

1. Abre **SQL Editor** en Supabase
2. Copia el contenido de `test_rls_policies.sql`
3. **IMPORTANTE:** Reemplaza `'TU_USER_ID'` con un ID real de tu tabla
4. Ejecuta cada sección por separado para diagnosticar

**Qué verifica:**

- ✅ RLS está habilitado
- ✅ Las 4 políticas existen
- ✅ Los usuarios tienen valores correctos en `first_time` y `auth`
- ✅ No hay datos NULL donde no deberían estar

---

## 4. Solución de Problemas

### ❌ Error: "new row violates row-level security policy"

**Causa:** El usuario está intentando insertar/actualizar sin tener permisos.

**Solución:**
1. Verifica que las políticas estén creadas correctamente
2. Asegúrate de que `auth.uid()` coincida con el `id` o `auth` del usuario

```sql
-- Verificar coincidencia
SELECT id, auth, id = auth.uid() as "ID coincide", auth = auth.uid() as "Auth coincide"
FROM users
WHERE id = auth.uid() OR auth = auth.uid();
```

### ❌ Error: "No rows were updated"

**Causa:** El `id` del usuario no coincide con ningún registro en la tabla.

**Solución:**
```sql
-- Buscar usuarios sin link correcto
SELECT id, email, auth,
  CASE
    WHEN auth IS NULL THEN '⚠️ Falta columna auth'
    WHEN id != auth THEN '⚠️ ID y auth no coinciden'
    ELSE '✅ OK'
  END as estado
FROM users;

-- Arreglar si es necesario
UPDATE users
SET auth = id
WHERE auth IS NULL OR auth != id;
```

### ❌ Error: first_time no se actualiza

**Causa:** Políticas RLS bloqueando la actualización o columna no existe.

**Solución:**
```sql
-- 1. Verificar que la columna existe
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'first_time';

-- 2. Verificar políticas UPDATE
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'users' AND cmd = 'UPDATE';

-- 3. Probar actualización manual
UPDATE users
SET first_time = false
WHERE id = 'TU_USER_ID';
```

---

## 📊 Verificación Final

Ejecuta este query para un resumen completo:

```sql
SELECT
  '✅ RLS Habilitado' as check,
  EXISTS(SELECT 1 FROM pg_tables WHERE tablename = 'users' AND rowsecurity = true) as resultado
UNION ALL
SELECT
  '✅ Políticas Creadas',
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'users') >= 4
UNION ALL
SELECT
  '✅ Columna first_time',
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'first_time')
UNION ALL
SELECT
  '✅ Columna auth',
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'auth');
```

**Resultado esperado:** Todos deben ser `true`

---

## 🔄 Orden de Ejecución

1. ✅ `migration_add_first_time.sql` - Agregar columnas
2. ✅ `rls_policies_users.sql` - Configurar políticas de seguridad
3. ✅ `test_rls_policies.sql` - Verificar que todo funciona
4. ✅ `verify_setup.sql` - Verificación rápida del estado

---

## 📝 Notas Importantes

- ✅ Todas las migraciones son **idempotentes** (puedes ejecutarlas múltiples veces)
- ✅ Los usuarios existentes tendrán `first_time = false` automáticamente
- ✅ Los nuevos usuarios tendrán `first_time = true` por defecto
- ✅ El service role siempre tiene acceso completo
- ⚠️ **NUNCA** deshabilites RLS en producción

---

## 🆘 Soporte

Si encuentras algún problema:

1. Revisa los logs en la consola del navegador (F12)
2. Ejecuta `test_rls_policies.sql` para diagnóstico
3. Verifica las políticas con: `SELECT * FROM pg_policies WHERE tablename = 'users';`
