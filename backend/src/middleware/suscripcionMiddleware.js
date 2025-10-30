// FLIPY - Middleware de Verificación de Suscripción
// Protege endpoints que requieren suscripción activa

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware para verificar que el motorizado tiene suscripción activa
 * Valida trial O suscripción pagada
 */
const verificarSuscripcionActiva = async (req, res, next) => {
  try {
    console.log('[MIDDLEWARE SUSCRIPCION] Usuario:', req.user);
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Solo aplicar a motorizados
    if (userRole !== 'MOTORIZADO') {
      return next(); // Permitir otros roles (admin, tienda)
    }

    // Buscar motorizado
    const motorizado = await prisma.motorizado.findUnique({
      where: { userId }
    });
    
    console.log('[MIDDLEWARE SUSCRIPCION] Motorizado encontrado:', motorizado ? 'SI' : 'NO');

    if (!motorizado) {
      return res.status(404).json({
        success: false,
        message: 'Motorizado no encontrado'
      });
    }

    const ahora = new Date();
    let tieneAcceso = false;

    // Verificar si está en trial y no ha expirado
    if (motorizado.trialHasta && new Date(motorizado.trialHasta) > ahora) {
      tieneAcceso = true;
    }
    // Verificar si tiene suscripción pagada activa
    else if (
      motorizado.suscripcionActiva && 
      motorizado.proximoPago && 
      new Date(motorizado.proximoPago) > ahora
    ) {
      tieneAcceso = true;
    }

    if (!tieneAcceso) {
      return res.status(403).json({
        success: false,
        message: 'Suscripción inactiva. Renueva tu plan para continuar.',
        bloqueado: true,
        codigo: 'SUSCRIPCION_VENCIDA'
      });
    }

    // Adjuntar información de motorizado a la request para uso posterior
    req.motorizado = motorizado;
    next();

  } catch (error) {
    console.error('Error al verificar suscripción:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar estado de suscripción',
      error: error.message
    });
  }
};

module.exports = {
  verificarSuscripcionActiva
};

