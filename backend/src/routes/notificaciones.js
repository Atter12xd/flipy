// FLIPY - Rutas de Notificaciones
// Endpoints para consultar notificaciones enviadas

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  getNotificaciones,
  getEstadisticas,
  getAllNotificaciones
} = require('../controllers/notificacionesController');

// Todas las rutas requieren autenticación
router.use(verifyToken);

/**
 * GET /api/notificaciones
 * Obtener notificaciones del usuario autenticado
 * Query params: ?tipo=whatsapp&limite=50
 */
router.get('/', getNotificaciones);

/**
 * GET /api/notificaciones/estadisticas
 * Obtener estadísticas de notificaciones (últimas 24 horas)
 */
router.get('/estadisticas', getEstadisticas);

/**
 * GET /api/notificaciones/all
 * Obtener todas las notificaciones (solo admin)
 */
router.get('/all', requireRole(['ADMIN']), getAllNotificaciones);

module.exports = router;




