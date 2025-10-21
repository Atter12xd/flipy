const express = require('express');
const router = express.Router();
const enviosController = require('../controllers/enviosController');
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

/**
 * @route   POST /api/envios
 * @desc    Crear nuevo envío
 * @access  Private (TIENDA)
 */
router.post('/', 
  verifyToken, 
  requireRole(['TIENDA']), 
  enviosController.createEnvio
);

/**
 * @route   GET /api/envios
 * @desc    Obtener envíos (TIENDA: sus envíos, MOTORIZADO: disponibles)
 * @access  Private
 */
router.get('/', 
  verifyToken, 
  enviosController.getEnvios
);

/**
 * @route   GET /api/envios/:id
 * @desc    Obtener envío por ID
 * @access  Private
 */
router.get('/:id', 
  verifyToken, 
  enviosController.getEnvioById
);

/**
 * @route   DELETE /api/envios/:id
 * @desc    Cancelar envío
 * @access  Private (TIENDA - dueño del envío)
 */
router.delete('/:id', 
  verifyToken, 
  requireRole(['TIENDA']), 
  enviosController.cancelEnvio
);

// Ruta de prueba
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Envio routes working',
    routes: [
      'POST /api/envios',
      'GET /api/envios',
      'GET /api/envios/:id',
      'DELETE /api/envios/:id'
    ]
  });
});

module.exports = router;
