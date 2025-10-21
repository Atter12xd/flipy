# Backend - API REST FLIPY

API REST para la plataforma FLIPY construida con Node.js y Express.

## Descripción
Backend que maneja la lógica de negocio del sistema de pujas para delivery:
- Autenticación y autorización de usuarios
- Gestión de envíos y pujas
- Notificaciones en tiempo real
- Integración con servicios de geolocalización

## Stack Tecnológico
- **Node.js** (>=18)
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos
- **Prisma** - ORM (recomendado)
- **JWT** - Autenticación
- **Socket.io** - WebSockets para tiempo real

## Instalación

```bash
# Desde la raíz del monorepo
npm install

# O desde esta carpeta
cd backend
npm install
```

## Configuración

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Configura las variables en `.env`:
```env
DATABASE_URL=postgres://user:password@localhost:5432/flipy
PORT=4000
JWT_SECRET=tu-secreto-jwt-muy-seguro
NODE_ENV=development
```

3. Configura la base de datos:
```bash
# Crear la base de datos
createdb flipy

# Ejecutar migraciones (si usas Prisma)
npx prisma migrate dev

# Poblar con datos de prueba (opcional)
npx prisma db seed
```

## Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Producción
npm run start

# Build
npm run build

# Linting
npm run lint

# Tests
npm run test
```

## Estructura de la API

### Autenticación
- `POST /api/auth/login` - Login de usuario
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/refresh` - Renovar token

### Envíos
- `GET /api/envios` - Listar envíos
- `POST /api/envios` - Crear envío
- `GET /api/envios/:id` - Obtener envío
- `PUT /api/envios/:id` - Actualizar envío
- `DELETE /api/envios/:id` - Cancelar envío

### Pujas
- `GET /api/pujas/envio/:envioId` - Listar pujas de un envío
- `POST /api/pujas` - Crear puja
- `PUT /api/pujas/:id/aceptar` - Aceptar puja
- `DELETE /api/pujas/:id` - Cancelar puja

### Usuarios
- `GET /api/usuarios/profile` - Perfil del usuario
- `PUT /api/usuarios/profile` - Actualizar perfil
- `GET /api/usuarios/tiendas` - Listar tiendas
- `GET /api/usuarios/motorizados` - Listar motorizados

## Desarrollo

### Base de Datos
```bash
# Ver estado de la base de datos
npx prisma studio

# Resetear base de datos
npx prisma migrate reset
```

### Logs
Los logs se guardan en `logs/` con rotación diaria.

### Testing
```bash
# Tests unitarios
npm run test

# Tests de integración
npm run test:integration

# Coverage
npm run test:coverage
```

## Despliegue

### Variables de Entorno de Producción
```env
DATABASE_URL=postgres://user:password@host:5432/flipy_prod
PORT=4000
JWT_SECRET=secreto-super-seguro-produccion
NODE_ENV=production
```

### Docker (opcional)
```bash
# Construir imagen
docker build -t flipy-backend .

# Ejecutar contenedor
docker run -p 4000:4000 --env-file .env flipy-backend
```
