// FLIPY - Rutas de Suscripciones
// Endpoints para gestión de suscripciones y pagos

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  getEstadoSuscripcion,
  simularPago,
  getHistorialPagos
} = require('../controllers/suscripcionController');

// Todas las rutas requieren autenticación y rol MOTORIZADO
router.use(verifyToken);
router.use(requireRole(['MOTORIZADO']));

/**
 * GET /api/suscripcion/estado
 * Obtener el estado actual de la suscripción del motorizado
 */
router.get('/estado', getEstadoSuscripcion);

/**
 * POST /api/suscripcion/simular-pago
 * Simular un pago de suscripción (para testing)
 * Body: { metodoPago: "yape" | "tarjeta" | "transferencia" }
 */
router.post('/simular-pago', simularPago);

/**
 * GET /api/suscripcion/historial
 * Obtener historial de pagos del motorizado
 */
router.get('/historial', getHistorialPagos);

module.exports = router;

