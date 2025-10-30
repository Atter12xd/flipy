# INSTRUCCIONES PARA PROBAR EL SISTEMA DE SUSCRIPCIONES

## 🚀 INICIO RÁPIDO

### 1. Iniciar Backend
```powershell
cd backend
npm run dev
```

El servidor debe iniciar en `http://localhost:3000`

### 2. Iniciar Frontend (en otra terminal)
```powershell
cd web-app
npm run dev
```

El frontend debe iniciar en `http://localhost:3001` (o el puerto que indique)

## 🧪 ESCENARIOS DE PRUEBA

### ESCENARIO 1: Motorizado Nuevo (Trial)

1. **Registrar/Logear como Motorizado**
   - Ve a `/motorizado/login`
   - Crea una cuenta nueva o usa una existente
   
2. **Verificar Estado de Trial**
   - Al entrar al dashboard, deberías ver:
     - Badge amarillo "Trial - 7d" (si es nuevo motorizado)
     - Card informativo sobre el período de prueba
     - Sin banner rojo (porque el trial está activo)

3. **Ver Detalles de Suscripción**
   - Click en el badge de estado en el header
   - O navega manualmente a `/motorizado/suscripcion`
   - Deberías ver:
     - Estado: "Trial Gratuito"
     - Mensaje: "Trial activo - X días restantes"
     - Card del plan con beneficios
     - Sección de pago simulado
     - Historial vacío (si es nuevo)

4. **Probar Funcionalidad con Trial**
   - Ve a "Envíos Disponibles"
   - Intenta hacer una oferta
   - ✅ Debe funcionar (trial activo)

### ESCENARIO 2: Simular Pago

1. **Navegar a Suscripción**
   - Ve a `/motorizado/suscripcion`

2. **Realizar Pago Simulado**
   - Selecciona un método de pago:
     - 💳 Tarjeta
     - 📱 Yape
     - 🏦 Transferencia
   - Click en "Pagar Ahora - S/ 110"
   - Verás:
     - Spinner de "Procesando..."
     - Mensaje de éxito verde
     - Actualización automática del estado

3. **Verificar Cambio de Estado**
   - El badge debe cambiar a verde "✓ Activo"
   - El mensaje debe decir "Suscripción activa - 30 días hasta próximo pago"
   - Deberías ver el pago en el historial:
     - Fecha: hoy
     - Monto: S/ 110.00
     - Método: el que elegiste
     - Estado: completado
     - ID: SIM-{timestamp}

4. **Verificar en Dashboard**
   - Ve al dashboard
   - El badge en el header debe mostrar "✓ Activo"
   - Card verde de "Suscripción Activa"

### ESCENARIO 3: Suscripción Vencida (Simulación Manual)

**Nota:** Para probar esto necesitarías manipular la base de datos directamente, ya que los 30 días no pasarán en la prueba.

**Método 1 - Editar DB Directamente:**
```sql
UPDATE motorizados 
SET "proximoPago" = NOW() - INTERVAL '1 day',
    "planActual" = 'inactivo'
WHERE "userId" = 'ID_DEL_USUARIO';
```

**Método 2 - Crear Motorizado con Trial Expirado:**
```sql
UPDATE motorizados 
SET "trialHasta" = NOW() - INTERVAL '1 day',
    "suscripcionActiva" = false,
    "planActual" = 'trial'
WHERE "userId" = 'ID_DEL_USUARIO';
```

Después de manipular la DB:

1. **Refrescar Dashboard**
   - Deberías ver:
     - ⚠️ Banner rojo fijo arriba: "Tu suscripción ha expirado..."
     - Badge rojo "✕ Vencido"
     - Mensaje de advertencia

2. **Intentar Hacer Oferta**
   - Ve a envíos disponibles
   - Intenta hacer una oferta
   - ❌ Debe BLOQUEARSE con error 403:
     ```json
     {
       "success": false,
       "message": "Suscripción inactiva. Renueva tu plan para continuar.",
       "bloqueado": true
     }
     ```

3. **Renovar Suscripción**
   - Click en "Renovar Ahora" del banner
   - O click en el badge rojo
   - Simula un nuevo pago
   - ✅ Acceso restaurado

### ESCENARIO 4: Verificar Protección de Endpoints

**Con Postman o cURL:**

1. **Intentar Crear Oferta Sin Suscripción**
```bash
curl -X POST http://localhost:3000/api/ofertas \
  -H "Authorization: Bearer TOKEN_DE_MOTORIZADO_VENCIDO" \
  -H "Content-Type: application/json" \
  -d '{"envioId": "xxx", "precioOferta": 10, "tiempoEstimado": 30}'
```
Expected: Status 403

2. **Intentar Crear Oferta Con Suscripción Activa**
```bash
curl -X POST http://localhost:3000/api/ofertas \
  -H "Authorization: Bearer TOKEN_DE_MOTORIZADO_ACTIVO" \
  -H "Content-Type: application/json" \
  -d '{"envioId": "xxx", "precioOferta": 10, "tiempoEstimado": 30}'
```
Expected: Status 200 (o error de validación de datos, pero no de suscripción)

3. **Verificar Estado de Suscripción**
```bash
curl http://localhost:3000/api/suscripcion/estado \
  -H "Authorization: Bearer TOKEN_DE_MOTORIZADO"
```
Expected: Estado completo de la suscripción

## 📋 CHECKLIST DE VALIDACIÓN

### Backend:
- [ ] ✅ Servidor inicia sin errores
- [ ] ✅ Endpoint GET /api/suscripcion/estado responde
- [ ] ✅ Endpoint POST /api/suscripcion/simular-pago funciona
- [ ] ✅ Endpoint GET /api/suscripcion/historial responde
- [ ] ✅ Middleware bloquea ofertas cuando suscripción vencida
- [ ] ✅ Middleware permite ofertas con trial activo
- [ ] ✅ Middleware permite ofertas con suscripción pagada

### Frontend:
- [ ] ✅ Página /motorizado/suscripcion carga correctamente
- [ ] ✅ Se muestra estado actual de suscripción
- [ ] ✅ Card del plan muestra información correcta
- [ ] ✅ Se puede simular pago
- [ ] ✅ Historial de pagos se muestra después del pago
- [ ] ✅ Banner rojo aparece cuando suscripción vencida
- [ ] ✅ Badge de estado se muestra en dashboard
- [ ] ✅ Badge es clickeable y redirige a página de suscripción
- [ ] ✅ Card informativo aparece en dashboard cuando activo

### UX/UI:
- [ ] ✅ Animaciones funcionan correctamente
- [ ] ✅ Botones responden al hover
- [ ] ✅ Spinner se muestra durante procesamiento
- [ ] ✅ Mensajes de éxito/error son claros
- [ ] ✅ Diseño responsive en mobile
- [ ] ✅ Colores e iconos son consistentes

## 🐛 TROUBLESHOOTING

### El servidor backend no inicia:
```powershell
cd backend
# Verificar variables de entorno
cat .env

# Regenerar cliente de Prisma
npx prisma generate

# Aplicar schema nuevamente
npx prisma db push

# Intentar de nuevo
npm run dev
```

### Error "Motorizado no encontrado":
- Asegúrate de estar logueado como un usuario con rol MOTORIZADO
- Verifica que el usuario tiene un registro en la tabla motorizados

### El pago simulado no actualiza el estado:
- Abre la consola del navegador (F12)
- Verifica errores en la consola
- Verifica que el token de autenticación sea válido
- Revisa los logs del backend

### El banner no aparece aunque la suscripción está vencida:
- Refresca la página completamente (Ctrl+F5)
- Verifica en la consola que `estadoSuscripcion.bloqueado = true`
- Verifica que el componente BannerSuscripcionVencida esté importado

## 📊 DATOS DE PRUEBA

### Plan Mensual:
- Precio: S/ 110.00 ($29 USD)
- Duración: 30 días
- Trial: 7 días gratis

### Métodos de Pago (Simulados):
- yape
- tarjeta
- transferencia

### Estados de Plan:
- "trial" - Período de prueba
- "mensual" - Suscripción mensual pagada
- "anual" - Suscripción anual (futuro)
- "inactivo" - Sin suscripción

## 🎯 RESULTADOS ESPERADOS

### ✅ Motorizado Nuevo:
- Trial de 7 días automático
- Puede hacer ofertas durante trial
- Ve badge amarillo "Trial"

### ✅ Motorizado con Pago Activo:
- Badge verde "✓ Activo"
- Acceso completo a todas las funciones
- Historial de pagos visible
- Ve próxima fecha de pago

### ✅ Motorizado Vencido:
- Banner rojo de advertencia
- Badge rojo "✕ Vencido"
- BLOQUEADO para hacer ofertas
- BLOQUEADO para actualizar tracking
- Puede ver página de suscripción y renovar

## 💡 TIPS

1. **Usar DevTools:** Abre la consola del navegador para ver logs y errores
2. **Network Tab:** Revisa las respuestas de la API en la pestaña Network
3. **Backend Logs:** Observa la terminal del backend para ver requests
4. **Prisma Studio:** Usa `npx prisma studio` para ver/editar datos directamente

## 📞 SOPORTE

Si encuentras problemas:
1. Revisa los logs del backend
2. Revisa la consola del navegador
3. Verifica que la base de datos esté accesible
4. Asegúrate de que todas las dependencias estén instaladas
5. Verifica que los puertos 3000 (backend) y siguiente puerto libre (frontend) estén disponibles

---

**Sistema implementado y listo para pruebas completas** ✅





