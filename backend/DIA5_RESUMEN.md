# ✅ DÍA 5 - CRUD DE ENVÍOS Y PANEL MOTORIZADO COMPLETO

## 🎯 Tareas Completadas

### PARTE 1: BACKEND - CRUD DE ENVÍOS ✅

#### 1. ✅ backend/src/controllers/enviosController.js
**Funciones implementadas:**

##### `createEnvio(req, res)`
- ✅ Valida que `req.user.role === 'TIENDA'`
- ✅ Recibe: `origen` (JSON), `destino` (JSON), `precio`, `detalles` (opcional)
- ✅ Valida estructura de origen y destino como objetos
- ✅ Obtiene tiendaId desde req.user → busca en tabla Tienda
- ✅ Crea envío con estado `PENDIENTE_PUJAS`
- ✅ Retorna envío creado con relación a tienda y usuario

##### `getEnvios(req, res)`
- ✅ **Si user es TIENDA:** retorna solo sus envíos
- ✅ **Si user es MOTORIZADO:** retorna envíos con estado `PENDIENTE_PUJAS`
- ✅ Incluye relaciones con Prisma (tienda, ofertas, motorizado)
- ✅ Ordenar por `createdAt DESC`

##### `getEnvioById(req, res)`
- ✅ Busca envío por ID
- ✅ Valida que el envío pertenezca al usuario (si es TIENDA)
- ✅ Motorizado puede ver cualquier envío disponible
- ✅ Incluye todas las relaciones (tienda, usuario, ofertas, motorizados)
- ✅ Ofertas ordenadas por precio (menor a mayor)

##### `cancelEnvio(req, res)`
- ✅ Solo si user es dueño del envío (TIENDA)
- ✅ Valida que el envío no esté ENTREGADO
- ✅ Cambia estado a `CANCELADO`
- ✅ Retorna envío actualizado

#### 2. ✅ backend/src/routes/envios.js
**Rutas configuradas:**
- ✅ `POST /api/envios` → `verifyToken` + `requireRole(['TIENDA'])` + `createEnvio`
- ✅ `GET /api/envios` → `verifyToken` + `getEnvios`
- ✅ `GET /api/envios/:id` → `verifyToken` + `getEnvioById`
- ✅ `DELETE /api/envios/:id` → `verifyToken` + `requireRole(['TIENDA'])` + `cancelEnvio`

---

### PARTE 2: FRONTEND - CONECTAR CON BACKEND REAL ✅

#### 3. ✅ web-app/lib/api.ts
**Interfaces y funciones actualizadas:**

```typescript
interface CoordenadasEnvio {
  lat: number;
  lng: number;
  direccion: string;
  nombre?: string;
}

interface CreateEnvioData {
  origen: CoordenadasEnvio;
  destino: CoordenadasEnvio;
  precio: number;
  detalles?: string;
}
```

**APIs de envíos:**
- ✅ `getAll()` → GET /api/envios con token
- ✅ `getById(id)` → GET /api/envios/:id
- ✅ `delete(id)` → DELETE /api/envios/:id

#### 4. ✅ web-app/app/dashboard/page.tsx
**Conexión con backend real:**
- ✅ `useEffect` para cargar envíos reales con `enviosAPI.getAll()`
- ✅ Estado de loading mientras carga
- ✅ Mensaje si no hay envíos
- ✅ Botón eliminar/cancelar envío con confirmación
- ✅ Función `handleDeleteEnvio()` que llama a `enviosAPI.delete()`
- ✅ Recarga automática de lista después de eliminar
- ✅ Columna de "Ofertas" que muestra cantidad
- ✅ Manejo de errores con mensaje visible

#### 5. ✅ web-app/components/CreateEnvioForm.tsx
**Actualizado con JSON:**
- ✅ Convierte origen y destino en objetos JSON:
  ```json
  {
    "lat": 0,
    "lng": 0,
    "direccion": "texto ingresado",
    "nombre": "Origen/Destino"
  }
  ```
- ✅ Después de crear exitosamente, redirige y refresca con `router.refresh()`
- ✅ Mensajes de error mejorados

---

### PARTE 3: PANEL MOTORIZADO (WEB) ✅

#### 6. ✅ Páginas para Motorizado

##### `app/motorizado/login/page.tsx`
- ✅ Login específico para motorizados
- ✅ Valida que el usuario sea MOTORIZADO (no TIENDA)
- ✅ Redirige a `/motorizado/dashboard` después del login
- ✅ Link al panel de tiendas
- ✅ Colores morados/rosados para diferenciarse del panel de tiendas

##### `app/motorizado/dashboard/page.tsx`
- ✅ Ver lista de envíos PENDIENTE_PUJAS
- ✅ 3 cards de estadísticas:
  - Envíos Disponibles
  - Mis Ofertas (preparado)
  - Envíos Completados (preparado)
- ✅ Información del período de trial (si aplica)
- ✅ Header con info del motorizado (email, vehículo, licencia)
- ✅ Botón de logout
- ✅ Validación de que solo motorizados accedan

#### 7. ✅ Componentes para Motorizado

##### `components/MotorizadoLoginForm.tsx`
- ✅ Formulario de login específico
- ✅ Valida que sea MOTORIZADO
- ✅ Mensaje de error si intenta acceder una TIENDA
- ✅ Colores morados (diferente a azul de tiendas)
- ✅ Link al panel de tiendas

##### `components/EnviosDisponiblesList.tsx`
- ✅ Lista de envíos PENDIENTE_PUJAS
- ✅ Grid de cards (responsive: 1 columna en móvil, 3 en desktop)
- ✅ Muestra: tienda, origen, destino, precio, detalles, ofertas, fecha
- ✅ Botón "Hacer Oferta" (preparado para conectar)
- ✅ Loading state
- ✅ Estado vacío con botón de recargar

##### `components/OfertaForm.tsx`
- ✅ Formulario para hacer oferta
- ✅ Campos:
  - Precio oferta (número con decimales)
  - Tiempo estimado (minutos, número entero)
- ✅ Muestra precio base del envío
- ✅ Validación de campos
- ✅ Preparado para conectar con API (TODO para DÍA 6)
- ✅ Callback `onSuccess` para acciones post-oferta

---

## 📁 Archivos Creados/Modificados

### Backend
```
backend/src/
├── controllers/
│   └── enviosController.js      ✅ CRUD completo
└── routes/
    └── envios.js                ✅ Rutas con middlewares
```

### Frontend
```
web-app/
├── app/
│   ├── dashboard/
│   │   └── page.tsx             ✅ Conectado con backend real
│   └── motorizado/
│       ├── login/
│       │   └── page.tsx         ✅ Login motorizado
│       └── dashboard/
│           └── page.tsx         ✅ Dashboard motorizado
├── components/
│   ├── CreateEnvioForm.tsx      ✅ JSON con coordenadas
│   ├── MotorizadoLoginForm.tsx  ✅ Formulario login
│   ├── EnviosDisponiblesList.tsx✅ Lista para motorizado
│   └── OfertaForm.tsx           ✅ Formulario ofertas
└── lib/
    └── api.ts                   ✅ APIs de envíos
```

---

## 🧪 Pruebas del Sistema Completo

### Test 1: Tienda Crea Envío
1. Login como tienda: `http://localhost:3001/login`
2. Ir a dashboard
3. Click "Crear Envío"
4. Llenar formulario:
   - Origen: "Av. Lima 123"
   - Destino: "Jr. Flores 456"
   - Precio: "20.00"
   - Detalles: "Paquete mediano"
5. Click "Crear Envío"
6. ✅ Verificar redirección a dashboard
7. ✅ Verificar que el envío aparece en la lista

### Test 2: Tienda Ve Sus Envíos
1. En dashboard de tienda
2. ✅ Ver lista de envíos (datos reales desde backend)
3. ✅ Ver cantidad de ofertas (0 por ahora)
4. ✅ Ver estados con colores

### Test 3: Tienda Cancela Envío
1. En dashboard de tienda
2. Click en "Cancelar" en un envío
3. Confirmar alert
4. ✅ Verificar que el envío se actualiza a CANCELADO
5. ✅ Verificar que la lista se recarga automáticamente

### Test 4: Motorizado Ve Envíos Disponibles
1. Logout de tienda
2. Ir a `http://localhost:3001/motorizado/login`
3. Login como motorizado (o registrar uno nuevo en backend)
4. ✅ Verificar redirección a `/motorizado/dashboard`
5. ✅ Ver lista de envíos PENDIENTE_PUJAS
6. ✅ Ver cards con información
7. ✅ Click en "Hacer Oferta" (alerta temporal)

### Test 5: Validación de Roles
1. Login como tienda en `/motorizado/login`
2. ✅ Verificar error: "Esta cuenta no es de motorizado"
3. Login como motorizado en `/login`
4. ✅ Debe funcionar pero redirigir a panel incorrecto (a mejorar)

---

## 🎨 Diseño Implementado

### Panel de Tiendas
- **Color principal:** Azul (`bg-blue-500`)
- **Gradiente:** Azul a índigo
- **Iconos:** Bootstrap icons

### Panel de Motorizados
- **Color principal:** Morado (`bg-purple-500`)
- **Gradiente:** Morado a rosa
- **Diferenciación visual clara**

---

## 🔄 Flujo de Datos Backend ↔ Frontend

### Crear Envío
```
Frontend                    Backend
CreateEnvioForm             enviosController.createEnvio
    |                              |
    POST /api/envios              |
    + Bearer token                |
    + JSON body                   |
    |                              |
    ├─> Valida token              |
    ├─> Valida rol TIENDA         |
    ├─> Busca tienda              |
    ├─> Crea envío en DB          |
    └─> Retorna envío             |
                                  |
Dashboard ← JSON response ←───────┘
Recarga lista automáticamente
```

### Listar Envíos
```
Frontend                    Backend
Dashboard/                  enviosController.getEnvios
MotorizadoDashboard                |
    |                              |
    GET /api/envios               |
    + Bearer token                |
    |                              |
    ├─> Valida token              |
    ├─> Si TIENDA: sus envíos     |
    ├─> Si MOTORIZADO: disponibles|
    ├─> Ordena por fecha DESC     |
    └─> Retorna lista             |
                                  |
setEnvios() ← JSON response ←─────┘
Renderiza tabla/cards
```

---

## 📊 Estructura de Datos

### Envío Creado
```json
{
  "message": "Envío creado exitosamente",
  "envio": {
    "id": "clxxx123",
    "tiendaId": "clyyy456",
    "origen": {
      "lat": 0,
      "lng": 0,
      "direccion": "Av. Lima 123",
      "nombre": "Origen"
    },
    "destino": {
      "lat": 0,
      "lng": 0,
      "direccion": "Jr. Flores 456",
      "nombre": "Destino"
    },
    "precio": 20.00,
    "estado": "PENDIENTE_PUJAS",
    "detalles": "Paquete mediano",
    "createdAt": "2025-10-21T15:00:00.000Z",
    "tienda": {
      "id": "clyyy456",
      "nombre": "Tienda Test",
      "user": {
        "email": "tienda@test.com"
      }
    }
  }
}
```

---

## ✅ Checklist del DÍA 5

### Backend
- [x] Controlador de envíos completo
- [x] Rutas con middlewares de autenticación
- [x] Validación de roles (TIENDA/MOTORIZADO)
- [x] CRUD funcional con Prisma
- [x] Filtros por rol de usuario

### Frontend - Tiendas
- [x] Conectado con backend real
- [x] Lista de envíos desde API
- [x] Crear envío con JSON
- [x] Cancelar envío
- [x] Loading states
- [x] Manejo de errores

### Frontend - Motorizados
- [x] Login específico
- [x] Dashboard con envíos disponibles
- [x] Lista de cards responsive
- [x] Formulario de ofertas (preparado)
- [x] Validación de rol

---

## 🔜 Próximo Día (DÍA 6)

### Sistema de Ofertas/Pujas
1. Crear backend/src/controllers/ofertasController.js
2. Implementar POST /api/ofertas
3. Implementar GET /api/ofertas/envio/:envioId
4. Implementar PUT /api/ofertas/:id/aceptar
5. Conectar OfertaForm con backend
6. Página de detalle de envío para tienda
7. Ver ofertas recibidas y aceptarlas
8. Actualizar estado del envío a ASIGNADO

---

**DÍA 5 COMPLETADO ✅**

Backend con CRUD de envíos funcional + Frontend conectado con backend real + Panel de motorizados implementado.

