const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  updateUbicacion,
  getUbicacion,
  cambiarEstadoEnvio
} = require('../controllers/trackingController');

/**
 * POST /api/tracking/:envioId/ubicacion
 * Actualizar ubicación del motorizado
 * Requiere: MOTORIZADO
 */
router.post(
  '/:envioId/ubicacion',
  verifyToken,
  requireRole(['MOTORIZADO']),
  updateUbicacion
);

/**
 * GET /api/tracking/:envioId/ubicacion
 * Obtener ubicación actual del envío
 * Requiere: Autenticación (TIENDA dueña o MOTORIZADO asignado)
 */
router.get(
  '/:envioId/ubicacion',
  verifyToken,
  getUbicacion
);

/**
 * PUT /api/tracking/:envioId/estado
 * Cambiar estado del envío (ASIGNADO -> EN_CURSO -> ENTREGADO)
 * Requiere: MOTORIZADO
 */
router.put(
  '/:envioId/estado',
  verifyToken,
  requireRole(['MOTORIZADO']),
  cambiarEstadoEnvio
);

module.exports = router;

