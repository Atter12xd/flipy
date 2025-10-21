# Web App - Panel Administrativo FLIPY

Aplicación web construida con Next.js para el panel administrativo y gestión de tiendas.

## Descripción
Frontend web que permite a las tiendas:
- Gestionar sus envíos
- Ver y aceptar pujas
- Seguimiento en tiempo real
- Panel de administración

## Stack Tecnológico
- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **React Query** - Estado del servidor
- **Zustand** - Estado global
- **React Hook Form** - Formularios

## Instalación

```bash
# Desde la raíz del monorepo
npm install

# O desde esta carpeta
cd web-app
npm install
```

## Configuración

1. Copia el archivo de ejemplo:
```bash
cp .env.local.example .env.local
```

2. Configura las variables en `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_NAME=FLIPY
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar en producción
npm run start

# Linting
npm run lint

# Tests
npm run test
```

## Estructura del Proyecto

```
web-app/
├── app/                 # App Router (Next.js 13+)
│   ├── (auth)/         # Rutas de autenticación
│   ├── dashboard/      # Panel principal
│   └── api/           # API routes (si es necesario)
├── components/         # Componentes reutilizables
│   ├── ui/            # Componentes base
│   └── forms/         # Formularios
├── lib/               # Utilidades y configuración
├── hooks/             # Custom hooks
├── stores/            # Estado global (Zustand)
└── types/             # Tipos TypeScript
```

## Páginas Principales

### Autenticación
- `/login` - Login de tiendas
- `/register` - Registro de tiendas
- `/forgot-password` - Recuperar contraseña

### Dashboard
- `/dashboard` - Panel principal
- `/dashboard/envios` - Gestión de envíos
- `/dashboard/envios/nuevo` - Crear envío
- `/dashboard/envios/:id` - Detalle de envío
- `/dashboard/pujas` - Gestión de pujas
- `/dashboard/perfil` - Perfil de la tienda

### Administración
- `/admin` - Panel de administración
- `/admin/usuarios` - Gestión de usuarios
- `/admin/estadisticas` - Estadísticas del sistema

## Componentes Principales

### Envíos
- `EnvioCard` - Tarjeta de envío
- `EnvioForm` - Formulario de envío
- `EnvioStatus` - Estado del envío
- `EnvioMap` - Mapa con ubicaciones

### Pujas
- `PujaCard` - Tarjeta de puja
- `PujaList` - Lista de pujas
- `PujaForm` - Formulario de puja

### UI
- `Button` - Botón base
- `Input` - Input base
- `Modal` - Modal base
- `Toast` - Notificaciones

## Desarrollo

### Hot Reload
El servidor de desarrollo incluye hot reload automático.

### Linting y Formateo
```bash
# Linting
npm run lint

# Formateo automático
npm run format

# Verificar tipos
npm run type-check
```

### Testing
```bash
# Tests unitarios
npm run test

# Tests con watch
npm run test:watch

# Coverage
npm run test:coverage
```

## Despliegue

### Variables de Entorno de Producción
```env
NEXT_PUBLIC_API_URL=https://api.flipy.com
NEXT_PUBLIC_APP_NAME=FLIPY
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Build y Deploy
```bash
# Build para producción
npm run build

# Iniciar en producción
npm run start
```

### Vercel (recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## Características

- **SSR/SSG** - Renderizado del lado del servidor
- **Responsive** - Diseño adaptable
- **PWA** - Aplicación web progresiva
- **SEO** - Optimizado para motores de búsqueda
- **Accesibilidad** - Cumple estándares WCAG
