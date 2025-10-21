# 🔐 Documentación API de Autenticación - FLIPY

## Endpoints Disponibles

### 1. Registro de Motorizado
```http
POST /api/auth/register/motorizado
```

**Body (JSON):**
```json
{
  "email": "motorizado@example.com",
  "password": "password123",
  "phone": "+51987654321",
  "licencia": "ABC123456",
  "vehiculo": "Moto Honda 150cc"
}
```

**Respuesta Exitosa (201):**
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

**Errores Posibles:**
- `400` - Email ya registrado
- `400` - Licencia ya registrada
- `400` - Campos requeridos faltantes
- `500` - Error del servidor

---

### 2. Registro de Tienda
```http
POST /api/auth/register/tienda
```

**Body (JSON):**
```json
{
  "email": "tienda@example.com",
  "password": "password123",
  "phone": "+51987654321",
  "nombre": "Tienda Don Pepe",
  "direccion": "Av. Principal 123, Lima"
}
```

**Respuesta Exitosa (201):**
```json
{
  "message": "Tienda registrada exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxx789",
    "email": "tienda@example.com",
    "role": "TIENDA",
    "phone": "+51987654321",
    "tienda": {
      "id": "clyyy012",
      "nombre": "Tienda Don Pepe",
      "direccion": "Av. Principal 123, Lima",
      "billetera": 0,
      "comision": 0.05
    }
  }
}
```

**Errores Posibles:**
- `400` - Email ya registrado
- `400` - Campos requeridos faltantes
- `500` - Error del servidor

---

### 3. Login
```http
POST /api/auth/login
```

**Body (JSON):**
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxx123",
    "email": "usuario@example.com",
    "role": "MOTORIZADO",
    "phone": "+51987654321",
    "motorizado": {
      "id": "clyyy456",
      "licencia": "ABC123456",
      "vehiculo": "Moto Honda 150cc",
      "suscripcionActiva": false,
      "trialHasta": "2025-10-28T12:00:00.000Z"
    }
  }
}
```

**Errores Posibles:**
- `400` - Campos requeridos faltantes
- `401` - Credenciales inválidas
- `500` - Error del servidor

---

## Cómo Usar el Token

### En Headers HTTP
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Ejemplo con fetch (JavaScript)
```javascript
const response = await fetch('http://localhost:3000/api/envios', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Ejemplo con axios
```javascript
axios.get('http://localhost:3000/api/envios', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Ejemplo con curl
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/envios
```

---

## Middlewares Disponibles

### 1. verifyToken
Verifica que el usuario esté autenticado.

**Uso:**
```javascript
const { verifyToken } = require('./middleware/authMiddleware');

router.get('/protected', verifyToken, (req, res) => {
  // req.user contiene: { userId, email, role }
  res.json({ user: req.user });
});
```

### 2. requireRole
Verifica que el usuario tenga uno de los roles permitidos.

**Uso:**
```javascript
const { verifyToken } = require('./middleware/authMiddleware');
const { requireRole } = require('./middleware/roleMiddleware');

// Solo motorizados
router.get('/motorizado-only', 
  verifyToken, 
  requireRole(['MOTORIZADO']), 
  (req, res) => {
    res.json({ message: 'Solo motorizados' });
  }
);

// Motorizados o admins
router.get('/motorizado-or-admin', 
  verifyToken, 
  requireRole(['MOTORIZADO', 'ADMIN']), 
  (req, res) => {
    res.json({ message: 'Motorizados o admins' });
  }
);
```

---

## Roles Disponibles
- `MOTORIZADO` - Usuario motorizado
- `TIENDA` - Usuario tienda
- `ADMIN` - Administrador del sistema

---

## Seguridad

### Password Hashing
- Se usa `bcrypt` con 10 rounds de salt
- Los passwords nunca se almacenan en texto plano

### JWT
- Tiempo de expiración: 24 horas (configurable en `.env`)
- Secret key debe estar en `JWT_SECRET` del `.env`
- El token incluye: `userId`, `email`, `role`

### Trial de Motorizados
- Se otorgan 7 días de trial automáticamente
- Campo `trialHasta` indica la fecha de expiración
- Campo `suscripcionActiva` indica si tiene suscripción pagada

---

## Ejemplos de Prueba

### Registrar Motorizado
```bash
curl -X POST http://localhost:3000/api/auth/register/motorizado \
  -H "Content-Type: application/json" \
  -d '{
    "email": "motorizado1@test.com",
    "password": "test123",
    "phone": "+51987654321",
    "licencia": "LIC001",
    "vehiculo": "Moto Yamaha"
  }'
```

### Registrar Tienda
```bash
curl -X POST http://localhost:3000/api/auth/register/tienda \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tienda1@test.com",
    "password": "test123",
    "phone": "+51987654321",
    "nombre": "Tienda Test",
    "direccion": "Av. Test 123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "motorizado1@test.com",
    "password": "test123"
  }'
```

### Acceder a Ruta Protegida
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/envios/test
```

