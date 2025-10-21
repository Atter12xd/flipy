/**
 * Script de prueba para el sistema de autenticación
 * 
 * Uso:
 * 1. Asegúrate de que el servidor esté corriendo: npm run dev
 * 2. Ejecuta: node test-auth.js
 */

const BASE_URL = 'http://localhost:3000/api';

// Función helper para hacer requests
async function request(endpoint, method = 'GET', body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();
  
  return {
    status: response.status,
    data
  };
}

// Tests
async function runTests() {
  console.log('🧪 Iniciando tests de autenticación...\n');

  try {
    // 1. Registrar Motorizado
    console.log('1️⃣  Registrando motorizado...');
    const motorizadoData = {
      email: `motorizado${Date.now()}@test.com`,
      password: 'test123',
      phone: '+51987654321',
      licencia: `LIC${Date.now()}`,
      vehiculo: 'Moto Yamaha'
    };

    const motorizadoResponse = await request('/auth/register/motorizado', 'POST', motorizadoData);
    console.log('Status:', motorizadoResponse.status);
    console.log('Response:', JSON.stringify(motorizadoResponse.data, null, 2));
    console.log('✅ Motorizado registrado\n');

    const motorizadoToken = motorizadoResponse.data.token;

    // 2. Registrar Tienda
    console.log('2️⃣  Registrando tienda...');
    const tiendaData = {
      email: `tienda${Date.now()}@test.com`,
      password: 'test123',
      phone: '+51987654322',
      nombre: 'Tienda Test',
      direccion: 'Av. Principal 123'
    };

    const tiendaResponse = await request('/auth/register/tienda', 'POST', tiendaData);
    console.log('Status:', tiendaResponse.status);
    console.log('Response:', JSON.stringify(tiendaResponse.data, null, 2));
    console.log('✅ Tienda registrada\n');

    const tiendaToken = tiendaResponse.data.token;

    // 3. Login con Motorizado
    console.log('3️⃣  Login con motorizado...');
    const loginMotorizado = await request('/auth/login', 'POST', {
      email: motorizadoData.email,
      password: motorizadoData.password
    });
    console.log('Status:', loginMotorizado.status);
    console.log('Response:', JSON.stringify(loginMotorizado.data, null, 2));
    console.log('✅ Login motorizado exitoso\n');

    // 4. Login con Tienda
    console.log('4️⃣  Login con tienda...');
    const loginTienda = await request('/auth/login', 'POST', {
      email: tiendaData.email,
      password: tiendaData.password
    });
    console.log('Status:', loginTienda.status);
    console.log('Response:', JSON.stringify(loginTienda.data, null, 2));
    console.log('✅ Login tienda exitoso\n');

    // 5. Probar ruta protegida con token de motorizado
    console.log('5️⃣  Accediendo a ruta de prueba con token de motorizado...');
    const protectedRoute = await request('/envios/test', 'GET', null, motorizadoToken);
    console.log('Status:', protectedRoute.status);
    console.log('Response:', JSON.stringify(protectedRoute.data, null, 2));
    console.log('✅ Acceso a ruta protegida exitoso\n');

    // 6. Intentar login con credenciales incorrectas
    console.log('6️⃣  Intentando login con credenciales incorrectas...');
    const failedLogin = await request('/auth/login', 'POST', {
      email: motorizadoData.email,
      password: 'wrongpassword'
    });
    console.log('Status:', failedLogin.status);
    console.log('Response:', JSON.stringify(failedLogin.data, null, 2));
    console.log('✅ Error manejado correctamente\n');

    // 7. Intentar acceder a ruta protegida sin token
    console.log('7️⃣  Intentando acceder a ruta protegida sin token...');
    const noToken = await request('/envios/test', 'GET');
    console.log('Status:', noToken.status);
    console.log('Response:', JSON.stringify(noToken.data, null, 2));
    console.log('✅ Error manejado correctamente\n');

    console.log('🎉 Todos los tests completados exitosamente!');

  } catch (error) {
    console.error('❌ Error en los tests:', error.message);
  }
}

// Ejecutar tests
runTests();

