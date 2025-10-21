# 🔐 Sistema de Autenticación FLIPY

## ✅ Estado: COMPLETO

El sistema de autenticación está completamente implementado y listo para usar.

---

## 📋 Características Implementadas

### ✅ Registro de Usuarios
- Registro de Motorizados con trial de 7 días
- Registro de Tiendas con billetera inicial
- Validación de emails únicos
- Validación de licencias únicas (motorizados)
- Hashing de passwords con bcrypt (10 rounds)
- Transacciones atómicas con Prisma

### ✅ Autenticación
- Login con email y password
- Generación de JWT tokens
- Expiración de tokens configurable (24h por defecto)
- Validación de credenciales segura

### ✅ Protección de Rutas
- Middleware de verificación de token
- Middleware de verificación de roles
- Manejo de tokens expirados
- Manejo de tokens inválidos

---

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en `/backend`:

```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/flipy
JWT_SECRET=tu-secreto-jwt-muy-seguro
JWT_EXPIRES_IN=24h
PORT=3000
NODE_ENV=development
```

### 2. Instalar Dependencias

```bash
cd backend
npm install
```

### 3. Ejecutar Migraciones de Prisma

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Iniciar Servidor

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

---

## 📡 Endpoints de Autenticación

### 1. Registrar Motorizado
**POST** `/api/auth/register/motorizado`

```json
{
  "email": "motorizado@example.com",
  "password": "password123",
  "phone": "+51987654321",
  "licencia": "ABC123456",
  "vehiculo": "Moto Honda 150cc"
}
```

**Respuesta:**
```json
{
  "message": "Motorizado registrado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxx123",
    "email": "motorizado@example.com",
    "role": "MOTORIZADO",
    "phone": "+51987654321",
    "motorizado": {
      "id": "clyyy456",
      "licencia": "ABC123456",
      "vehiculo": "Moto Honda 150cc",
      "trialHasta": "2025-10-28T12:00:00.000Z"
    }
  }
}
```

### 2. Registrar Tienda
**POST** `/api/auth/register/tienda`

```json
{
  "email": "tienda@example.com",
  "password": "password123",
  "phone": "+51987654321",
  "nombre": "Tienda Don Pepe",
  "direccion": "Av. Principal 123, Lima"
}
```

### 3. Login
**POST** `/api/auth/login`

```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

---

## 🛡️ Protección de Rutas

### Uso Básico

```javascript
const { verifyToken } = require('./middleware/authMiddleware');
const { requireRole } = require('./middleware/roleMiddleware');

// Ruta protegida (requiere autenticación)
router.get('/protected', verifyToken, (req, res) => {
  // req.user contiene: { userId, email, role }
  res.json({ user: req.user });
});

// Ruta solo para motorizados
router.get('/motorizado-only', 
  verifyToken, 
  requireRole(['MOTORIZADO']), 
  (req, res) => {
    res.json({ message: 'Solo motorizados' });
  }
);

// Ruta para motorizados O admins
router.get('/motorizado-or-admin', 
  verifyToken, 
  requireRole(['MOTORIZADO', 'ADMIN']), 
  (req, res) => {
    res.json({ message: 'Motorizados o admins' });
  }
);
```

### Roles Disponibles
- `MOTORIZADO` - Usuario motorizado
- `TIENDA` - Usuario tienda
- `ADMIN` - Administrador del sistema

---

## 🧪 Pruebas

### Opción 1: Script de Prueba Automatizado

```bash
node test-auth.js
```

Este script ejecuta todos los tests automáticamente.

### Opción 2: Curl Manual

```bash
# Registrar motorizado
curl -X POST http://localhost:3000/api/auth/register/motorizado \
  -H "Content-Type: application/json" \
  -d '{
    "email": "motorizado1@test.com",
    "password": "test123",
    "phone": "+51987654321",
    "licencia": "LIC001",
    "vehiculo": "Moto Yamaha"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "motorizado1@test.com",
    "password": "test123"
  }'

# Acceder a ruta protegida
curl -H "Authorization: Bearer TU_TOKEN" \
  http://localhost:3000/api/envios/test
```

### Opción 3: Postman/Insomnia

Importa las siguientes rutas:
1. POST `http://localhost:3000/api/auth/register/motorizado`
2. POST `http://localhost:3000/api/auth/register/tienda`
3. POST `http://localhost:3000/api/auth/login`

---

## 📁 Estructura de Archivos

```
backend/src/
├── config/
│   └── prisma.js                  # Singleton de Prisma Client
├── controllers/
│   └── authController.js          # Controladores de autenticación
├── middleware/
│   ├── authMiddleware.js          # Middleware de verificación de token
│   └── roleMiddleware.js          # Middleware de verificación de roles
├── routes/
│   ├── auth.js                    # Rutas de autenticación
│   └── ejemploUsoAuth.js          # Ejemplos de uso
└── utils/
    └── jwt.js                     # Utilidades para JWT
```

---

## 🔒 Seguridad

### Password Hashing
- ✅ Bcrypt con 10 rounds
- ✅ Never almacena passwords en texto plano
- ✅ Comparación segura con bcrypt.compare()

### JWT Tokens
- ✅ Firmados con secret key (JWT_SECRET)
- ✅ Expiración configurable
- ✅ Payload mínimo: userId, email, role
- ✅ Verificación en cada request protegido

### Validaciones
- ✅ Email único
- ✅ Licencia única (motorizados)
- ✅ Campos requeridos
- ✅ Formato de email válido (por Prisma)

### Transacciones
- ✅ Operaciones atómicas para crear User + Motorizado/Tienda
- ✅ Rollback automático en caso de error

---

## 🐛 Manejo de Errores

### Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| 200 | Login exitoso |
| 201 | Registro exitoso |
| 400 | Datos inválidos o faltantes |
| 401 | Credenciales inválidas o token inválido |
| 403 | Sin permisos (rol incorrecto) |
| 500 | Error del servidor |

### Ejemplos de Errores

```json
// Email ya registrado
{
  "message": "El email ya está registrado"
}

// Token expirado
{
  "message": "Token expirado. Por favor, inicie sesión nuevamente"
}

// Sin permisos
{
  "message": "No tienes permisos para acceder a este recurso",
  "requiredRoles": ["MOTORIZADO", "ADMIN"],
  "currentRole": "TIENDA"
}
```

---

## 📚 Documentación Adicional

- Ver `API_AUTH_DOCS.md` para documentación completa de la API
- Ver `DIA3_RESUMEN.md` para resumen técnico del desarrollo
- Ver `ejemploUsoAuth.js` para ejemplos de código

---

## 🔧 Configuración Avanzada

### Cambiar Tiempo de Expiración del Token

En `.env`:
```env
JWT_EXPIRES_IN=7d    # 7 días
JWT_EXPIRES_IN=12h   # 12 horas
JWT_EXPIRES_IN=30m   # 30 minutos
```

### Habilitar Logs de Prisma

En `src/config/prisma.js`, descomenta:
```javascript
log: ['query', 'info', 'warn', 'error']
```

### Cambiar Rounds de Bcrypt

En `src/controllers/authController.js`:
```javascript
const BCRYPT_ROUNDS = 12; // Más seguro pero más lento
```

---

## ✅ Checklist de Producción

Antes de desplegar a producción:

- [ ] Cambiar `JWT_SECRET` a un valor seguro y aleatorio
- [ ] Configurar `NODE_ENV=production`
- [ ] Usar base de datos de producción (Supabase)
- [ ] Habilitar HTTPS
- [ ] Configurar CORS apropiadamente
- [ ] Revisar rate limiting
- [ ] Implementar refresh tokens (futuro)
- [ ] Agregar logging apropiado
- [ ] Implementar 2FA (futuro)

---

## 🤝 Soporte

Para preguntas o problemas, revisar:
1. Este README
2. `API_AUTH_DOCS.md`
3. Logs del servidor
4. Logs de Prisma

---

**Desarrollado para FLIPY - Sistema de delivery con pujas**

