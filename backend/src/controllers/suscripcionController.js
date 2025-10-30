// FLIPY - Controlador de Suscripciones
// Maneja lógica de pagos simulados, trials y verificación de acceso

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Obtener el estado actual de la suscripción del motorizado
 * GET /api/suscripcion/estado
 */
const getEstadoSuscripcion = async (req, res) => {
  try {
    console.log('[SUSCRIPCION] Usuario:', req.user);
    const userId = req.user.userId;

    // Buscar motorizado
    const motorizado = await prisma.motorizado.findUnique({
      where: { userId }
    });
    
    console.log('[SUSCRIPCION] Motorizado encontrado:', motorizado ? 'SI' : 'NO');

    if (!motorizado) {
      return res.status(404).json({
        success: false,
        message: 'Motorizado no encontrado'
      });
    }

    const ahora = new Date();
    let suscripcionActiva = false;
    let bloqueado = false;
    let diasRestantes = 0;
    let trialHasta = null;
    let mensaje = '';

    // Verificar si está en trial
    if (motorizado.trialHasta && new Date(motorizado.trialHasta) > ahora) {
      suscripcionActiva = true;
      trialHasta = motorizado.trialHasta;
      const diffTime = new Date(motorizado.trialHasta) - ahora;
      diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      mensaje = `Trial activo - ${diasRestantes} días restantes`;
    } 
    // Verificar si tiene suscripción pagada activa
    else if (motorizado.suscripcionActiva && motorizado.proximoPago && new Date(motorizado.proximoPago) > ahora) {
      suscripcionActiva = true;
      const diffTime = new Date(motorizado.proximoPago) - ahora;
      diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      mensaje = `Suscripción activa - ${diasRestantes} días hasta próximo pago`;
    }
    // Suscripción vencida o inactiva
    else {
      bloqueado = true;
      mensaje = 'Suscripción inactiva. Renueva tu plan para continuar.';
    }

    return res.json({
      success: true,
      data: {
        planActual: motorizado.planActual,
        suscripcionActiva,
        bloqueado,
        trialHasta,
        diasRestantes,
        proximoPago: motorizado.proximoPago,
        ultimoPago: motorizado.ultimoPago,
        mensaje
      }
    });

  } catch (error) {
    console.error('Error al obtener estado de suscripción:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener estado de suscripción',
      error: error.message
    });
  }
};

/**
 * Simular pago de suscripción
 * POST /api/suscripcion/simular-pago
 * Body: { metodoPago: "yape" | "tarjeta" | "transferencia" }
 */
const simularPago = async (req, res) => {
  try {
    console.log('[SUSCRIPCION] Simulando pago - Usuario:', req.user);
    const userId = req.user.userId;
    const { metodoPago } = req.body;

    // Validar método de pago
    const metodosValidos = ['yape', 'tarjeta', 'transferencia'];
    if (!metodoPago || !metodosValidos.includes(metodoPago)) {
      return res.status(400).json({
        success: false,
        message: 'Método de pago inválido. Opciones: yape, tarjeta, transferencia'
      });
    }

    // Buscar motorizado
    const motorizado = await prisma.motorizado.findUnique({
      where: { userId }
    });

    if (!motorizado) {
      return res.status(404).json({
        success: false,
        message: 'Motorizado no encontrado'
      });
    }

    // Simular pago exitoso
    const ahora = new Date();
    const proximoPago = new Date(ahora);
    proximoPago.setDate(proximoPago.getDate() + 30); // 30 días después

    // Crear registro de pago
    const registroPago = {
      fecha: ahora.toISOString(),
      monto: 110.00, // S/ 110 (equivalente a $29 USD)
      metodoPago,
      estado: 'completado',
      transaccionId: `SIM-${Date.now()}`, // ID simulado
      tipo: 'mensual'
    };

    // Actualizar historial de pagos
    const historialActualizado = [
      registroPago,
      ...(motorizado.historialPagos || [])
    ];

    // Actualizar motorizado
    const motorizadoActualizado = await prisma.motorizado.update({
      where: { userId },
      data: {
        suscripcionActiva: true,
        planActual: 'mensual',
        ultimoPago: ahora,
        proximoPago: proximoPago,
        historialPagos: historialActualizado
      }
    });

    return res.json({
      success: true,
      message: '¡Pago simulado exitoso! Tu suscripción está activa.',
      data: {
        pago: registroPago,
        suscripcion: {
          planActual: motorizadoActualizado.planActual,
          suscripcionActiva: motorizadoActualizado.suscripcionActiva,
          proximoPago: motorizadoActualizado.proximoPago,
          ultimoPago: motorizadoActualizado.ultimoPago
        }
      }
    });

  } catch (error) {
    console.error('Error al simular pago:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar el pago',
      error: error.message
    });
  }
};

/**
 * Obtener historial de pagos del motorizado
 * GET /api/suscripcion/historial
 */
const getHistorialPagos = async (req, res) => {
  try {
    console.log('[SUSCRIPCION] Historial - Usuario:', req.user);
    const userId = req.user.userId;

    // Buscar motorizado
    const motorizado = await prisma.motorizado.findUnique({
      where: { userId },
      select: {
        historialPagos: true
      }
    });

    if (!motorizado) {
      return res.status(404).json({
        success: false,
        message: 'Motorizado no encontrado'
      });
    }

    // Ordenar por fecha descendente (más reciente primero)
    const historial = (motorizado.historialPagos || []).sort((a, b) => {
      return new Date(b.fecha) - new Date(a.fecha);
    });

    return res.json({
      success: true,
      data: historial
    });

  } catch (error) {
    console.error('Error al obtener historial de pagos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener historial de pagos',
      error: error.message
    });
  }
};

/**
 * Middleware: Verificar si el motorizado tiene acceso activo
 * Se puede usar en rutas que requieren suscripción activa
 */
const verificarAcceso = async (req, res, next) => {
  try {
    console.log('[SUSCRIPCION] Verificar acceso - Usuario:', req.user);
    const userId = req.user.userId;

    // Buscar motorizado
    const motorizado = await prisma.motorizado.findUnique({
      where: { userId }
    });

    if (!motorizado) {
      return res.status(404).json({
        success: false,
        message: 'Motorizado no encontrado'
      });
    }

    const ahora = new Date();
    let tieneAcceso = false;

    // Verificar trial activo
    if (motorizado.trialHasta && new Date(motorizado.trialHasta) > ahora) {
      tieneAcceso = true;
    }
    // Verificar suscripción pagada activa
    else if (motorizado.suscripcionActiva && motorizado.proximoPago && new Date(motorizado.proximoPago) > ahora) {
      tieneAcceso = true;
    }

    if (!tieneAcceso) {
      return res.status(403).json({
        success: false,
        message: 'Suscripción inactiva. Renueva tu plan para continuar.',
        bloqueado: true
      });
    }

    // Adjuntar información de motorizado a la request
    req.motorizado = motorizado;
    next();

  } catch (error) {
    console.error('Error al verificar acceso:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar acceso',
      error: error.message
    });
  }
};

module.exports = {
  getEstadoSuscripcion,
  simularPago,
  getHistorialPagos,
  verificarAcceso
};

