# MEIT

**La plataforma de recompensas líder para negocios en Venezuela**

MEIT es una aplicación innovadora de gestión de programas de fidelidad y recompensas, diseñada específicamente para el mercado venezolano. Inspirados en [Livelo](https://www.livelo.com.br/) de Brasil, nuestro objetivo es convertirnos en el ecosistema de recompensas más completo de Venezuela, conectando negocios con sus clientes a través de un sistema de puntos unificado.

## 📑 Tabla de Contenidos

- [🎯 Nuestra Visión](#-nuestra-visión)
- [✨ Características Implementadas](#-características-implementadas)
- [💡 Inspiración: Livelo](#-inspiración-livelo)
- [🛠️ Tecnologías](#️-tecnologías)
- [🚀 Inicio Rápido](#-inicio-rápido)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🚀 Arquitectura SPA](#-arquitectura-spa)
- [🎨 Sistema de Colores](#-sistema-de-colores)
- [🔧 Scripts Disponibles](#-scripts-disponibles)
- [📊 Panel de Control Completo](#-panel-de-control-completo)
- [🗺️ Roadmap](#️-roadmap)
- [🎨 Guía de Estilo y Patrones](#-guía-de-estilo-y-patrones)
- [🤝 Contribución](#-contribución)
- [📄 Licencia](#-licencia)

## 🎯 Nuestra Visión

Transformar la manera en que los negocios venezolanos recompensan la lealtad de sus clientes, creando un ecosistema donde cada compra cuenta y cada punto tiene valor real.

## 🌟 Características Destacadas

- ✅ **100% Funcional**: Todas las vistas principales implementadas y operativas
- 🎨 **Diseño Profesional**: Interfaz moderna y consistente con shadcn/ui
- ⚡ **Alto Rendimiento**: Arquitectura SPA con Next.js 16 y React 19
- 📱 **Totalmente Responsive**: Optimizado para todos los dispositivos
- 🔔 **Notificaciones en Tiempo Real**: Sistema completo con categorización
- 📊 **Analytics Visuales**: Gráficos interactivos con Recharts
- 🎯 **Gestión Completa**: Clientes, sucursales, retos y gift cards
- ⚙️ **Configuración Centralizada**: Modal con 4 secciones configurables

## ✨ Características Implementadas

### 📊 Dashboard de Gestión
- **Métricas en Tiempo Real**: Visualización de KPIs con gráficos interactivos (Recharts)
- **Check-ins de Clientes**: Análisis de engagement con períodos configurables (7D, 30D, 90D)
- **Puntos Asignados**: Seguimiento detallado de tendencias y distribución
- **Cards de Estadísticas**: Vista rápida de métricas clave del negocio
- **Navegación Contextual**: Breadcrumbs y navegación intuitiva

### 👥 Gestión de Clientes
- **Base de Datos Completa**: Listado con nombre, teléfono, puntos y estadísticas
- **Búsqueda Avanzada**: Filtrado en tiempo real por nombre o teléfono
- **Exportación CSV**: Descarga de datos de clientes para análisis externo
- **Historial de Visitas**: Registro de última visita y frecuencia
- **Paginación**: Navegación eficiente en listas grandes

### 🏢 Gestión de Sucursales
- **Códigos QR**: Generación automática para cada sucursal
- **Estados**: Control de sucursales activas/inactivas
- **Descarga/Impresión**: QR codes listos para uso físico
- **Gestión Visual**: Cards con información clave
- **Modal de Ayuda**: Guía para uso de códigos QR

### 🛒 Punto de Venta (POS)
- **Proceso Guiado**: Stepper de 4 pasos para asignar puntos
- **Búsqueda de Clientes**: Dropdown con autocompletado
- **Selección de Retos**: Múltiples retos por transacción
- **Validación PIN**: Sistema OTP de 4 dígitos para seguridad
- **Resumen Sticky**: Card de resumen visible durante scroll
- **Cálculo Automático**: Total de puntos y retos seleccionados

### 🎯 Gestión de Retos
- **Creación de Desafíos**: Retos personalizados para clientes
- **Barras de Progreso**: Visualización de avance en tiempo real
- **Estados**: Activo, Pausado, Finalizado
- **Analytics**: Estadísticas de completados y engagement
- **Menú de Acciones**: Editar, pausar o ver analytics
- **Búsqueda y Filtros**: Encuentra retos rápidamente

### 🎁 Gift Cards
- **Métricas Detalladas**: 4 cards con estadísticas importantes
- **Validación**: Sistema de validación con búsqueda de código
- **Vista de Tarjeta**: Diseño visual atractivo tipo tarjeta física
- **Estados**: Tabs para Activas, Redimidas y Vencidas
- **Configuración**: Sheet con sliders para ajustar parámetros
- **Redención**: Proceso simplificado con botones de acción

### ⚙️ Configuración del Sistema
Modal completo con 4 secciones principales:

**Negocio**
- Nombre del comercio
- Tipo de negocio (dropdown con opciones)
- Teléfono/WhatsApp
- Dirección

**Puntos**
- Puntos por dólar gastado
- Puntos necesarios para gift card
- Valor de gift card (USD)
- Límite diario por cliente
- Card informativa con detalles del sistema

**WhatsApp**
- Estado de conexión en tiempo real
- Personalización de mensajes (saludo, despedida, tono)
- Vista previa de mensajes
- Envío de mensajes de prueba

**Equipo**
- Gestión de usuarios
- Búsqueda de miembros
- Roles y permisos (Admin, Gerente, Cajero)
- Estados (Activo/Inactivo)
- Menú de acciones (Editar, Eliminar)

### 🔔 Sistema de Notificaciones
- **Categorización Temporal**: Hoy, Ayer, fechas específicas
- **Tipos de Notificaciones**: Success, Gift Cards, Achievements, Info
- **Indicadores Visuales**: Badge de contador, punto rojo para no leídas
- **Descartar**: Animación slide hacia la derecha
- **Sheet Lateral**: Panel deslizable desde la derecha

### 🎨 Sistema de Diseño
- **Componentes Reutilizables**: FormInput, FormSelect, PrimaryButton, SecondaryButton
- **Paleta de Colores**: Primario (púrpura) y secundario (turquesa #84dcdb)
- **Border Radius**: Consistente (30px cards, 50px botones, 20px inputs)
- **Modo Oscuro**: Soporte completo con variables CSS
- **Hover States**: Efectos visuales con color primario/10
- **Dropdowns**: Menús con border-radius reducido (12px/8px)

### 🚀 Experiencia de Usuario
- **Single Page Application**: Navegación instantánea sin recargas
- **Navegación Contextual**: Sidebar con tooltips y breadcrumbs
- **Búsqueda Universal**: Inputs de búsqueda en todas las vistas principales
- **Feedback Visual**: Badges, indicadores y estados claros
- **Animaciones Suaves**: Transiciones de 300ms en elementos interactivos
- **Responsive Design**: Optimizado para todos los dispositivos

## 💡 Inspiración: Livelo

[Livelo](https://www.livelo.com.br/) es el programa de recompensas más grande de Brasil, permitiendo a millones de usuarios acumular y canjear puntos en una red extensa de comercios y servicios. Inspirados en su éxito, MEIT busca replicar este modelo en el mercado venezolano, adaptándolo a las necesidades locales y creando valor tanto para negocios como para consumidores.

### ¿Por qué un Livelo venezolano?

- **Mercado sin atender**: Venezuela carece de una plataforma unificada de recompensas
- **Oportunidad de fidelización**: Los negocios necesitan herramientas modernas para retener clientes
- **Valor para el consumidor**: Los usuarios quieren que sus compras generen beneficios tangibles
- **Ecosistema integrado**: Una red donde los puntos tienen valor real y múltiples opciones de canje

## 🛠️ Tecnologías

- **Framework**: [Next.js 15](https://nextjs.org/) con App Router para arquitectura SPA
- **Arquitectura**: Single Page Application con enrutamiento del lado del cliente
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) con variables CSS personalizadas
- **Componentes**: [shadcn/ui](https://ui.shadcn.com/) para componentes de alta calidad
- **Gráficos**: [Recharts](https://recharts.org/) para visualizaciones interactivas
- **Iconos**: [Lucide React](https://lucide.dev/) para iconografía consistente
- **TypeScript**: Tipado estático para mayor robustez
- **Estado**: Gestión de estado reactiva para experiencia SPA fluida

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm, yarn, pnpm o bun

### Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd meit
```

2. Instala las dependencias:
```bash
npm install
# o
yarn install
# o
pnpm install
```

3. Ejecuta el servidor de desarrollo:
```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
meit/
├── app/                              # App Router de Next.js
│   ├── admin/[[...slug]]/           # Panel de administración (SPA)
│   │   ├── page.tsx                 # Vista principal con routing
│   │   └── layout.tsx               # Layout del admin
│   ├── login/                       # Página de autenticación
│   │   └── page.tsx                 # Formulario de login
│   ├── page.tsx                     # Landing page
│   └── globals.css                  # Estilos globales y variables CSS
│
├── components/                       # Componentes reutilizables
│   ├── ui/                          # Componentes base de shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx
│   │   ├── form-input.tsx           # Input personalizado
│   │   ├── form-select.tsx          # Select personalizado
│   │   ├── primary-button.tsx       # Botón primario
│   │   ├── secondary-button.tsx     # Botón secundario
│   │   └── ...                      # Más componentes UI
│   │
│   ├── views/                       # Vistas principales
│   │   ├── dashboard-view.tsx       # Dashboard con métricas
│   │   ├── clientes-view.tsx        # Gestión de clientes
│   │   ├── sucursales-view.tsx      # Gestión de sucursales
│   │   ├── pos-view.tsx             # Punto de venta
│   │   ├── retos-view.tsx           # Gestión de retos
│   │   ├── giftcards-view.tsx       # Gestión de gift cards
│   │   └── placeholder-view.tsx     # Vista placeholder
│   │
│   ├── settings-modal.tsx           # Modal de configuración
│   ├── notifications-sheet.tsx      # Sheet de notificaciones
│   ├── checkins-card.tsx           # Card de check-ins
│   ├── puntos-asignados-card.tsx   # Card de puntos
│   └── ...                         # Otros componentes
│
├── contexts/                        # Contextos de React
│   └── navigation-context.tsx      # Contexto de navegación SPA
│
├── lib/                            # Utilidades y configuraciones
│   ├── utils.ts                    # Funciones utilitarias
│   ├── clientes-data.ts            # Datos de ejemplo de clientes
│   ├── sucursales-data.ts          # Datos de ejemplo de sucursales
│   └── export-csv.ts               # Utilidad para exportar CSV
│
├── hooks/                          # Custom hooks
│   └── use-mobile.ts               # Hook para detección móvil
│
└── public/                         # Archivos estáticos
```

## 🚀 Arquitectura SPA

MEIT está construido como una **Single Page Application (SPA)** que ofrece:

### Beneficios del Sistema SPA
- **⚡ Navegación Instantánea**: Sin recargas de página entre rutas
- **🔄 Actualizaciones Dinámicas**: Contenido que se actualiza sin interrupciones
- **💾 Estado Persistente**: Mantiene el estado de la aplicación durante la navegación
- **📱 Experiencia Móvil**: Sensación de aplicación nativa en dispositivos móviles
- **🎯 Interacciones Fluidas**: Transiciones suaves y respuesta inmediata

### Características Técnicas
- **Enrutamiento del Cliente**: Next.js App Router maneja la navegación
- **Carga Progresiva**: Componentes se cargan según demanda
- **Optimización Automática**: Code splitting y lazy loading integrados
- **SEO Friendly**: Server-side rendering cuando es necesario

## 🎨 Sistema de Colores

El proyecto utiliza un sistema de colores personalizado:

- **Primario**: Púrpura elegante para elementos principales
- **Secundario**: Turquesa (#84dcdb) para acentos y elementos secundarios
- **Modo Oscuro**: Soporte completo con paleta optimizada

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter

## 📊 Panel de Control Completo

### Dashboard Principal
- **Gráficos Interactivos**: Visualización de check-ins y puntos con Recharts
- **Cards de Métricas**: Vista rápida de KPIs importantes
- **Análisis Temporal**: Períodos configurables (7D, 30D, 90D)
- **Tendencias**: Identificación de patrones y crecimiento

### Módulos Implementados

**Clientes** 👥
- Listado completo con búsqueda en tiempo real
- Exportación a CSV para análisis externo
- Información detallada: puntos, visitas, última actividad
- Paginación inteligente para grandes volúmenes

**Sucursales** 🏢
- Generación automática de códigos QR
- Gestión de estados (activa/inactiva)
- Descarga e impresión de QR codes
- Modal de ayuda con instrucciones

**Punto de Venta** 🛒
- Proceso guiado en 4 pasos
- Búsqueda y selección de clientes
- Asignación de múltiples retos
- Validación con PIN de seguridad
- Resumen sticky durante scroll

**Retos** 🎯
- Creación y edición de desafíos
- Barras de progreso visual
- Analytics de completados
- Estados: activo, pausado, finalizado

**Gift Cards** 🎁
- Métricas y estadísticas detalladas
- Sistema de validación con búsqueda
- Vista de tarjeta tipo diseño físico
- Tabs por estado (activas, redimidas, vencidas)
- Configuración con sliders

**Configuración** ⚙️
- Información del negocio
- Sistema de puntos y gift cards
- Integración WhatsApp con vista previa
- Gestión de equipo y permisos

**Notificaciones** 🔔
- Categorización por fecha (Hoy, Ayer, etc.)
- Tipos visuales diferenciados
- Descarte con animación
- Contador de no leídas

### Navegación y UX
- **Sidebar Intuitivo**: Navegación con iconos y tooltips
- **Topbar Funcional**: Notificaciones y perfil de usuario
- **Breadcrumbs**: Orientación contextual en cada vista
- **Búsqueda Universal**: Filtrado en todas las vistas principales
- **Feedback Visual**: Estados, badges y animaciones

## 🔐 Autenticación

La aplicación incluye un sistema de login moderno con:
- Formulario elegante con validación
- Opción de login con GitHub
- Diseño responsive con imagen de fondo
- Textos en español

## 🗺️ Roadmap

### ✅ Completado (v1.0)
- ✅ Dashboard con métricas en tiempo real
- ✅ Gestión completa de clientes
- ✅ Gestión de sucursales con QR codes
- ✅ Punto de venta (POS) con validación PIN
- ✅ Sistema de retos con analytics
- ✅ Gestión de gift cards
- ✅ Modal de configuración (4 secciones)
- ✅ Sistema de notificaciones con categorización
- ✅ Arquitectura SPA con Next.js 16
- ✅ Sistema de diseño consistente (shadcn/ui)
- ✅ Exportación de datos a CSV
- ✅ Modo claro/oscuro
- ✅ Responsive design

### 🚧 En Desarrollo
- 🔄 Backend con API REST/GraphQL
- 🔄 Base de datos PostgreSQL/MongoDB
- 🔄 Autenticación completa con JWT
- 🔄 Integración WhatsApp Business API real
- 🔄 Sistema de permisos y roles

### 📋 Planificado (v2.0)
- 📱 Aplicación móvil nativa (iOS/Android)
- 💳 Integración con pasarelas de pago venezolanas
- 🏪 Portal público para clientes
- 👥 Sistema de referidos y bonificaciones
- 🎁 Catálogo de recompensas canjeables
- 🤝 Red de comercios aliados
- 📊 Analytics avanzados con IA
- 🌐 API pública para integraciones
- 📧 Notificaciones por email
- 📱 PWA para instalación en móviles

## 🚀 Despliegue

### Vercel (Recomendado)

La forma más fácil de desplegar es usar [Vercel](https://vercel.com/new):

1. Conecta tu repositorio
2. Configura las variables de entorno si es necesario
3. Despliega automáticamente

### Otros Proveedores

El proyecto es compatible con cualquier proveedor que soporte Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 🎨 Guía de Estilo y Patrones

### Sistema de Colores
```css
--primary: oklch(0.4545 0.1844 321.4624)     /* Púrpura elegante */
--secondary: oklch(0.8431 0.0824 180.0000)   /* Turquesa #84dcdb */
--background: oklch(0.9686 0.0064 253.8314)  /* Fondo claro */
--foreground: oklch(0.2795 0.0368 260.0310)  /* Texto principal */
```

### Border Radius
- **Cards**: 30px
- **Botones**: 50px
- **Inputs**: 20px
- **Dropdowns**: 12px (contenedor), 8px (items)

### Componentes Personalizados

**FormInput**
```tsx
<FormInput
  placeholder="Buscar..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
```

**FormSelect**
```tsx
<FormSelect
  placeholder="Selecciona una opción"
  options={[
    { value: "option1", label: "Opción 1" },
    { value: "option2", label: "Opción 2" }
  ]}
/>
```

**Botones**
```tsx
<PrimaryButton>Guardar</PrimaryButton>
<SecondaryButton>Cancelar</SecondaryButton>
```

### Patrones de Diseño

**Hover States**
- Background: `hover:bg-primary/10`
- Texto: `hover:text-primary`
- Iconos: `[&:hover>svg]:text-primary`

**Animaciones**
- Transiciones: `transition-all duration-300`
- Slide: `translate-x-[120%]`
- Fade: `opacity-0`

**Layouts**
- Contenedor máximo: `max-w-[1200px] mx-auto`
- Padding bottom: `pb-[100px]` (evitar corte de contenido)
- Gap entre elementos: `gap-4` o `gap-6`

### Convenciones de Código

**Nombres de Archivos**
- Componentes: `kebab-case.tsx`
- Vistas: `nombre-view.tsx`
- Utilidades: `nombre-util.ts`

**Estructura de Componentes**
```tsx
"use client"

import { useState } from "react"
// Imports...

interface ComponentProps {
  // Props types
}

export function ComponentName({ props }: ComponentProps) {
  // Component logic
  return (
    // JSX
  )
}
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto y Soporte

### Para Negocios Interesados
¿Quieres integrar tu negocio a la red MEIT? Contáctanos para conocer nuestros planes y beneficios.

### Soporte Técnico
Si tienes preguntas o necesitas ayuda, no dudes en abrir un issue en el repositorio.

### Únete a Nosotros
Estamos construyendo el futuro de las recompensas en Venezuela. Si compartes nuestra visión, contáctanos.

---

**MEIT** - Recompensas que valen la pena 🇻🇪
