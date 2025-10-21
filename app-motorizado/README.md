# App Motorizado - React Native

Aplicación móvil para motorizados construida con React Native.

## Descripción
App móvil que permite a los motorizados:
- Ver envíos disponibles
- Crear y gestionar pujas
- Navegación GPS
- Seguimiento de entregas
- Historial de trabajos

## Stack Tecnológico
- **React Native** (>=0.72)
- **TypeScript** - Tipado estático
- **Expo** - Herramientas de desarrollo
- **React Navigation** - Navegación
- **React Query** - Estado del servidor
- **Zustand** - Estado global
- **React Native Maps** - Mapas
- **React Native Paper** - UI components

## Instalación

```bash
# Desde la raíz del monorepo
npm install

# O desde esta carpeta
cd app-motorizado
npm install
```

## Configuración

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Configura las variables en `.env`:
```env
API_URL=http://localhost:4000
GOOGLE_MAPS_API_KEY=tu-api-key-de-google-maps
EXPO_PUBLIC_APP_NAME=FLIPY Motorizado
```

## Scripts Disponibles

```bash
# Desarrollo (Expo)
npm run dev

# Android
npm run android

# iOS
npm run ios

# Web (para testing)
npm run web

# Build
npm run build

# Linting
npm run lint

# Tests
npm run test
```

## Estructura del Proyecto

```
app-motorizado/
├── app/                 # App Router (Expo Router)
│   ├── (auth)/         # Rutas de autenticación
│   ├── (tabs)/         # Navegación por tabs
│   └── +html.tsx       # Configuración web
├── components/         # Componentes reutilizables
│   ├── ui/            # Componentes base
│   └── forms/         # Formularios
├── hooks/             # Custom hooks
├── stores/            # Estado global
├── services/          # Servicios API
├── utils/             # Utilidades
└── types/             # Tipos TypeScript
```

## Pantallas Principales

### Autenticación
- `/login` - Login de motorizado
- `/register` - Registro de motorizado
- `/forgot-password` - Recuperar contraseña

### Tabs Principales
- `/` - Dashboard (envíos disponibles)
- `/envios` - Mis envíos
- `/pujas` - Mis pujas
- `/perfil` - Perfil del motorizado

### Envíos
- `/envios/:id` - Detalle de envío
- `/envios/:id/puja` - Crear puja
- `/envios/:id/navegacion` - Navegación GPS

## Componentes Principales

### Envíos
- `EnvioCard` - Tarjeta de envío
- `EnvioMap` - Mapa con ubicaciones
- `EnvioStatus` - Estado del envío
- `EnvioNavigation` - Navegación GPS

### Pujas
- `PujaCard` - Tarjeta de puja
- `PujaForm` - Formulario de puja
- `PujaList` - Lista de pujas

### UI
- `Button` - Botón base
- `Input` - Input base
- `Modal` - Modal base
- `Toast` - Notificaciones

## Funcionalidades

### Geolocalización
- Ubicación actual del motorizado
- Navegación GPS a destinos
- Tracking en tiempo real

### Notificaciones
- Push notifications para nuevos envíos
- Alertas de pujas aceptadas
- Recordatorios de entregas

### Offline
- Cache de datos críticos
- Sincronización automática
- Modo offline básico

## Desarrollo

### Expo CLI
```bash
# Instalar Expo CLI globalmente
npm install -g @expo/cli

# Iniciar proyecto
npx expo start

# Limpiar cache
npx expo start --clear
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

### Linting
```bash
# Linting
npm run lint

# Formateo automático
npm run format
```

## Build y Deploy

### Desarrollo
```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

### Producción
```bash
# Build para Android
npm run build:android

# Build para iOS
npm run build:ios
```

### EAS Build (Expo)
```bash
# Instalar EAS CLI
npm install -g eas-cli

# Configurar build
eas build:configure

# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios
```

## Permisos Requeridos

### Android
- `ACCESS_FINE_LOCATION` - Ubicación precisa
- `ACCESS_COARSE_LOCATION` - Ubicación aproximada
- `INTERNET` - Conexión a internet
- `ACCESS_NETWORK_STATE` - Estado de red

### iOS
- `NSLocationWhenInUseUsageDescription` - Ubicación cuando se usa la app
- `NSLocationAlwaysAndWhenInUseUsageDescription` - Ubicación siempre

## Características

- **Cross-platform** - iOS y Android
- **Offline-first** - Funciona sin conexión
- **Real-time** - Actualizaciones en tiempo real
- **GPS Integration** - Navegación integrada
- **Push Notifications** - Notificaciones push
