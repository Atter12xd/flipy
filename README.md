# 🚀 FLIPY - Plataforma de Delivery con Sistema de Pujas

<div align="center">

![Estado del Proyecto](https://img.shields.io/badge/Estado-Beta%20v0.1.0-brightgreen)
![Testing](https://img.shields.io/badge/Testing-80%25%20Completado-yellow)
![Licencia](https://img.shields.io/badge/Licencia-Pendiente-lightgrey)

**Plataforma moderna de delivery donde las tiendas y motorizados se conectan mediante un sistema de pujas competitivas**

[Demo](#-demo) • [Características](#-características-principales) • [Instalación](#-instalación-rápida) • [Documentación](#-documentación)

</div>

---

## 📖 Descripción

**FLIPY** es una plataforma innovadora de delivery que revoluciona la forma en que se asignan los envíos. En lugar de algoritmos automáticos, utilizamos un sistema de **pujas competitivas** donde:

- 🏪 **Tiendas** crean solicitudes de envío con precio base
- 🏍️ **Motorizados** ofertan con su mejor precio y tiempo estimado
- ✅ **Tiendas** revisan ofertas y eligen la mejor opción
- 📦 **Motorizado** realiza la entrega

### ¿Por qué FLIPY?

- **Precios Competitivos:** Los motorizados compiten, las tiendas ahorran
- **Flexibilidad:** Las tiendas tienen el control total de sus envíos
- **Transparencia:** Sistema de ofertas visible y justo
- **Eficiencia:** Asignación rápida y clara de envíos

---

## 🎯 Características Principales

### Para Tiendas 🏪
- ✅ Registro y autenticación segura
- ✅ Dashboard intuitivo con estadísticas
- ✅ Crear envíos con origen, destino y precio
- ✅ Recibir múltiples ofertas de motorizados
- ✅ Comparar ofertas (precio y tiempo)
- ✅ Aceptar la mejor oferta con un click
- ✅ Cancelar envíos cuando sea necesario
- ✅ Ver historial completo de envíos

### Para Motorizados 🏍️
- ✅ Registro con licencia y vehículo
- ✅ Dashboard con envíos disponibles
- ✅ Ver detalles completos de cada envío
- ✅ Hacer ofertas competitivas
- ✅ Ver envíos asignados
- ✅ Acceso a datos de contacto de la tienda
- ✅ Seguimiento de envíos completados
- ✅ Período de prueba de 7 días

### Características Técnicas 🔧
- 🔒 Autenticación JWT segura
- 🎨 UI moderna y responsive (mobile, tablet, desktop)
- ⚡ Loading states y feedback visual
- ✅ Validaciones frontend y backend
- 🐛 Manejo de errores robusto
- 📊 Estados del envío en tiempo real
- 🔐 Passwords hasheados con bcrypt
- 🛡️ Protección de rutas y autorización por roles

---

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** 18+ - Runtime JavaScript
- **Express.js** 4.x - Framework web
- **PostgreSQL** 14+ - Base de datos relacional
- **Prisma ORM** 5.x - ORM moderno
- **JWT** - Autenticación
- **bcrypt** - Hash de passwords

### Frontend Web
- **Next.js** 14+ (App Router) - Framework React
- **React** 18+ - Librería UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** 3.x - Framework CSS
- **Fetch API** - HTTP requests

### Apps Móviles (Futuro)
- **React Native** - Framework móvil
- iOS y Android support

---

## 📁 Estructura del Proyecto

```
flipy/
├── 📱 app-motorizado/      # App móvil para motorizados (React Native) - FUTURO
├── 📱 app-tienda/          # App móvil para tiendas (React Native) - FUTURO
├── 🔧 backend/             # API REST (Node.js + Express)
│   ├── src/
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── middleware/     # Auth, roles, validaciones
│   │   ├── routes/         # Rutas de la API
│   │   └── utils/          # Helpers
│   ├── prisma/
│   │   └── schema.prisma   # Schema de base de datos
│   └── server.js           # Entry point
├── 🎨 web-app/             # Frontend web (Next.js)
│   ├── app/                # App Router de Next.js
│   │   ├── dashboard/      # Dashboard tienda
│   │   └── motorizado/     # Dashboard motorizado
│   ├── components/         # Componentes React
│   └── lib/                # Utils y API client
├── 📚 docs/                # Documentación técnica
├── 📄 README.md            # Este archivo
├── 📄 README_DEMO.md       # Guía de demostración
└── 📄 CHANGELOG.md         # Historial de cambios
```

---

## 🚀 Instalación Rápida

### Requisitos Previos
- ✅ Node.js 18+ ([Descargar](https://nodejs.org/))
- ✅ PostgreSQL 14+ ([Descargar](https://www.postgresql.org/))
- ✅ npm 9+ (incluido con Node.js)
- ✅ Git

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/flipy.git
cd flipy
```

### Paso 2: Instalar Dependencias
```bash
# Instalar todas las dependencias del monorepo
npm install
```

### Paso 3: Configurar Variables de Entorno

#### Backend (`backend/.env`)
```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/flipy"

# Puerto del servidor
PORT=3000

# JWT Secret (cambiar en producción)
JWT_SECRET="tu-secreto-jwt-super-seguro-cambiar-en-produccion"

# Entorno
NODE_ENV=development
```

#### Frontend Web (`web-app/.env.local`)
```env
# URL del backend API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Paso 4: Configurar Base de Datos
```bash
# Crear base de datos PostgreSQL
createdb flipy

# Ejecutar migraciones con Prisma
cd backend
npx prisma migrate dev

# (Opcional) Ver base de datos con Prisma Studio
npx prisma studio
```

### Paso 5: Iniciar Servidores

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
# ✅ Backend corriendo en http://localhost:3000
```

#### Terminal 2 - Frontend
```bash
cd web-app
npm run dev
# ✅ Frontend corriendo en http://localhost:3001
```

### Paso 6: ¡Listo! 🎉
- **Backend API:** http://localhost:3000
- **Frontend Web:** http://localhost:3001

---

## 📖 Demo Rápida

### Crear Usuario Tienda
1. Ir a http://localhost:3001
2. Click en "Regístrate aquí"
3. Completar formulario:
   - Nombre: "Demo Store"
   - Email: tienda@demo.com
   - Password: demo12345
4. ¡Listo! Ya puedes crear envíos

### Crear Usuario Motorizado
```bash
# Usar cURL o Postman
curl -X POST http://localhost:3000/api/auth/register/motorizado \
  -H "Content-Type: application/json" \
  -d '{
    "email": "motorizado@demo.com",
    "password": "demo12345",
    "phone": "+51987654321",
    "licencia": "ABC123456",
    "vehiculo": "Moto Yamaha"
  }'
```

Luego login en: http://localhost:3001/motorizado/login

**📚 Para una demo completa paso a paso, ver [README_DEMO.md](README_DEMO.md)**

---

## 📚 Documentación

### Documentos Principales
- 📋 **[README_DEMO.md](README_DEMO.md)** - Guía completa de demostración
- 📝 **[CHANGELOG.md](CHANGELOG.md)** - Historial de cambios y features
- ✅ **[DIA7_TESTING_CHECKLIST.md](docs/DIA7_TESTING_CHECKLIST.md)** - Checklist de testing

### Documentación Técnica del Backend
- 🔐 **[API_AUTH_DOCS.md](backend/API_AUTH_DOCS.md)** - Documentación de autenticación
- 📚 **[README_AUTH.md](backend/README_AUTH.md)** - Guía de autenticación
- 🏗️ **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Arquitectura del sistema

### Resúmenes Diarios
- 📅 **[DIA3_RESUMEN.md](backend/DIA3_RESUMEN.md)** - Sistema de ofertas
- 📅 **[DIA5_RESUMEN.md](backend/DIA5_RESUMEN.md)** - Frontend completo
- 📅 **[DIA6_RESUMEN.md](backend/DIA6_RESUMEN.md)** - Mejoras de UX

---

## 🔌 API Endpoints

### Autenticación
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register/tienda` | Registrar tienda | No |
| POST | `/api/auth/register/motorizado` | Registrar motorizado | No |
| POST | `/api/auth/login` | Login universal | No |

### Envíos
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/envios` | Listar envíos | Sí |
| POST | `/api/envios` | Crear envío | Sí (TIENDA) |
| GET | `/api/envios/:id` | Detalle de envío | Sí |
| DELETE | `/api/envios/:id` | Cancelar envío | Sí (TIENDA) |
| GET | `/api/envios/motorizado/asignados` | Envíos asignados | Sí (MOTORIZADO) |

### Ofertas
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/ofertas` | Crear oferta | Sí (MOTORIZADO) |
| GET | `/api/ofertas/envio/:envioId` | Listar ofertas | Sí |
| PUT | `/api/ofertas/:id/aceptar` | Aceptar oferta | Sí (TIENDA) |

**📚 Ver documentación completa en [API_AUTH_DOCS.md](backend/API_AUTH_DOCS.md)**

---

## 🧪 Testing

### Estado Actual
- ✅ Testing manual completo (100%)
- ✅ Validaciones frontend y backend
- ✅ Casos de uso principales cubiertos
- ⏳ Tests automatizados (pendiente)

### Ejecutar Testing Manual
```bash
# Ver checklist completo
cat docs/DIA7_TESTING_CHECKLIST.md

# Seguir guía de demo
cat README_DEMO.md
```

### Testing Automatizado (Futuro)
```bash
# Tests unitarios
npm run test

# Tests de integración
npm run test:integration

# Coverage
npm run test:coverage
```

---

## 🎬 Flujo de Usuario Típico

```mermaid
graph LR
    A[Tienda crea envío] --> B[Envío publicado]
    B --> C[Motorizados ven envío]
    C --> D[Motorizado hace oferta]
    D --> E[Tienda recibe ofertas]
    E --> F[Tienda acepta oferta]
    F --> G[Envío asignado]
    G --> H[Motorizado inicia ruta]
    H --> I[Entrega completada]
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: Amazing Feature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de Código
- TypeScript para frontend
- ESLint + Prettier
- Mensajes de commit descriptivos
- Tests para nuevas features

---

## 🐛 Reportar Bugs

Encontraste un bug? Por favor abre un issue con:
- 📝 Descripción del bug
- 🔁 Pasos para reproducir
- 💻 Screenshots si aplica
- 🌐 Navegador y versión

---

## 📊 Roadmap

### v0.2.0 (Próxima versión)
- [ ] Formulario de registro motorizado en frontend
- [ ] Sistema de notificaciones en tiempo real
- [ ] Integración con Google Maps API
- [ ] Tests automatizados (Jest + Cypress)

### v0.3.0
- [ ] App móvil React Native para motorizados
- [ ] Sistema de pagos (Stripe)
- [ ] Chat en tiempo real
- [ ] Tracking GPS en tiempo real

### v1.0.0
- [ ] App móvil React Native para tiendas
- [ ] Panel de administración
- [ ] Sistema de calificaciones
- [ ] Reportes y analytics

---

## 👨‍💻 Autores

- **AI Assistant** - Desarrollo inicial

---

## 📄 Licencia

Este proyecto está en proceso de definir su licencia.

---

## 🙏 Agradecimientos

- Express.js por el excelente framework backend
- Next.js por el increíble framework React
- Prisma por el ORM moderno
- Tailwind CSS por el framework de estilos
- PostgreSQL por la robusta base de datos

---

## 📞 Contacto y Soporte

- 📧 Email: soporte@flipy.com (pendiente)
- 📚 Documentación: Ver `/docs`
- 🐛 Issues: GitHub Issues

---

## ⭐ Show your support

Si te gusta este proyecto, ¡dale una ⭐ en GitHub!

---

<div align="center">

**Hecho con ❤️ para revolucionar el delivery**

[Volver arriba](#-flipy---plataforma-de-delivery-con-sistema-de-pujas)

</div>


