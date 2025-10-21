FLIPY - Plataforma de delivery con sistema de pujas

## Descripción
FLIPY es una plataforma de delivery donde los envíos se asignan mediante un sistema de pujas. Las tiendas crean solicitudes de envío y los motorizados ofertan para realizarlas. La tienda elige una oferta (automática o manualmente según reglas) y el motorizado realiza la entrega.

## Stack Tecnológico
- Node.js + Express (backend API)
- Next.js (web app administrativa/tienda)
- React Native (apps móviles: tienda y motorizado)
- PostgreSQL (base de datos)

## Estructura de Carpetas
```
.
├─ app-motorizado/   # App móvil para motorizados (React Native)
├─ app-tienda/       # App móvil para tiendas (React Native)
├─ backend/          # API REST (Node.js + Express)
├─ web-app/          # Frontend web (Next.js)
└─ docs/             # Documentación (arquitectura, decisiones, etc.)
```

## Requisitos previos
- Node.js LTS (>=18)
- npm (>=9) o pnpm/yarn (el proyecto usa workspaces de npm por defecto)
- PostgreSQL (>=14)

## Configuración de entorno
Crear un archivo `.env` en cada paquete según corresponda. Ejemplos mínimos:

Backend (`backend/.env`):
```
DATABASE_URL=postgres://user:pass@localhost:5432/flipy
PORT=4000
JWT_SECRET=cambia-esto
```

Web (`web-app/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Apps móviles (`app-motorizado/.env`, `app-tienda/.env`):
```
API_URL=http://localhost:4000
```

## Instalación (monorepo)
Instala las dependencias desde la raíz del monorepo:
```
npm install
```

## Scripts útiles (desde la raíz)
- Backend (Express):
  - Desarrollo: `npm run dev:backend`
  - Producción: `npm run start:backend`

- Web (Next.js):
  - Desarrollo: `npm run dev:web`
  - Producción: `npm run build:web` y luego `npm run start:web`

- Apps móviles (React Native):
  - Motorizado: `npm run dev:app-motorizado`
  - Tienda: `npm run dev:app-tienda`

Nota: Estos scripts asumen que cada paquete define sus propios scripts `dev`, `build`, `start`. Si aún no existen, créalos dentro de cada paquete.

## Cómo ejecutar cada parte (flujo básico)
1. Levantar la base de datos PostgreSQL (local o en contenedor) y crear la base `flipy`.
2. Configurar variables de entorno en cada paquete.
3. Backend:
   - `npm run dev:backend`
4. Web app (Next.js):
   - `npm run dev:web`
5. Apps móviles (en emulador o dispositivo):
   - Motorizado: `npm run dev:app-motorizado`
   - Tienda: `npm run dev:app-tienda`

## Licencia
Pendiente de definir.


