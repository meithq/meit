# MEIT

**La plataforma de recompensas líder para negocios en Venezuela**

MEIT es una aplicación innovadora de gestión de programas de fidelidad y recompensas, diseñada específicamente para el mercado venezolano. Inspirados en [Livelo](https://www.livelo.com.br/) de Brasil, nuestro objetivo es convertirnos en el ecosistema de recompensas más completo de Venezuela, conectando negocios con sus clientes a través de un sistema de puntos unificado.

## 🎯 Nuestra Visión

Transformar la manera en que los negocios venezolanos recompensan la lealtad de sus clientes, creando un ecosistema donde cada compra cuenta y cada punto tiene valor real.

## ✨ Características

### Para Negocios
- **📊 Dashboard de Gestión**: Visualización completa de métricas de fidelidad en tiempo real
- **🎯 Sistema de Puntos Unificado**: Administración centralizada de programas de recompensas
- **📈 Análisis de Check-ins**: Seguimiento detallado de actividad y engagement de clientes
- **💰 Gestión de Recompensas**: Control total sobre puntos asignados y canjeados
- **📱 Panel de Administración**: Herramientas completas para gestionar tu programa de fidelidad

### Experiencia de Usuario
- **🚀 Single Page Application (SPA)**: Navegación fluida sin recargas de página
- **🎨 Diseño Moderno**: Interfaz elegante con modo claro/oscuro
- **📱 100% Responsive**: Optimizado para móviles, tablets y desktop
- **🔐 Autenticación Segura**: Sistema de login robusto y elegante
- **⚡ Rendimiento Optimizado**: Carga rápida y transiciones suaves

### Tecnología
- **🎭 Componentes Reutilizables**: Arquitectura modular con shadcn/ui
- **📉 Gráficos Interactivos**: Visualizaciones dinámicas con Recharts
- **🔄 Actualizaciones en Tiempo Real**: Data siempre actualizada

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
├── app/                    # App Router de Next.js
│   ├── admin/             # Panel de administración
│   ├── login/             # Página de autenticación
│   └── globals.css        # Estilos globales y variables CSS
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base de shadcn/ui
│   ├── checkins-card.tsx # Tarjeta de análisis de check-ins
│   ├── puntos-asignados-card.tsx # Tarjeta de puntos
│   └── ...               # Otros componentes
├── lib/                  # Utilidades y configuraciones
└── public/              # Archivos estáticos
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

## 📊 Panel de Control para Negocios

### Métricas en Tiempo Real
- **Check-ins de Clientes**: Visualización de actividad y engagement con gráficos interactivos
- **Puntos Asignados**: Seguimiento detallado de puntos otorgados y tendencias
- **Análisis Temporal**: Vistas configurables de 7D, 30D y 90D para identificar patrones
- **KPIs de Fidelidad**: Métricas clave para medir el éxito del programa de recompensas

### Gestión de Recompensas
- **Sistema de Puntos**: Control total sobre asignación y canje de puntos
- **Historial de Transacciones**: Registro completo de movimientos de puntos
- **Reportes Personalizables**: Exporta data para análisis detallado
- **Alertas y Notificaciones**: Mantente informado de actividad importante

### Navegación
- **Sidebar Responsivo**: Navegación lateral colapsible y intuitiva
- **Header Dinámico**: Barra superior con notificaciones en tiempo real
- **Breadcrumbs**: Navegación contextual para orientación fácil

## 🔐 Autenticación

La aplicación incluye un sistema de login moderno con:
- Formulario elegante con validación
- Opción de login con GitHub
- Diseño responsive con imagen de fondo
- Textos en español

## 🗺️ Roadmap

### En Desarrollo
- 🔄 Integración con pasarelas de pago venezolanas
- 📱 Aplicación móvil nativa (iOS/Android)
- 🏪 Portal para comercios aliados
- 👥 Sistema de referidos y bonificaciones

### Planificado
- 🎁 Catálogo de recompensas canjeables
- 🤝 Red de comercios aliados
- 💳 Tarjeta virtual de puntos
- 📊 Analytics avanzados con IA
- 🌐 API pública para integraciones

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
