# 🧪 GUÍA DE TESTING - SISTEMA DE EVIDENCIAS

## 🎯 TESTS PARA VERIFICAR LOS BUG FIXES

### ✅ TEST 1: Verificar Bug Fix #1 - Upload de Foto

**Objetivo:** Confirmar que el token se envía correctamente y la foto se sube sin error de autenticación.

**Pasos:**

1. **Preparación:**
   ```bash
   # Asegurarse que el backend está corriendo
   cd backend
   npm run dev
   ```

2. **Login como Motorizado:**
   - Abrir navegador en `http://localhost:3001` (o tu puerto frontend)
   - Ir a `/motorizado/login`
   - Login con credenciales de motorizado

3. **Ir a un Envío EN_CURSO:**
   - Ir a `/motorizado/dashboard`
   - Seleccionar un envío con estado EN_CURSO
   - O crear uno y cambiar estado a EN_CURSO

4. **Abrir DevTools (F12):**
   - Ir a la pestaña "Console"
   - Limpiar consola (Clear console)

5. **Subir Foto:**
   - Scroll hasta "Evidencias de Entrega"
   - Clic en "Seleccionar Foto"
   - Elegir una imagen (JPG o PNG, < 5MB)
   - Verificar que aparece el preview
   - Clic en "Subir Foto"

6. **Verificar Logs en BROWSER Console:**
   ```
   Deberías ver:
   ✅ [DEBUG] Token enviado: eyJhbGciOiJIUzI1NiIsI...
   ✅ [DEBUG] Enviando foto: mi-foto.jpg (245.67 KB)
   ✅ [DEBUG] Foto subida exitosamente: { success: true, data: {...} }
   
   NO deberías ver:
   ❌ [DEBUG] Error del servidor: ...
   ❌ Error: No estás autenticado
   ```

7. **Verificar Logs en SERVER Terminal:**
   ```
   Deberías ver:
   ✅ [DEBUG AUTH] Content-Type: multipart/form-data; boundary=...
   ✅ [DEBUG AUTH] Authorization header: PRESENTE
   ✅ [DEBUG AUTH] ✅ Token recibido: eyJhbGciOiJIUzI1NiIsI...
   ✅ [DEBUG AUTH] ✅ Usuario autenticado: motorizado@test.com (MOTORIZADO)
   ✅ [DEBUG EVIDENCIAS] === SUBIR FOTO ===
   ✅ [DEBUG EVIDENCIAS] Usuario autenticado: motorizado@test.com (MOTORIZADO)
   ✅ [DEBUG EVIDENCIAS] Envio ID: clx...
   ✅ [DEBUG EVIDENCIAS] Archivo recibido: mi-foto-123456789.jpg
   
   NO deberías ver:
   ❌ [DEBUG AUTH] ❌ Token no proporcionado
   ❌ [DEBUG EVIDENCIAS] ❌ Usuario no es motorizado
   ```

8. **Verificar Resultado:**
   - ✅ Botón "Subir Foto" debería cambiar a "✓ Foto Subida" (verde)
   - ✅ Mensaje "Foto subida exitosamente" (verde) debería aparecer
   - ✅ Archivo debería estar en `backend/uploads/evidencias/`

**Resultado Esperado:** ✅ PASS - Foto se sube sin error de autenticación

**Si FALLA:**
- Verificar que hiciste login correctamente
- Verificar que el token está en localStorage: `localStorage.getItem('token')`
- Verificar que el usuario es MOTORIZADO
- Verificar que el envío está EN_CURSO
- Copiar y pegar los logs de consola/terminal para análisis

---

### ✅ TEST 2: Verificar Bug Fix #2 - Firma No Desplazada (Desktop)

**Objetivo:** Confirmar que la firma se dibuja exactamente donde está el cursor.

**Pasos:**

1. **En la misma página del TEST 1** (envío EN_CURSO)

2. **Scroll hasta la sección "Firma Digital"**

3. **Test de Línea Horizontal:**
   - Posicionar cursor en el lado IZQUIERDO del canvas
   - Hacer clic y mantener presionado
   - Arrastrar horizontalmente hacia la DERECHA
   - Soltar
   - ✅ VERIFICAR: La línea debe aparecer EXACTAMENTE donde moviste el cursor
   - ❌ FALLA: Si la línea aparece desplazada (más a la derecha o izquierda)

4. **Test de Línea Vertical:**
   - Clic en "Limpiar"
   - Posicionar cursor en la parte SUPERIOR del canvas
   - Hacer clic y mantener presionado
   - Arrastrar verticalmente hacia ABAJO
   - Soltar
   - ✅ VERIFICAR: La línea debe aparecer EXACTAMENTE donde moviste el cursor

5. **Test de Línea Diagonal:**
   - Clic en "Limpiar"
   - Dibujar una línea desde esquina superior izquierda a inferior derecha
   - ✅ VERIFICAR: La línea debe seguir el cursor exactamente

6. **Test de Firma Completa:**
   - Clic en "Limpiar"
   - Escribir tu nombre en cursiva
   - ✅ VERIFICAR: Cada trazo debe aparecer donde está el cursor

7. **Guardar Firma:**
   - Clic en "Guardar Firma"
   - ✅ Botón debería cambiar a "✓ Firma Guardada"
   - ✅ Mensaje "Firma guardada exitosamente"

**Resultado Esperado:** ✅ PASS - Firma se dibuja sin desplazamiento

---

### ✅ TEST 3: Verificar Bug Fix #2 - Firma con SCROLL

**Objetivo:** Confirmar que la firma funciona correctamente incluso con scroll.

**Pasos:**

1. **Crear espacio para scroll:**
   - En DevTools (F12), ir a "Console"
   - Ejecutar:
     ```javascript
     // Agregar espacio arriba para forzar scroll
     document.body.style.paddingTop = '1000px';
     ```

2. **Scroll hacia arriba:**
   - Hacer scroll hasta el tope de la página

3. **Scroll de vuelta al canvas:**
   - Hacer scroll hacia abajo hasta ver el canvas de firma

4. **Intentar dibujar:**
   - Dibujar una firma cualquiera
   - ✅ VERIFICAR: La firma debe aparecer donde está el cursor
   - ❌ FALLA: Si aparece desplazada por el scroll

5. **Limpiar test:**
   ```javascript
   document.body.style.paddingTop = '0px';
   ```

**Resultado Esperado:** ✅ PASS - Firma funciona correctamente con scroll

---

### ✅ TEST 4: Verificar Bug Fix #2 - Firma RESPONSIVE

**Objetivo:** Confirmar que la firma funciona en diferentes tamaños de ventana.

**Pasos:**

1. **Ventana Grande (Desktop):**
   - Maximizar ventana del navegador
   - Dibujar firma
   - ✅ VERIFICAR: Funciona correctamente

2. **Ventana Mediana (Tablet):**
   - Abrir DevTools (F12)
   - Redimensionar ventana a ~768px de ancho
   - Clic en "Limpiar"
   - Dibujar firma
   - ✅ VERIFICAR: Funciona correctamente

3. **Ventana Pequeña (Mobile):**
   - Redimensionar ventana a ~375px de ancho
   - Clic en "Limpiar"
   - Dibujar firma
   - ✅ VERIFICAR: Funciona correctamente

4. **Toggle Responsive Mode:**
   - En DevTools, ir a "Toggle device toolbar" (Ctrl+Shift+M)
   - Probar diferentes dispositivos:
     - iPhone SE
     - iPhone 12 Pro
     - iPad Air
     - Samsung Galaxy S20
   - Dibujar firma en cada uno
   - ✅ VERIFICAR: Funciona en todos

**Resultado Esperado:** ✅ PASS - Firma funciona en todos los tamaños

---

### ✅ TEST 5: Verificar Firma TOUCH (Móvil/Tablet)

**Objetivo:** Confirmar que la firma funciona con touch events.

**Pasos:**

1. **Opción A - Dispositivo Real:**
   - Abrir la app en tu teléfono/tablet
   - Ir a envío EN_CURSO
   - Usar dedo para dibujar firma
   - ✅ VERIFICAR: Trazo aparece donde está el dedo
   - ✅ VERIFICAR: No hace scroll mientras dibujas

2. **Opción B - Chrome DevTools Touch Simulation:**
   - En DevTools, activar "Toggle device toolbar" (Ctrl+Shift+M)
   - Seleccionar dispositivo móvil (ej: iPhone 12 Pro)
   - En la parte superior, asegurarse que "Touch" esté activado
   - Usar mouse para simular touch
   - Dibujar firma
   - ✅ VERIFICAR: Funciona correctamente

3. **Test de Scroll Prevention:**
   - Intentar dibujar firma mientras arrastras hacia arriba/abajo
   - ✅ VERIFICAR: NO debe hacer scroll, solo dibujar

**Resultado Esperado:** ✅ PASS - Touch funciona correctamente

---

### ✅ TEST 6: Flujo Completo de Evidencias

**Objetivo:** Verificar el flujo completo de evidencias.

**Pasos:**

1. **Subir Foto:**
   - Seleccionar foto
   - Subir foto
   - ✅ Ver "✓ Foto Subida"

2. **Dibujar y Guardar Firma:**
   - Dibujar firma
   - Guardar firma
   - ✅ Ver "✓ Firma Guardada"

3. **Seleccionar Método de Pago:**
   - Seleccionar "Efectivo" (o cualquier método)
   - Clic en "Confirmar Método de Pago"
   - ✅ Ver "✓ Pago Registrado - Entrega Completada"

4. **Verificar Cambio de Estado:**
   - La página debería recargar
   - Estado del envío debería cambiar a "ENTREGADO"
   - Sección de evidencias debería desaparecer (solo mostrar en EN_CURSO)

5. **Ver Evidencias como Tienda:**
   - Logout del motorizado
   - Login como tienda (dueña del envío)
   - Ir a Dashboard → Envíos
   - Buscar el envío recién entregado
   - Clic en el envío
   - ✅ Debería aparecer sección "Comprobante de Entrega"
   - ✅ Debe mostrar foto
   - ✅ Debe mostrar firma
   - ✅ Debe mostrar método de pago
   - ✅ Debe mostrar fecha/hora de entrega

6. **Imprimir Comprobante:**
   - Clic en "Imprimir Comprobante"
   - ✅ Vista de impresión debería verse bien

**Resultado Esperado:** ✅ PASS - Flujo completo funciona

---

## 📊 CHECKLIST DE VERIFICACIÓN

### Bug Fix #1 - Upload de Foto:
- [ ] Token se envía en el header Authorization
- [ ] Logs aparecen en consola del navegador
- [ ] Logs aparecen en terminal del servidor
- [ ] Foto se sube sin error de autenticación
- [ ] Archivo aparece en `backend/uploads/evidencias/`
- [ ] Botón cambia a "✓ Foto Subida"
- [ ] Mensaje de éxito aparece

### Bug Fix #2 - Firma Canvas:
- [ ] Firma se dibuja donde está el cursor (desktop)
- [ ] Firma se dibuja donde está el dedo (touch)
- [ ] Funciona correctamente con scroll
- [ ] Funciona en diferentes tamaños de ventana
- [ ] No hace scroll durante dibujo en móvil
- [ ] Botón "Limpiar" funciona
- [ ] Botón "Guardar Firma" funciona
- [ ] Firma se guarda correctamente

### Flujo Completo:
- [ ] Foto + Firma + Método de pago funcionan juntos
- [ ] Estado cambia a ENTREGADO
- [ ] Tienda puede ver evidencias
- [ ] Comprobante se puede imprimir

---

## 🐛 QUÉ HACER SI UN TEST FALLA

### Test 1 Falla (Upload Foto):

**Error: "No estás autenticado"**
1. Verificar en Console: `localStorage.getItem('token')`
2. Si es `null`, hacer login nuevamente
3. Si existe, copiar el token y verificar en https://jwt.io que no esté expirado
4. Verificar que el usuario tiene role MOTORIZADO

**Error: "No se ha proporcionado ningún archivo"**
1. Verificar que seleccionaste un archivo
2. Verificar tamaño (< 5MB)
3. Verificar formato (JPG o PNG)

**Error: "No estás asignado a este envío"**
1. Verificar que el envío tiene una oferta ACEPTADA de este motorizado
2. Ver tabla `ofertas` en DB

**Otros errores:**
- Ver logs de consola (frontend)
- Ver logs de terminal (backend)
- Copiar errores completos para análisis

### Test 2-5 Falla (Firma Desplazada):

**Firma aparece desplazada:**
1. Verificar que aplicaste los cambios correctamente
2. Verificar que la función `getCanvasCoordinates` existe
3. Verificar que `startDrawing` y `draw` la están usando
4. Hacer hard refresh (Ctrl+Shift+R)
5. Limpiar caché del navegador

**Canvas no responde:**
1. Verificar errores en consola
2. Verificar que el canvas tiene width y height
3. Verificar que el contexto 2D se obtiene correctamente

---

## ✅ RESULTADO ESPERADO FINAL

Después de ejecutar todos los tests:

```
✅ TEST 1: Upload de Foto - PASS
✅ TEST 2: Firma Desktop - PASS  
✅ TEST 3: Firma con Scroll - PASS
✅ TEST 4: Firma Responsive - PASS
✅ TEST 5: Firma Touch - PASS
✅ TEST 6: Flujo Completo - PASS

🎉 TODOS LOS TESTS PASARON
```

---

## 📝 NOTAS

- Los logs de `[DEBUG]` son temporales para verificar los fixes
- En producción, considera removerlos o hacerlos condicionales
- Los tests deben ejecutarse en orden (1 → 6)
- Si un test falla, no continuar hasta resolverlo
- Documentar cualquier comportamiento inesperado

**¡Buena suerte con el testing!** 🚀


