# 📘 Guía de Migración a React Query

Esta guía te ayudará a migrar los hooks restantes a React Query para aprovechar el sistema de caching.

---

## 🎯 Por Qué Migrar

**Beneficios:**
- ⚡ Cache automático entre navegaciones
- 🔄 Background refetching
- 🛡️ Error handling con retry automático
- 📊 Loading/error states consistentes
- 🎨 DevTools para debugging
- 📦 Invalidación inteligente de cache

---

## 📋 Patrón de Migración

### Antes (Hook Tradicional)

```typescript
// hooks/use-example.ts
'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';

export function useExample() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const merchantId = useAuthStore((state) => state.merchantId);

  const fetchData = useCallback(async () => {
    if (!merchantId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('table')
        .select('*')
        .eq('merchant_id', merchantId);
      
      if (error) throw error;
      setData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  return { data, loading, error, fetchData };
}
```

### Después (Hook con React Query)

```typescript
// hooks/use-example-query.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth-store';
import { queryKeys } from '@/lib/react-query';

// 1. Función async pura para fetch
async function fetchData(merchantId: string) {
  const { data, error } = await supabase
    .from('table')
    .select('*')
    .eq('merchant_id', merchantId);
  
  if (error) throw new Error(error.message);
  return data;
}

// 2. Hook con useQuery
export function useExample() {
  const merchantId = useAuthStore((state) => state.merchantId);

  return useQuery({
    queryKey: queryKeys.example.list(merchantId || ''),
    queryFn: () => fetchData(merchantId!),
    enabled: !!merchantId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// 3. Hook para mutaciones (crear/actualizar/eliminar)
export function useCreateExample() {
  const queryClient = useQueryClient();
  const merchantId = useAuthStore((state) => state.merchantId);

  return useMutation({
    mutationFn: async (newData) => {
      const { data, error } = await supabase
        .from('table')
        .insert({ ...newData, merchant_id: merchantId });
      
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      // Invalida cache para refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.example.list(merchantId || ''),
      });
    },
  });
}
```

---

## 🔑 Pasos de Migración

### 1. Añadir Query Key

En `src/lib/react-query.ts`, añade la key:

```typescript
export const queryKeys = {
  // ... existing keys
  
  example: {
    all: ['example'] as const,
    lists: () => [...queryKeys.example.all, 'list'] as const,
    list: (merchantId: string, filters?: string) =>
      [...queryKeys.example.lists(), merchantId, filters] as const,
  },
};
```

### 2. Crear Función de Fetch

Extrae la lógica de fetch a una función async pura:

```typescript
async function fetchExamples(merchantId: string, filters?: Filters) {
  let query = supabase
    .from('table')
    .select('*')
    .eq('merchant_id', merchantId);
  
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }
  
  const { data, error } = await query;
  
  if (error) throw new Error(error.message);
  return data;
}
```

### 3. Crear Hook con useQuery

```typescript
export function useExamples(filters?: Filters) {
  const merchantId = useAuthStore((state) => state.merchantId);
  const filterKey = filters ? JSON.stringify(filters) : undefined;

  return useQuery({
    queryKey: queryKeys.example.list(merchantId || '', filterKey),
    queryFn: () => fetchExamples(merchantId!, filters),
    enabled: !!merchantId,
    staleTime: 5 * 60 * 1000,
  });
}
```

### 4. Actualizar Componente

**Antes:**
```typescript
const { data, loading, error, fetchData } = useExample();

useEffect(() => {
  fetchData();
}, [fetchData]);
```

**Después:**
```typescript
const { data, isLoading, error, refetch } = useExamples();

// No useEffect necesario!
// React Query se encarga automáticamente
```

---

## 💡 Casos Comunes

### Paginación

```typescript
export function useExamplesPaginated(page: number = 1, limit: number = 20) {
  const merchantId = useAuthStore((state) => state.merchantId);

  return useQuery({
    queryKey: queryKeys.example.list(merchantId || '', `page-${page}`),
    queryFn: async () => {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, error, count } = await supabase
        .from('table')
        .select('*', { count: 'exact' })
        .eq('merchant_id', merchantId)
        .range(from, to);
      
      if (error) throw new Error(error.message);
      
      return {
        items: data,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    },
    enabled: !!merchantId,
    staleTime: 3 * 60 * 1000,
    // keepPreviousData para evitar "saltos" en UI
    placeholderData: (previousData) => previousData,
  });
}
```

### Búsqueda con Debounce

```typescript
export function useExampleSearch(search: string) {
  const merchantId = useAuthStore((state) => state.merchantId);

  return useQuery({
    queryKey: queryKeys.example.list(merchantId || '', search),
    queryFn: () => fetchExamples(merchantId!, { search }),
    enabled: !!merchantId && search.length >= 3, // Solo busca con 3+ chars
    staleTime: 1 * 60 * 1000, // 1 minuto para búsquedas
  });
}
```

### Infinite Query (Scroll Infinito)

```typescript
export function useExamplesInfinite() {
  const merchantId = useAuthStore((state) => state.merchantId);

  return useInfiniteQuery({
    queryKey: queryKeys.example.list(merchantId || ''),
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from('table')
        .select('*')
        .eq('merchant_id', merchantId)
        .range(pageParam, pageParam + 19);
      
      if (error) throw new Error(error.message);
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length * 20 : undefined;
    },
    enabled: !!merchantId,
  });
}
```

### Mutaciones con Optimistic Updates

```typescript
export function useUpdateExample() {
  const queryClient = useQueryClient();
  const merchantId = useAuthStore((state) => state.merchantId);

  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('table')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    // Optimistic update (UI se actualiza antes de confirmar)
    onMutate: async ({ id, updates }) => {
      // Cancela queries en curso
      await queryClient.cancelQueries({
        queryKey: queryKeys.example.list(merchantId || ''),
      });
      
      // Guarda el valor anterior por si falla
      const previousData = queryClient.getQueryData(
        queryKeys.example.list(merchantId || '')
      );
      
      // Actualiza cache optimísticamente
      queryClient.setQueryData(
        queryKeys.example.list(merchantId || ''),
        (old: any[]) => old.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      );
      
      return { previousData };
    },
    // Si falla, revierte
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        queryKeys.example.list(merchantId || ''),
        context?.previousData
      );
    },
    // Siempre refetch al final
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.example.list(merchantId || ''),
      });
    },
  });
}
```

---

## 🚀 Hooks Pendientes de Migración

### Alta Prioridad
- [ ] `use-branches.ts` → `use-branches-query.ts`
- [ ] `use-challenges.ts` → `use-challenges-query.ts`
- [ ] `use-gift-cards.ts` → `use-gift-cards-query.ts`

### Media Prioridad
- [ ] `use-pos-transaction.ts` → `use-pos-transaction-query.ts`
- [ ] `use-customer-lookup.ts` → `use-customer-lookup-query.ts`
- [ ] `use-points-calculator.ts` → `use-points-calculator-query.ts`

### Baja Prioridad (menos críticos)
- [ ] `use-dashboard-metrics.ts` → Ya migrado en `use-analytics-query.ts`
- [ ] `use-customer-detail.ts` → Migrar solo si se usa frecuentemente

---

## ⚙️ Configuración de staleTime

Guía para elegir `staleTime`:

| Tipo de Dato | staleTime | Razón |
|--------------|-----------|-------|
| Métricas dashboard | 5 min | Datos que cambian poco, OK mostrar stale |
| Lista de clientes | 3 min | Cambia con frecuencia, balance UX/performance |
| Búsquedas | 1 min | Resultados específicos, queremos actualizar |
| Configuración | 10 min | Rara vez cambia, maximizar cache |
| Transacciones recientes | 30 seg | Muy dinámico, actualizar frecuente |

---

## 🐛 Debugging

### React Query DevTools

En development, click en el botón flotante (esquina inferior izquierda):

- **Queries:** Ver todas las queries activas
- **Fresh/Stale:** Estado del cache
- **Fetch Status:** Si está fetching
- **Actions:** Refetch, invalidate manual

### Console Logs

```typescript
const query = useExamples();

console.log({
  data: query.data,
  isLoading: query.isLoading,
  isFetching: query.isFetching,
  isError: query.isError,
  error: query.error,
  status: query.status,
});
```

---

## ✅ Checklist de Migración

Para cada hook migrado:

- [ ] Query key añadida en `react-query.ts`
- [ ] Función fetch extraída y tipada
- [ ] Hook con `useQuery` creado
- [ ] Mutations con `useMutation` (si aplica)
- [ ] `staleTime` apropiado configurado
- [ ] Componente actualizado para usar nuevo hook
- [ ] Eliminados `useEffect` innecesarios
- [ ] Invalidaciones de cache configuradas
- [ ] Probado en desarrollo
- [ ] Hook anterior marcado como deprecated o eliminado

---

## 📚 Recursos

- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Query Keys Best Practices](https://tkdodo.eu/blog/effective-react-query-keys)
- [Mutations Guide](https://tanstack.com/query/latest/docs/react/guides/mutations)
- [Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)

---

## 💬 ¿Necesitas Ayuda?

Si tienes dudas al migrar un hook:

1. Revisa los ejemplos en `use-analytics-query.ts` y `use-customers-query.ts`
2. Consulta esta guía
3. Usa React Query DevTools para debugging
4. Pregunta al equipo si algo no está claro

¡Feliz migración! 🚀


