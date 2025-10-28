const express = require('express');
const router = express.Router();
const publicTrackingController = require('../controllers/publicTrackingController');

/**
 * Ruta pública para rastrear envío por token
 * NO requiere autenticación
 */
router.get('/rastreo/:token', publicTrackingController.getEnvioByToken);

module.exports = router;



