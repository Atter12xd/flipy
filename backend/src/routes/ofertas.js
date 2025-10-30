const express = require('express');
const router = express.Router();
const ofertasController = require('../controllers/ofertasController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { verificarSuscripcionActiva } = require('../middleware/suscripcionMiddleware');

/**
 * POST /api/ofertas
 * Crear una nueva oferta (solo motorizados con suscripción activa)
 */
router.post(
  '/',
  verifyToken,
  requireRole(['MOTORIZADO']),
  verificarSuscripcionActiva,
  ofertasController.createOferta
);

/**
 * GET /api/ofertas/envio/:envioId
 * Obtener todas las ofertas de un envío (cualquier usuario autenticado)
 */
router.get(
  '/envio/:envioId',
  verifyToken,
  ofertasController.getOfertasByEnvio
);

/**
 * PUT /api/ofertas/:id/aceptar
 * Aceptar una oferta (solo tiendas)
 */
router.put(
  '/:id/aceptar',
  verifyToken,
  requireRole(['TIENDA']),
  ofertasController.aceptarOferta
);

module.exports = router;
