const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

/**
 * EJEMPLO DE USO DE MIDDLEWARES DE AUTENTICACIÓN
 * 
 * Este archivo muestra cómo usar los middlewares de autenticación y roles
 * en tus rutas protegidas.
 */

// Ruta pública (sin autenticación)
router.get('/public', (req, res) => {
  res.json({ message: 'Esta es una ruta pública' });
});

// Ruta protegida (requiere autenticación)
router.get('/protected', verifyToken, (req, res) => {
  res.json({ 
    message: 'Esta es una ruta protegida',
    user: req.user // Contiene: { userId, email, role }
  });
});

// Ruta solo para motorizados
router.get('/motorizado-only', verifyToken, requireRole(['MOTORIZADO']), (req, res) => {
  res.json({ 
    message: 'Solo motorizados pueden ver esto',
    user: req.user
  });
});

// Ruta solo para tiendas
router.get('/tienda-only', verifyToken, requireRole(['TIENDA']), (req, res) => {
  res.json({ 
    message: 'Solo tiendas pueden ver esto',
    user: req.user
  });
});

// Ruta para motorizados Y admins
router.get('/motorizado-or-admin', verifyToken, requireRole(['MOTORIZADO', 'ADMIN']), (req, res) => {
  res.json({ 
    message: 'Motorizados o admins pueden ver esto',
    user: req.user
  });
});

// Ruta solo para admins
router.get('/admin-only', verifyToken, requireRole(['ADMIN']), (req, res) => {
  res.json({ 
    message: 'Solo administradores pueden ver esto',
    user: req.user
  });
});

module.exports = router;

