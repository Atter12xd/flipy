# 🚀 FLIPY - Guía de Demostración

Guía paso a paso para realizar una demostración completa de la plataforma FLIPY.

---

## 📋 Requisitos Previos

Antes de comenzar la demo, asegúrate de tener:
- ✅ Backend corriendo en `http://localhost:3000`
- ✅ Frontend corriendo en `http://localhost:3001`
- ✅ Base de datos PostgreSQL activa
- ✅ Migraciones de Prisma ejecutadas

---

## 🎬 DEMO COMPLETA: Flujo de Envío End-to-End

### **PARTE 1: Registro y Login de Tienda** ⏱️ 3 minutos

#### Paso 1: Registrar una Tienda Nueva
1. Abrir navegador en `http://localhost:3001`
2. Click en **"Regístrate aquí"**
3. Llenar el formulario:
   - **Nombre de Tienda:** "Pollería El Sabor"
   - **Dirección:** "Av. Larco 1234, Miraflores"
   - **Email:** `tienda1@demo.com`
   - **Teléfono:** `+51987654321`
   - **Contraseña:** `demo12345` (mínimo 8 caracteres)
   - **Confirmar Contraseña:** `demo12345`
4. Click en **"Registrar Tienda"**
5. ✅ **Resultado esperado:** Redirección automática al Dashboard

#### Paso 2: Explorar Dashboard de Tienda
Observar las siguientes secciones:
- **Stats Cards:**
  - Total Envíos: 0
  - Pendientes: 0
  - Billetera: S/ 0.00
- **Tabla de Envíos:** Vacía con mensaje "No tienes envíos todavía"
- **Header:** Muestra email y nombre de tienda

---

### **PARTE 2: Crear un Envío** ⏱️ 2 minutos

#### Paso 3: Crear Primer Envío
1. Click en botón **"Crear Envío"** (azul, esquina superior derecha)
2. Llenar formulario:
   - **Origen:** "Av. Larco 1234, Miraflores"
   - **Destino:** "Calle Los Pinos 567, San Isidro"
   - **Precio:** `25.00`
   - **Detalles:** "Pedido de pollo a la brasa para 4 personas. Incluye papas y ensalada. Manejar con cuidado."
3. Click en **"Crear Envío"**
4. ✅ **Resultado esperado:** 
   - Mensaje verde "¡Envío creado exitosamente!"
   - Redirección al dashboard después de 1.5 segundos

#### Paso 4: Verificar Envío Creado
En el Dashboard, observar:
- **Stats Cards actualizados:**
  - Total Envíos: 1
  - Pendientes: 1 (estado PENDIENTE_PUJAS)
- **Tabla de Envíos:**
  - Una fila con el envío recién creado
  - Badge amarillo "Pendiente de Pujas"
  - Contador "Sin ofertas"

---

### **PARTE 3: Registro y Login de Motorizado** ⏱️ 3 minutos

#### Paso 5: Abrir Panel de Motorizado
1. En otra pestaña o ventana incógnita, ir a `http://localhost:3001/motorizado/login`
2. **Nota:** Como no hay formulario de registro de motorizado en el frontend, usaremos la API directamente

#### Paso 6: Registrar Motorizado via API (Postman/cURL)
```bash
# Usando cURL
curl -X POST http://localhost:3000/api/auth/register/motorizado \
  -H "Content-Type: application/json" \
  -d '{
    "email": "motorizado1@demo.com",
    "password": "demo12345",
    "phone": "+51987654322",
    "licencia": "Q12345678",
    "vehiculo": "Moto Honda 125cc"
  }'
```

**Respuesta esperada:**
```json
{
  "message": "Motorizado registrado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "motorizado1@demo.com",
    "role": "MOTORIZADO",
    ...
  }
}
```

#### Paso 7: Login de Motorizado
1. En `http://localhost:3001/motorizado/login`
2. Ingresar credenciales:
   - **Email:** `motorizado1@demo.com`
   - **Contraseña:** `demo12345`
3. Click en **"Iniciar Sesión"**
4. ✅ **Resultado esperado:** Redirección al Dashboard de Motorizado

#### Paso 8: Explorar Dashboard de Motorizado
Observar:
- **Stats Cards:**
  - Envíos Disponibles: 1
  - Envíos Asignados: 0
  - Envíos Completados: 0
- **Sección "Mis Envíos Asignados":** Vacía
- **Sección "Envíos Disponibles":** 1 tarjeta con el envío de la tienda

---

### **PARTE 4: Hacer una Oferta** ⏱️ 2 minutos

#### Paso 9: Ver Detalle del Envío Disponible
En la tarjeta del envío disponible, observar:
- Nombre de la tienda: "Pollería El Sabor"
- Origen y Destino
- Precio base: S/ 25.00
- Detalles del pedido
- Contador de ofertas: 0 ofertas

#### Paso 10: Hacer Oferta
1. Click en botón **"Hacer Oferta"** (morado)
2. Se abre modal con información del envío
3. Llenar formulario de oferta:
   - **Tu Precio:** `20.00` (menor que el precio base)
   - **Tiempo Estimado:** `30` minutos
4. Click en **"Enviar Oferta"**
5. ✅ **Resultado esperado:**
   - Mensaje verde "¡Oferta creada exitosamente!"
   - Modal se cierra automáticamente
   - Lista de envíos disponibles se actualiza
   - Contador ahora muestra "1 ofertas"

---

### **PARTE 5: Revisar y Aceptar Oferta (Tienda)** ⏱️ 3 minutos

#### Paso 11: Volver a Dashboard de Tienda
1. Cambiar a la pestaña/ventana de la tienda
2. Recargar página para ver actualizaciones
3. Observar en la tabla:
   - Contador ahora muestra **"1 ofertas"** (badge morado)

#### Paso 12: Ver Detalle del Envío con Ofertas
1. Click en **"Ver Ofertas"** en la fila del envío
2. Se abre página de detalle `/dashboard/envios/[id]`
3. Observar información del envío:
   - Origen y Destino con iconos de ubicación
   - Precio base destacado
   - Detalles completos

#### Paso 13: Revisar Oferta Recibida
En la sección "Ofertas Recibidas (1)", observar:
- **Precio Ofertado:** S/ 20.00 (en grande, morado)
- **Tiempo Estimado:** 30 min
- **Información del Motorizado:**
  - Licencia: Q12345678
  - Vehículo: Moto Honda 125cc (badge morado)
  - Email: motorizado1@demo.com
  - Teléfono: +51987654322

#### Paso 14: Aceptar la Oferta
1. Click en botón verde **"Aceptar"**
2. Confirmar en el diálogo: **"¿Estás seguro de aceptar esta oferta?"**
3. ✅ **Resultado esperado:**
   - Mensaje "¡Oferta aceptada exitosamente!"
   - La oferta ahora tiene badge verde "✓ Aceptada"
   - Estado del envío cambia a **"ASIGNADO"** (azul)
   - Botón "Aceptar" desaparece

#### Paso 15: Verificar en Dashboard de Tienda
1. Volver al Dashboard principal
2. Observar cambios:
   - **Stats:** Pendientes ahora es 0
   - **Tabla:** Estado del envío es "Asignado" (badge azul)

---

### **PARTE 6: Ver Envío Asignado (Motorizado)** ⏱️ 2 minutos

#### Paso 16: Volver a Dashboard de Motorizado
1. Cambiar a la pestaña/ventana del motorizado
2. Recargar página
3. Observar cambios en Stats:
   - **Envíos Disponibles:** 0 (el envío ya no está disponible)
   - **Envíos Asignados:** 1 (nuevo)

#### Paso 17: Ver Detalle del Envío Asignado
En la sección "Mis Envíos Asignados", observar la tarjeta:
- **Badge destacado:** "✓ ASIGNADO A TI" (verde)
- **Estado:** "Asignado" (badge verde)
- **Información del Envío:** Origen, Destino, Detalles
- **Tu Oferta Aceptada:**
  - Precio: S/ 20.00 (verde, grande)
  - Tiempo: 30 min
- **Información de Contacto de la Tienda:**
  - Email: tienda1@demo.com
  - Teléfono: +51987654321
- **Botón:** "Iniciar Ruta" (azul)

#### Paso 18: Simular "Iniciar Ruta"
1. Click en **"Iniciar Ruta"**
2. ✅ **Resultado esperado:** Alert "Función 'Iniciar Ruta' próximamente"
   - **Nota:** Esta funcionalidad está preparada para actualizar el estado a "EN_CURSO"

---

## 🎭 Usuarios de Prueba para Demo Rápida

Si ya tienes usuarios creados en tu base de datos:

### Tienda
- **Email:** `tienda@demo.com`
- **Password:** `demo12345`
- **Nombre:** "Demo Store"

### Motorizado
- **Email:** `motorizado@demo.com`
- **Password:** `demo12345`
- **Vehículo:** "Moto Yamaha"
- **Licencia:** "ABC123456"

---

## 📸 Screenshots de Cada Pantalla

### 1. Registro de Tienda
![Registro Tienda](docs/screenshots/registro-tienda.png)
- Formulario con 6 campos
- Validación de email y contraseña
- Confirmación de contraseña

### 2. Dashboard Tienda - Vacío
![Dashboard Vacío](docs/screenshots/dashboard-tienda-vacio.png)
- 3 stats cards
- Mensaje "No tienes envíos todavía"
- Botón "Crear Envío" prominente

### 3. Crear Envío
![Crear Envío](docs/screenshots/crear-envio.png)
- Formulario simple con 4 campos
- Hints debajo de cada campo
- Botones Cancelar/Crear

### 4. Dashboard Tienda - Con Envíos
![Dashboard Con Envíos](docs/screenshots/dashboard-tienda-envios.png)
- Tabla responsive
- Estados con colores
- Contador de ofertas

### 5. Detalle de Envío con Ofertas
![Detalle Envío](docs/screenshots/detalle-envio-ofertas.png)
- Información completa del envío
- Lista de ofertas ordenada por precio
- Botones de acción

### 6. Login Motorizado
![Login Motorizado](docs/screenshots/login-motorizado.png)
- Formulario simple
- Link a panel de tiendas

### 7. Dashboard Motorizado
![Dashboard Motorizado](docs/screenshots/dashboard-motorizado.png)
- 3 stats cards
- Sección de envíos asignados
- Grid de envíos disponibles

### 8. Envíos Asignados
![Envíos Asignados](docs/screenshots/envios-asignados.png)
- Tarjetas destacadas en verde
- Información de contacto
- Botones de acción según estado

---

## ⚡ Demo Express (5 minutos)

Para una demo rápida:

1. **Tienda - Crear Envío** (1 min)
   - Login → Crear Envío con datos precargados

2. **Motorizado - Hacer Oferta** (1 min)
   - Login → Ver envío → Hacer oferta

3. **Tienda - Aceptar Oferta** (1 min)
   - Ver ofertas → Aceptar mejor oferta

4. **Motorizado - Ver Asignado** (1 min)
   - Ver envío asignado con datos de contacto

5. **Mostrar Features** (1 min)
   - Responsive design
   - Estados con colores
   - Validaciones en tiempo real

---

## 🐛 Troubleshooting

### Error: "No hay token"
**Solución:** Hacer logout y login de nuevo

### Error: "Credenciales inválidas"
**Solución:** Verificar que el usuario existe en la base de datos

### Envíos no se actualizan
**Solución:** Recargar la página (F5)

### Backend no responde
**Solución:** 
```bash
cd backend
npm run dev
```

---

## 🚀 Mejoras Demostradas

### Día 1-3: Base del Sistema ✅
- Autenticación JWT
- CRUD de envíos
- Sistema de ofertas

### Día 4-5: Frontend Completo ✅
- Dashboard tienda
- Dashboard motorizado
- Formularios con validaciones

### Día 6: UX Mejorada ✅
- Estados visuales claros
- Loading states
- Mensajes de éxito/error

### Día 7: Testing y Pulido ✅
- Validación password 8 caracteres
- Console.logs optimizados
- Documentación completa

---

## 📊 Métricas de la Demo

Al final de la demo, habrás mostrado:
- ✅ 2 tipos de usuarios (Tienda y Motorizado)
- ✅ Flujo completo de envío (Crear → Ofertar → Aceptar → Asignar)
- ✅ 6 pantallas diferentes
- ✅ Validaciones en frontend y backend
- ✅ UI responsive y moderna
- ✅ Estados del envío en tiempo real

---

## 🎯 Puntos Clave a Destacar

1. **Seguridad:** JWT, passwords hasheados, validaciones
2. **UX:** Loading states, mensajes claros, confirmaciones
3. **Performance:** Requests optimizados, estados locales
4. **Escalabilidad:** Arquitectura modular, código limpio
5. **Responsive:** Funciona en mobile, tablet y desktop

---

**¡Demo Lista!** 🎉

Para preguntas o soporte: Ver `docs/DIA7_TESTING_CHECKLIST.md`

