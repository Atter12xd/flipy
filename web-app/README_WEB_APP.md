# 🌐 FLIPY Web App - Panel de Tiendas

Panel web para tiendas construido con Next.js 14, TypeScript y Tailwind CSS.

---

## 🚀 Inicio Rápido

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
El archivo `.env.local` ya está creado con:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=FLIPY
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**IMPORTANTE:** Asegúrate de que el backend esté corriendo en `http://localhost:3000`

### 3. Iniciar en Desarrollo
```bash
npm run dev
```

La app estará disponible en `http://localhost:3000` (o el siguiente puerto disponible si el 3000 está ocupado)

### 4. Build de Producción
```bash
npm run build
npm run start
```

---

## 📁 Estructura del Proyecto

```
web-app/
├── app/                           # App Router de Next.js
│   ├── page.tsx                  # Home (redirige según auth)
│   ├── layout.tsx                # Layout principal
│   ├── login/page.tsx            # Login
│   ├── register/page.tsx         # Registro
│   └── dashboard/                # Dashboard de tienda
│       ├── page.tsx              # Lista de envíos
│       └── crear-envio/page.tsx  # Crear envío
├── components/                    # Componentes reutilizables
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── CreateEnvioForm.tsx
├── lib/                          # Utilidades
│   ├── api.ts                    # Funciones API
│   └── auth.ts                   # Manejo de autenticación
├── middleware.ts                 # Middleware de Next.js
└── .env.local                    # Variables de entorno
```

---

## 🔐 Autenticación

### Flujo de Autenticación
1. Usuario ingresa credenciales en `/login` o se registra en `/register`
2. Frontend hace POST al backend
3. Backend retorna JWT token y datos del usuario
4. Frontend guarda token en `localStorage`
5. Frontend guarda datos del usuario en `localStorage`
6. Usuario es redirigido a `/dashboard`

### Protección de Rutas
- Rutas públicas: `/`, `/login`, `/register`
- Rutas protegidas: `/dashboard`, `/dashboard/crear-envio`
- Verificación en cada página usando `isAuthenticated()`

### Cerrar Sesión
- Click en "Cerrar Sesión" en el dashboard
- Limpia `localStorage`
- Redirige a `/login`

---

## 📡 APIs Disponibles

### Autenticación
```typescript
import { authAPI } from '@/lib/api';

// Login
await authAPI.login({ email, password });

// Registro de tienda
await authAPI.registerTienda({
  email,
  password,
  phone,
  nombre,
  direccion
});
```

### Envíos
```typescript
import { enviosAPI } from '@/lib/api';

// Obtener todos los envíos
await enviosAPI.getAll();

// Obtener envío por ID
await enviosAPI.getById(id);

// Crear envío
await enviosAPI.create({
  origen: 'Av. Lima 123',
  destino: 'Jr. Flores 456',
  precio: 15.50,
  detalles: 'Opcional'
});

// Cancelar envío
await enviosAPI.cancel(id);
```

### Ofertas
```typescript
import { ofertasAPI } from '@/lib/api';

// Obtener ofertas de un envío
await ofertasAPI.getByEnvio(envioId);

// Aceptar oferta
await ofertasAPI.accept(ofertaId);
```

---

## 🎨 Componentes

### LoginForm
Formulario de inicio de sesión con:
- Input de email
- Input de password
- Validación de campos requeridos
- Manejo de errores
- Loading state
- Link a registro

**Uso:**
```tsx
import LoginForm from '@/components/LoginForm';

<LoginForm />
```

### RegisterForm
Formulario de registro de tienda con:
- Input de nombre de tienda
- Input de dirección
- Input de email
- Input de teléfono
- Input de password
- Input de confirmar password
- Validación de contraseñas coincidentes
- Manejo de errores
- Loading state
- Link a login

**Uso:**
```tsx
import RegisterForm from '@/components/RegisterForm';

<RegisterForm />
```

### CreateEnvioForm
Formulario para crear envío con:
- Input de origen
- Input de destino
- Input de precio
- Textarea de detalles (opcional)
- Validación de campos
- Manejo de errores
- Loading state
- Mensaje de éxito

**Uso:**
```tsx
import CreateEnvioForm from '@/components/CreateEnvioForm';

<CreateEnvioForm />
```

---

## 📄 Páginas

### Home (/)
- Verifica autenticación
- Redirige a `/dashboard` si está autenticado
- Redirige a `/login` si no está autenticado

### Login (/login)
- Formulario de login
- Redirige a `/dashboard` después del login
- Link a registro

### Register (/register)
- Formulario de registro de tienda
- Redirige a `/dashboard` después del registro
- Link a login

### Dashboard (/dashboard)
- Header con nombre de tienda y logout
- Cards de estadísticas:
  - Total envíos
  - Pendientes
  - Billetera
- Tabla de envíos
- Botón "Crear Envío"

### Crear Envío (/dashboard/crear-envio)
- Formulario completo
- Botón cancelar
- Botón crear envío
- Redirige a dashboard después de crear

---

## 🎨 Estilos con Tailwind CSS

### Colores Principales
- **Azul:** Botones primarios (`bg-blue-500`, `hover:bg-blue-700`)
- **Rojo:** Logout y errores (`bg-red-500`, `text-red-700`)
- **Verde:** Éxito (`bg-green-100`, `text-green-700`)
- **Gris:** Texto neutro y fondos (`bg-gray-50`, `text-gray-600`)

### Estados de Envíos
- **PENDIENTE_PUJAS:** Amarillo (`bg-yellow-100 text-yellow-800`)
- **ASIGNADO:** Azul (`bg-blue-100 text-blue-800`)
- **EN_CURSO:** Morado (`bg-purple-100 text-purple-800`)
- **ENTREGADO:** Verde (`bg-green-100 text-green-800`)
- **CANCELADO:** Rojo (`bg-red-100 text-red-800`)

---

## 🧪 Pruebas Manuales

### Test Completo de Flujo
1. **Registro:**
   - Ir a `http://localhost:3000`
   - Clic en "Regístrate aquí"
   - Llenar formulario
   - Verificar redirección a dashboard

2. **Logout:**
   - Clic en "Cerrar Sesión"
   - Verificar redirección a login

3. **Login:**
   - Ingresar credenciales
   - Verificar redirección a dashboard

4. **Crear Envío:**
   - Clic en "Crear Envío"
   - Llenar formulario
   - Verificar mensaje de éxito
   - Verificar redirección

---

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar en producción
npm run start

# Linting
npm run lint
```

---

## 🐛 Solución de Problemas

### Error: Cannot connect to backend
**Solución:** Asegúrate de que el backend esté corriendo en `http://localhost:3000`

### Error: Token inválido
**Solución:** Limpia localStorage y vuelve a hacer login
```javascript
localStorage.clear();
```

### Error: Redirige a login constantemente
**Solución:** Verifica que el token esté guardado correctamente:
```javascript
console.log(localStorage.getItem('flipy_auth_token'));
```

---

## 📚 Tecnologías Utilizadas

- **Next.js 15:** Framework React con App Router
- **TypeScript:** Tipado estático
- **Tailwind CSS:** Estilos utility-first
- **React:** Biblioteca UI
- **Fetch API:** Llamadas HTTP

---

## 🔄 Próximas Funcionalidades

- [ ] Conectar con backend real (actualmente usa datos hardcoded)
- [ ] Página de detalle de envío
- [ ] Visualización de ofertas recibidas
- [ ] Aceptar/rechazar ofertas
- [ ] Notificaciones en tiempo real
- [ ] Historial de envíos
- [ ] Perfil de tienda editable
- [ ] Gestión de billetera
- [ ] Filtros y búsqueda en tabla
- [ ] Paginación
- [ ] Gráficos de estadísticas

---

## 📝 Notas

- **LocalStorage:** Se usa para guardar el token JWT. En producción, considera usar cookies httpOnly.
- **Variables de Entorno:** Todas las variables públicas deben empezar con `NEXT_PUBLIC_`
- **Responsive:** El diseño es completamente responsive y funciona en móviles, tablets y desktop.

---

**Desarrollado para FLIPY - Sistema de delivery con pujas**

