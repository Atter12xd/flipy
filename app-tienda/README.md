# App Tienda - React Native

Aplicación móvil para tiendas construida con React Native.

## Descripción
App móvil que permite a las tiendas:
- Crear y gestionar envíos
- Ver y aceptar pujas
- Seguimiento de entregas
- Historial de envíos
- Gestión de perfil

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
cd app-tienda
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
EXPO_PUBLIC_APP_NAME=FLIPY Tienda
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
app-tienda/
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
- `/login` - Login de tienda
- `/register` - Registro de tienda
- `/forgot-password` - Recuperar contraseña

### Tabs Principales
- `/` - Dashboard (resumen)
- `/envios` - Mis envíos
- `/pujas` - Pujas recibidas
- `/perfil` - Perfil de la tienda

### Envíos
- `/envios/nuevo` - Crear envío
- `/envios/:id` - Detalle de envío
- `/envios/:id/pujas` - Ver pujas del envío
- `/envios/:id/seguimiento` - Seguimiento en tiempo real

## Componentes Principales

### Envíos
- `EnvioCard` - Tarjeta de envío
- `EnvioForm` - Formulario de envío
- `EnvioMap` - Mapa con ubicaciones
- `EnvioStatus` - Estado del envío

### Pujas
- `PujaCard` - Tarjeta de puja
- `PujaList` - Lista de pujas
- `PujaActions` - Acciones de puja

### UI
- `Button` - Botón base
- `Input` - Input base
- `Modal` - Modal base
- `Toast` - Notificaciones

## Funcionalidades

### Gestión de Envíos
- Crear envíos con origen y destino
- Configurar ventana de tiempo
- Agregar detalles del envío
- Cancelar envíos

### Sistema de Pujas
- Ver pujas recibidas
- Comparar ofertas
- Aceptar pujas
- Rechazar pujas

### Seguimiento
- Tracking en tiempo real
- Notificaciones de estado
- Historial de entregas

### Notificaciones
- Push notifications para nuevas pujas
- Alertas de cambios de estado
- Recordatorios de envíos

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
- `INTERNET` - Conexión a internet
- `ACCESS_NETWORK_STATE` - Estado de red
- `VIBRATE` - Vibración para notificaciones

### iOS
- `NSUserNotificationsUsageDescription` - Notificaciones

## Características

- **Cross-platform** - iOS y Android
- **Real-time** - Actualizaciones en tiempo real
- **Push Notifications** - Notificaciones push
- **Offline Support** - Funciona sin conexión
- **User-friendly** - Interfaz intuitiva
