# 🏗️ Arquitectura: Sistema de Feedback Instantáneo

## 📊 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                      DashboardLayout                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    LoadingBar                              │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │   [=========>              ] 45%                     │  │  │
│  │  │   (Barra de progreso global - z-index: 50)          │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────────────────────────────┐    │
│  │              │  │         Main Content                  │    │
│  │   Sidebar    │  │                                       │    │
│  │              │  │  (Children del layout)                │    │
│  │ ┌──────────┐ │  │                                       │    │
│  │ │Dashboard │ │  │                                       │    │
│  │ └──────────┘ │  │                                       │    │
│  │ ┌──────────┐ │  │                                       │    │
│  │ │Clientes ⏳│ │  │  ← Item con feedback instantáneo     │    │
│  │ └──────────┘ │  │                                       │    │
│  │ ┌──────────┐ │  │                                       │    │
│  │ │Sucursales│ │  │                                       │    │
│  │ └──────────┘ │  │                                       │    │
│  │              │  │                                       │    │
│  └──────────────┘  └──────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  1. USER CLICK                                                   │
│     │                                                            │
│     ├─> SidebarItemComponent.handleClick()                      │
│     │                                                            │
│     └─> e.preventDefault()  ← Previene navegación default       │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  2. INSTANT FEEDBACK (< 16ms)                                    │
│     │                                                            │
│     ├─> navigate(href)                                          │
│     │   └─> setPendingPath(href)  ← Estado actualiza AHORA!     │
│     │                                                            │
│     ├─> Component re-renders                                    │
│     │   ├─> isPending = true                                    │
│     │   ├─> bg-primary-100  ← Color cambia                      │
│     │   ├─> cursor-wait     ← Cursor cambia                     │
│     │   └─> <Loader2 />     ← Spinner aparece                   │
│     │                                                            │
│     └─> USER VE FEEDBACK INMEDIATO ✅                            │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  3. NAVIGATION START (useTransition)                             │
│     │                                                            │
│     ├─> startTransition(() => {                                 │
│     │     router.push(href)                                     │
│     │   })                                                       │
│     │                                                            │
│     └─> No bloquea UI ← React sigue responsive                  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  4. LOADING BAR ACTIVATION                                       │
│     │                                                            │
│     ├─> usePathname() detecta cambio pendiente                  │
│     │                                                            │
│     ├─> setIsLoading(true)                                      │
│     │   └─> Barra aparece en top                                │
│     │                                                            │
│     └─> Progreso animado: 0% → 90%                              │
│         (Nunca llega a 100 hasta que termine)                   │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  5. NEXT.JS NAVIGATION                                           │
│     │                                                            │
│     ├─> Fetch página (con prefetch si disponible)               │
│     │                                                            │
│     ├─> Server Component render                                 │
│     │                                                            │
│     └─> Client hydration                                        │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  6. NAVIGATION COMPLETE                                          │
│     │                                                            │
│     ├─> pathname actualiza                                      │
│     │                                                            │
│     ├─> useEffect en LoadingBar detecta cambio                  │
│     │   └─> setProgress(100)                                    │
│     │   └─> setTimeout → setIsLoading(false)                    │
│     │                                                            │
│     ├─> useEffect en useNavigationTransition                    │
│     │   └─> setPendingPath(null)                                │
│     │                                                            │
│     └─> Sidebar actualiza estado activo                         │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  7. CLEANUP & READY                                              │
│     │                                                            │
│     ├─> Barra desaparece con fade                               │
│     ├─> Spinner desaparece                                      │
│     ├─> Item activo actualiza estilo                            │
│     └─> Sistema listo para próxima navegación ✅                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🧩 Componentes del Sistema

### 1. useNavigationTransition Hook

```typescript
┌─────────────────────────────────────────────────┐
│      useNavigationTransition()                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  State:                                         │
│  • isPending (useTransition)                    │
│  • pendingPath (useState)                       │
│                                                 │
│  Methods:                                       │
│  • navigate(href)      → Navega con feedback    │
│  • isNavigating(href)  → Check si está loading  │
│                                                 │
│  Effects:                                       │
│  • Limpia pendingPath cuando pathname cambia   │
│                                                 │
│  Returns:                                       │
│  { isPending, pendingPath, navigate, isNav... } │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 2. NavigationContext

```typescript
┌─────────────────────────────────────────────────┐
│       NavigationContext                         │
├─────────────────────────────────────────────────┤
│                                                 │
│  Provider: SidebarComponent                     │
│  └─> Envuelve todo el sidebar                   │
│                                                 │
│  Value (memoizado):                             │
│  • navigate: (href) => void                     │
│  • isNavigating: (href) => boolean              │
│                                                 │
│  Consumers:                                     │
│  • SidebarItemComponent (cada item)             │
│                                                 │
│  Benefit:                                       │
│  • Evita prop drilling                          │
│  • Estado compartido eficiente                  │
│  • Re-renders mínimos                           │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 3. SidebarItemComponent

```typescript
┌─────────────────────────────────────────────────┐
│        SidebarItemComponent                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  Props:                                         │
│  • item: SidebarItem                            │
│  • isActive: boolean                            │
│  • collapsed: boolean                           │
│                                                 │
│  Context:                                       │
│  • useNavigationContext()                       │
│    └─> navigate, isNavigating                   │
│                                                 │
│  State:                                         │
│  • isPending = isNavigating(item.href)          │
│                                                 │
│  Render:                                        │
│  <Link>                                         │
│    {isPending && <LoadingOverlay />}            │
│    <Icon />                                     │
│    <Label />                                    │
│  </Link>                                        │
│                                                 │
│  Classes (dynamic):                             │
│  • Normal: text-neutral-700                     │
│  • Active: bg-primary-50 text-primary-700       │
│  • Pending: bg-primary-100 opacity-80 + spinner │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 4. LoadingBar Component

```typescript
┌─────────────────────────────────────────────────┐
│           LoadingBar                            │
├─────────────────────────────────────────────────┤
│                                                 │
│  Detects:                                       │
│  • usePathname() changes                        │
│                                                 │
│  State:                                         │
│  • isLoading: boolean                           │
│  • progress: number (0-100)                     │
│                                                 │
│  Effect on pathname change:                     │
│  1. setIsLoading(true)                          │
│  2. Start progress interval                     │
│     └─> Increment progress asintóticamente      │
│  3. Complete after timeout                      │
│     └─> setProgress(100)                        │
│     └─> setTimeout → hide bar                   │
│                                                 │
│  Render:                                        │
│  {isLoading && (                                │
│    <div className="fixed top-0 z-50">           │
│      <div style={{width: `${progress}%`}} />    │
│    </div>                                       │
│  )}                                             │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 🎯 Estado Visual Timeline

```
TIME:  0ms     16ms    100ms   500ms   1000ms  1500ms
       │       │       │       │       │       │
CLICK  ●───────┼───────┼───────┼───────┼───────┼──────>
       │       │       │       │       │       │
ITEM   └──●────┼───────┼───────┼───────┼───────┼─────> Color change
       │  │    │       │       │       │       │
SPIN   │  └────●───────┼───────┼───────┼───────┼─────> Spinner appears
       │       │       │       │       │       │
BAR    │       └───────●───────┼───────┼───────┼─────> Bar starts
       │       │       │   ────●───────┼───────┼─────> Progress 20%
       │       │       │       │   ────●───────┼─────> Progress 50%
       │       │       │       │       │   ────●─────> Progress 90%
       │       │       │       │       │       │
NAV    │       │       │       │       │       └─────●> Complete!
       │       │       │       │       │             │
BAR    │       │       │       │       │             └●> Fade out
```

**Target:** Feedback visual en < 16ms (1 frame @ 60fps)

## 🔄 Estado del Sistema

### Estados de SidebarItem

```
┌──────────┐
│  NORMAL  │ ← Item sin interacción
└─────┬────┘
      │
      │ [USER CLICK]
      ▼
┌──────────┐
│ PENDING  │ ← Feedback instantáneo (< 16ms)
│  (Wait)  │    • Color: primary-100
└─────┬────┘   • Spinner: visible
      │        • Cursor: wait
      │
      │ [NAVIGATION IN PROGRESS]
      │
      │ (1-2 segundos típicamente)
      │
      │ [NAVIGATION COMPLETE]
      ▼
┌──────────┐
│  ACTIVE  │ ← Nueva página cargada
└──────────┘   • Color: primary-50
               • Font: primary-700
```

### Estados de LoadingBar

```
┌──────────┐
│  HIDDEN  │ ← Sin navegación activa
└─────┬────┘
      │
      │ [PATHNAME CHANGE DETECTED]
      ▼
┌──────────┐
│ LOADING  │ ← Barra visible
│  0% → X% │    Progress incrementa
└─────┬────┘
      │
      │ [NAVIGATION COMPLETE]
      ▼
┌──────────┐
│   100%   │ ← Completa
└─────┬────┘
      │
      │ [200ms FADE]
      ▼
┌──────────┐
│  HIDDEN  │ ← Listo para próxima navegación
└──────────┘
```

## 🎨 Capas Visuales (Z-Index)

```
Layer 5  (z-50)  ━━━━━━━━━━━━━  LoadingBar
                                 (Siempre visible)

Layer 4          ┌─────────────┐
                 │   Spinner   │  Loading Overlay
                 │   Overlay   │  (Sobre item activo)
                 └─────────────┘

Layer 3          ┌─────────────┐
                 │   Sidebar   │  Navigation
                 └─────────────┘

Layer 2          ┌─────────────┐
                 │   Content   │  Main area
                 └─────────────┘

Layer 1          ┌─────────────┐
                 │ Background  │  Base
                 └─────────────┘
```

## 📊 Performance Profile

### Operaciones y Tiempos

| Operación | Tiempo | Tipo |
|-----------|--------|------|
| setState (pendingPath) | < 1ms | Síncrono |
| Re-render (SidebarItem) | < 16ms | React |
| CSS transition | 150ms | Animación |
| Loading bar appear | < 50ms | Effect |
| Next.js navigation | 100-2000ms | Asíncrono |
| Bar fade out | 200ms | CSS |

### Memoización Strategy

```
DashboardLayout
  ├─> sidebarSections (useMemo)
  ├─> logo (useMemo)
  └─> callbacks (useCallback)

Sidebar
  ├─> activeStates (useMemo)
  ├─> navigationContextValue (useMemo)
  └─> React.memo comparison

SidebarItemComponent
  ├─> handleClick (useCallback)
  └─> React.memo

useNavigationTransition
  ├─> navigate (useCallback)
  └─> isNavigating (useCallback)
```

## 🔗 Dependencias

```
React 18+
  ├─> useTransition     ← Non-blocking navigation
  ├─> useContext        ← State sharing
  ├─> useMemo           ← Memoization
  └─> useCallback       ← Stable callbacks

Next.js 15
  ├─> useRouter         ← Navigation
  ├─> usePathname       ← Route detection
  └─> <Link>            ← Prefetching

Lucide React
  └─> Loader2           ← Spinner icon

Tailwind CSS
  ├─> Transitions       ← Smooth animations
  └─> Custom colors     ← Brand colors
```

## ✅ Beneficios de la Arquitectura

### 1. Separation of Concerns
- Hook: Lógica de navegación
- Context: Estado compartido
- Component: UI y feedback
- Layout: Integración global

### 2. Reusabilidad
- Hook puede usarse en otros componentes
- Loading bar es global y automático
- Patrón aplicable a cualquier navegación

### 3. Performance
- Memoización previene re-renders innecesarios
- useTransition no bloquea UI
- Prefetching reduce tiempos de carga

### 4. Mantenibilidad
- Código modular y separado
- Responsabilidades claras
- Fácil de testear

### 5. Escalabilidad
- Agregar nuevos items: solo data
- Cambiar estilos: solo CSS
- Modificar comportamiento: solo hook

## 🚀 Conclusión

Sistema de 3 capas:
1. **Hook Layer:** Lógica de navegación (useNavigationTransition)
2. **Context Layer:** Estado compartido (NavigationContext)
3. **UI Layer:** Feedback visual (Spinner + LoadingBar)

**Resultado:** Feedback instantáneo < 16ms con experiencia profesional.
